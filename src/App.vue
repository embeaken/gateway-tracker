<script setup lang="ts">
import ProjectView from './components/ProjectView.vue'
import { projects } from './assets/data'
</script>

<template>
  <header>
    <h1>hudson.tube 🚇</h1>
    <p>We're tracking <em>the most urgent infrastructure project in America</em>: a pair of new passenger rail tunnels under the Hudson River.</p>
  </header>

  <main>
    <div v-for="project in projects" :key="project.name">
      <ProjectView :project />
    </div>
  </main>

  <footer>
    <hr />
    All data is from the <a href="https://www.gatewayprogram.org" target="_blank">Gateway Program website</a>.
  </footer>
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
  footer {
    margin-top: 20px;
  }
</style>
