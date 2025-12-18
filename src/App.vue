<script setup lang="ts">
import EarthCam from './components/EarthCam.vue'
import { projects } from './assets/data'
</script>

<template>
  <main>
    <div v-for="project in projects" :key="project.name">
      <EarthCam :project />
    </div>
  </main>
</template>

<style scoped>
</style>
