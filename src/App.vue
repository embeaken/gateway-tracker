<script setup lang="ts">
import ProjectView from './components/ProjectView.vue'
import { projects } from './assets/data'
</script>

<template>
  <header>
    <h1>Gateway Tracker</h1>
    <p>Follow along as crews build <em>the most urgent infrastructure project in America.</em></p>
  </header>

  <main>
    <div v-for="project in projects" :key="project.name">
      <ProjectView :project />
    </div>
  </main>
</template>

<style scoped>
  header {
    h1 {
      font-size: 40px;
    }

    p {
      font-size: 20px;
    }
  }
</style>
