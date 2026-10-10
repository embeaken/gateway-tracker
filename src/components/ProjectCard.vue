<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Project } from '../types'

defineProps<{ project: Project }>()

// EarthCam only serves its interactive player to iframes at least ~600px wide,
// so on narrow screens render it at 640px and scale it down to fit.
const MIN_PLAYER_WIDTH = 640
const monitor = ref<HTMLElement>()
const monitorWidth = ref(MIN_PLAYER_WIDTH)
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!monitor.value) return
  observer = new ResizeObserver(([entry]) => {
    if (entry) monitorWidth.value = entry.contentRect.width
  })
  observer.observe(monitor.value)
})
onUnmounted(() => observer?.disconnect())

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
  <article :id="`cam-${project.id}`" class="cam-card">
    <div ref="monitor" class="monitor">
      <div class="monitor-placeholder" aria-hidden="true">Loading live view…</div>
      <iframe
        :src="project.earthcam"
        allow="fullscreen"
        loading="lazy"
        class="monitor-iframe"
        :style="frameStyle"
        :title="`Live EarthCam feed for ${project.name}`"
      />
    </div>

    <div class="cam-body">
      <p class="kicker">{{ project.location }}</p>
      <h3 class="cam-title">{{ project.name }}</h3>
      <p class="cam-desc">{{ project.desc }}</p>
      <p class="cam-status"><strong>Status:</strong> {{ project.status }}</p>
    </div>
  </article>
</template>

<style scoped>
.cam-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  scroll-margin-top: var(--spacing-lg);
}

.cam-card:target {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-muted);
}

.monitor {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-navy);
}

.monitor-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at center, #1C3A63, var(--color-navy));
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.monitor-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  z-index: 1;
}

:global([data-visual-test="true"]) .monitor-iframe {
  opacity: 0;
}

.cam-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--spacing-sm) 18px 18px;
}

.cam-title {
  margin: 0;
  font-size: 23px;
  line-height: 1.15;
}

.cam-desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.5;
}

.cam-status {
  margin: 4px 0 0;
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.5;
}

.cam-status strong {
  font-weight: var(--font-weight-semibold);
}
</style>
