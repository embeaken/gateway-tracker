<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { projects } from '../assets/data'
import { cdnSiteImage, cdnSiteSrcset } from '../imageCdn'
import type { CamView } from '../earthcam'
import type { Project } from '../types'
import { useCams } from '../useCams'
import CameraModal from './CameraModal.vue'

// The latest still from each project's featured camera view, via /api/cams
// (see src/earthcam.ts). Click a tile for EarthCam's live player.

const { data, failed } = useCams()
const now = ref(Date.now())

let tick: number | undefined
onMounted(() => (tick = window.setInterval(() => (now.value = Date.now()), 30_000)))
onUnmounted(() => window.clearInterval(tick))

type Tile = { project: Project; view?: CamView }

const tiles = computed<Tile[]>(() =>
  projects.map((project) => {
    const views = data.value?.sites.find((s) => s.projectId === project.id)?.views ?? []
    return { project, view: views[project.featuredView ?? 0] ?? views[0] }
  }),
)

const ago = (iso: string) => {
  const min = Math.max(0, Math.round((now.value - Date.parse(iso)) / 60_000))
  if (min < 60) return `${min}m ago`
  const h = Math.round(min / 60)
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`
}

/** EarthCam refreshes every ~15 min; flag anything well past that */
const isStale = (iso: string) => now.value - Date.parse(iso) > 2 * 3600_000

const open = ref<Tile | null>(null)
</script>

<template>
  <div class="cam-wall" :aria-busy="!data && !failed">
    <p v-if="failed" class="cam-error">Couldn't reach the cameras right now. Open a site below to try EarthCam directly.</p>

    <ul class="cam-grid">
      <li v-for="tile in tiles" :key="tile.project.id" class="cam-tile">
        <button
          type="button"
          class="cam-button"
          :aria-label="`Open live camera: ${tile.project.name}`"
          @click="open = tile"
        >
          <img
            v-if="tile.view?.frame"
            :src="cdnSiteImage(tile.view.frame, 640)"
            :srcset="cdnSiteSrcset(tile.view.frame, [480, 640, 960])"
            sizes="(min-width: 1600px) 20vw, (min-width: 900px) 33vw, 100vw"
            :alt="`Latest view: ${tile.project.name}`"
            loading="lazy"
          />
          <span v-else class="cam-empty">{{ data || failed ? 'No recent image' : '' }}</span>
          <span class="cam-cap">
            <span class="cam-name">{{ tile.project.name }}</span>
            <time
              v-if="tile.view?.takenAt"
              class="cam-age"
              :class="isStale(tile.view.takenAt) && 'cam-age--stale'"
              :datetime="tile.view.takenAt"
              :title="new Date(tile.view.takenAt).toLocaleString()"
              >{{ ago(tile.view.takenAt) }}</time
            >
          </span>
        </button>
      </li>
    </ul>

    <CameraModal :project="open?.project ?? null" :view="open?.view" @close="open = null" />
  </div>
</template>

<style scoped>
.cam-error {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--color-alert);
}

.cam-wall {
  container-type: inline-size;
}

/* Five sites, so rows always fill: one row when there's room, otherwise
   2 big + 3 small (or 1 big + 2 + 2 on phones). */
.cam-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.cam-tile:first-child {
  grid-column: span 2;
}

@container (min-width: 560px) {
  .cam-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  .cam-tile:nth-child(-n + 2) {
    grid-column: span 3;
  }
  .cam-tile:nth-child(n + 3) {
    grid-column: span 2;
  }
}

@container (min-width: 1600px) {
  .cam-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .cam-tile:nth-child(n) {
    grid-column: auto;
  }
}

.cam-button {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-chrome);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.cam-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.cam-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--transition-slow);
}

.cam-button:hover img {
  transform: scale(1.03);
}

.cam-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
}

.cam-cap {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 22px 8px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.78));
  color: #fff;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
}

@container (max-width: 560px) {
  .cam-cap {
    padding: 16px 6px 4px;
    font-size: 11px;
  }
}

.cam-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cam-age {
  margin-left: auto;
  flex: none;
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.cam-age--stale {
  color: var(--color-alert-soft);
}
</style>
