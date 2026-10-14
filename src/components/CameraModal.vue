<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Project } from '../types'
import { useModal } from '../useModal'

// EarthCam's interactive player for one site, in a dialog.

const props = defineProps<{ project: Project | null }>()
const emit = defineEmits<{ close: [] }>()

const close = () => emit('close')
const closeBtn = ref<HTMLButtonElement | null>(null)
useModal(() => !!props.project, closeBtn, close)

// EarthCam only serves its interactive player to iframes at least ~600px wide,
// so on narrow screens render it at 640px and scale it down to fit.
const MIN_PLAYER_WIDTH = 640
const monitor = ref<HTMLElement | null>(null)
const monitorWidth = ref(MIN_PLAYER_WIDTH)
let observer: ResizeObserver | undefined

watch(monitor, (el) => {
  observer?.disconnect()
  if (!el) return
  observer = new ResizeObserver(([entry]) => {
    if (entry) monitorWidth.value = entry.contentRect.width
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const frameStyle = computed(() => {
  if (monitorWidth.value >= MIN_PLAYER_WIDTH) return undefined
  return {
    width: `${MIN_PLAYER_WIDTH}px`,
    height: `${(MIN_PLAYER_WIDTH * 9) / 16}px`,
    transform: `scale(${monitorWidth.value / MIN_PLAYER_WIDTH})`,
    transformOrigin: '0 0',
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="project" class="modal-overlay" @click="close">
      <div
        class="cam-modal-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="`${project.name} live camera`"
        @click.stop
      >
        <header class="cam-modal-head">
          <div>
            <p class="kicker">{{ project.location }}</p>
            <h2 class="cam-modal-title">{{ project.name }}</h2>
          </div>
          <button ref="closeBtn" type="button" class="cam-modal-close" aria-label="Close" @click="close">×</button>
        </header>

        <div ref="monitor" class="monitor">
          <div class="monitor-placeholder" aria-hidden="true">Loading live view…</div>
          <iframe
            :src="project.earthcam"
            allow="fullscreen"
            class="monitor-iframe"
            :style="frameStyle"
            :title="`Live EarthCam feed for ${project.name}`"
          />
        </div>

        <div class="cam-modal-body">
          <p>{{ project.desc }}</p>
          <p><strong>Status:</strong> {{ project.status }}</p>
          <p><RouterLink :to="{ name: 'cameras', hash: `#${project.id}` }" @click="close">Browse past photos from this camera →</RouterLink></p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cam-modal-panel {
  width: min(1280px, 100%);
  max-height: 100%;
  overflow: auto;
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  cursor: default;
}

.cam-modal-head {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: 14px 16px;
}

.cam-modal-title {
  font-size: 22px;
  line-height: 1.2;
}

.cam-modal-close {
  margin-left: auto;
  width: 36px;
  height: 36px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: var(--color-background-alt);
  color: var(--color-text-primary);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.cam-modal-close:hover {
  background: var(--color-border);
}

.monitor {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-chrome);
}

.monitor-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.monitor-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.cam-modal-body {
  display: grid;
  gap: 4px;
  padding: 14px 16px 16px;
}

.cam-modal-body p {
  font-size: 15px;
  line-height: 1.5;
}

.cam-modal-body strong {
  font-weight: var(--font-weight-semibold);
}
</style>
