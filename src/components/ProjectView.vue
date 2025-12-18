<script setup lang="ts">
import type { Project } from '../types'
defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="project">
    <h1>{{ project.name }}</h1>
    <p>{{ project.desc }}</p>
    <iframe :src="project.earthcam" />
  </div>
</template>

<style scoped>
  .project {
    h1 {
      font-size: 24px;
    }
    p {
      margin-top: 0;
      font-size: 18px;
      max-width: 85%;
    }
    iframe {
      width: 100%;
      height: 720px;
    }
  }
</style>
