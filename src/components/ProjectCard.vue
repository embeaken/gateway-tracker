<script setup lang="ts">
import type { Project } from '../types'
import FactsList from './FactsList.vue'

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="project-card">
    <h2 class="project-title">{{ project.name }}</h2>
    <p class="project-description">{{ project.desc }}</p>

    <FactsList :facts="project.facts" />

    <div class="earthcam-container">
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
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  transition: box-shadow var(--transition-base);
}

.project-card:hover {
  box-shadow: var(--shadow-md);
}

.project-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.project-description {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
  max-width: 85%;
}

.earthcam-container {
  width: 100%;
  margin-top: var(--spacing-md);
}

.earthcam-iframe {
  width: 100%;
  height: 720px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: #000;
}

@media (max-width: 1280px) {
  .earthcam-iframe {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .project-card {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .project-title {
    font-size: var(--font-size-md);
  }

  .project-description {
    font-size: var(--font-size-sm);
    max-width: 100%;
  }

  .earthcam-iframe {
    height: 300px;
  }
}
</style>
