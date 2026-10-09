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
</script>

<template>
  <article :id="`cam-${project.id}`" class="cam-card" :class="{ 'cam-card--featured': featured }">
    <div class="monitor">
      <div class="monitor-placeholder" aria-hidden="true">
        <span class="placeholder-title">Loading live view…</span>
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
        <span class="cam-live">Live view</span>
        <span aria-hidden="true">·</span>
        <span class="tabular">Camera {{ index + 1 }}</span>
        <template v-if="location">
          <span aria-hidden="true">·</span>
          <span>{{ location }}</span>
        </template>
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
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-muted);
}

.monitor {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--color-navy);
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
    radial-gradient(ellipse at center, #1C3A63, var(--color-navy));
  pointer-events: none;
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
  gap: 4px 8px;
  margin: 0;
}

.cam-live {
  color: var(--color-progress);
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
  background: var(--color-primary-muted);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.cam-facts dd {
  margin: 2px 0 0;
  font-size: 14px;
}

/* Featured cam: wider, title a touch bigger */
.cam-card--featured .cam-title {
  font-size: 28px;
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
