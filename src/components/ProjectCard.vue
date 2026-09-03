<script setup lang="ts">
import type { Project } from '../types'
import FactsList from './FactsList.vue'

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="project-card">
    <div class="project-header">
      <div>
        <h2 class="project-title">{{ project.name }}</h2>
      </div>
    </div>

    <p class="project-description">{{ project.desc }}</p>

    <FactsList :facts="project.facts" />

    <div class="earthcam-container">
      <div class="earthcam-placeholder" aria-hidden="true">
        <span class="placeholder-title">Live EarthCam feed</span>
        <span class="placeholder-subtitle">Loading construction camera</span>
      </div>
      <iframe
        :src="project.earthcam"
        allow="fullscreen"
        loading="lazy"
        class="earthcam-iframe"
        :title="`Live EarthCam feed for ${project.name}`"
      />
    </div>
  </article>
</template>

<style scoped>
.project-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}

.project-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 94, 113, 0.32);
}

.project-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: 8px;
}

.project-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0;
}

.project-description {
  font-size: 15px;
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  margin: 0 0 10px 0;
  max-width: 980px;
}

.earthcam-container {
  position: relative;
  width: 100%;
  margin-top: 10px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background-color: #000;
}

.earthcam-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  padding: var(--spacing-md);
  background:
    linear-gradient(135deg, rgba(0, 94, 113, 0.28), rgba(0, 0, 0, 0.86)),
    #000;
  color: white;
  text-align: center;
  pointer-events: none;
}

.placeholder-title,
.placeholder-subtitle {
  display: block;
}

.placeholder-title {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.placeholder-subtitle {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}

.earthcam-iframe {
  position: relative;
  width: 100%;
  height: 620px;
  border: none;
  background-color: #000;
  display: block;
  z-index: 1;
}

:global([data-visual-test="true"]) .earthcam-iframe {
  opacity: 0;
}

@media (max-width: 1280px) {
  .earthcam-iframe {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .project-card {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .project-title {
    font-size: var(--font-size-sm);
  }

  .project-header {
    flex-direction: column;
    gap: 8px;
  }

  .project-description {
    font-size: 14px;
    max-width: 100%;
  }

  .earthcam-iframe {
    height: 300px;
  }
}
</style>
