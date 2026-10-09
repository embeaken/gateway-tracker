<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../types'

const props = defineProps<{
  project: Project
  index: number
  featured?: boolean
}>()

const factValue = (label: string) =>
  props.project.facts.find((f) => f.label.toLowerCase() === label.toLowerCase())?.value

const location = computed(() => factValue('Location'))
const status = computed(() => factValue('Construction status'))
const otherFacts = computed(() =>
  props.project.facts.filter((f) => !['location', 'construction status'].includes(f.label.toLowerCase())),
)
const camNumber = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <article :id="`cam-${project.id}`" class="cam-card" :class="{ 'cam-card--featured': featured }">
    <div class="monitor">
      <div class="monitor-placeholder" aria-hidden="true">
        <span class="kicker">Cam {{ camNumber }}</span>
        <span class="placeholder-title">Connecting to EarthCam…</span>
      </div>
      <iframe
        :src="project.earthcam"
        allow="fullscreen"
        loading="lazy"
        class="monitor-iframe"
        :title="`Live EarthCam feed for ${project.name}`"
      />
    </div>

    <div class="cam-body">
      <p class="kicker cam-meta">
        <span class="cam-live"><span class="live-dot" aria-hidden="true"></span>Live</span>
        <span>Cam {{ camNumber }}</span>
        <span v-if="location" class="cam-location">{{ location }}</span>
      </p>
      <h3 class="cam-title">{{ project.name }}</h3>
      <p class="cam-desc">{{ project.desc }}</p>
      <p v-if="status" class="cam-status">
        <span class="status-label">Status</span>
        <span>{{ status }}</span>
      </p>
      <dl v-if="otherFacts.length" class="cam-facts">
        <div v-for="fact in otherFacts" :key="fact.label">
          <dt class="kicker">{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
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
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent), transparent 70%);
}

.monitor {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--color-ink);
}

.monitor-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: white;
  text-align: center;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at center, #17303a, var(--color-ink));
  pointer-events: none;
}

.monitor-placeholder .kicker {
  color: rgba(255, 255, 255, 0.5);
}

.placeholder-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
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

.cam-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  margin: 0;
}

.cam-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-live);
}

.cam-live .live-dot {
  width: 6px;
  height: 6px;
}

.cam-location {
  position: relative;
  padding-left: 12px;
}

.cam-location::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 1px;
  background: currentColor;
}

.cam-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.05;
}

.cam-desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.5;
}

.cam-status {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 6px 0 0;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
  line-height: 1.45;
  font-weight: var(--font-weight-medium);
}

.status-label {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent), transparent 85%);
  color: var(--color-accent-ink);
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cam-facts dd {
  margin: 2px 0 0;
  font-size: 14px;
}

/* Featured cam: wider, title a touch bigger */
.cam-card--featured .cam-title {
  font-size: 30px;
}

@container cams (min-width: 1000px) {
  .cam-card--featured {
    display: grid;
    grid-template-columns: minmax(0, 1.9fr) minmax(220px, 1fr);
  }

  .cam-card--featured .cam-body {
    padding: var(--spacing-md);
    justify-content: center;
  }
}
</style>
