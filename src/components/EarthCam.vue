<script setup lang="ts">
import type { Project } from '../types'
defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="earthcam">
    <h1>{{ project.name }}</h1>
    <p>{{ project.desc }}</p>
    <iframe :src="project.earthcam" />
  </div>
</template>

<style scoped>
  iframe {
    width: 800px;
    height: 600px;
  }
</style>
