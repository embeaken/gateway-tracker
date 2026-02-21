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
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  transition: box-shadow var(--transition-base);
}

.project-card:hover {
  box-shadow: var(--shadow-md);
}

.project-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.project-description {
  font-size: 15px;
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  margin: 0 0 10px 0;
  max-width: 85%;
}

.earthcam-container {
  width: 100%;
  margin-top: 10px;
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
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .project-title {
    font-size: var(--font-size-sm);
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
