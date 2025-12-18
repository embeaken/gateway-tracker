<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import EarthCam from './components/EarthCam.vue'
import type { Project } from './types'

const projects: Project[] = [
  {
    name: 'Tonnelle Ave.',
    desc: 'short desccc',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88KKPTYvGpuC9sn7UZHiL1L4.tJ90CoLmq7TzrY396Yd88KndwTghhAJ91QbmhhD8hKQ'
  }
]
</script>

<template>
  <main>
    <HelloWorld msg="You did it!" />
    <div v-for="project in projects" :key="project.name">
      <EarthCam :project />
    </div>
  </main>
</template>

<style scoped>
</style>
