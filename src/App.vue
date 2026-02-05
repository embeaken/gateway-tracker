<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AlertNotice from './components/AlertNotice.vue'
import AppFooter from './components/AppFooter.vue'
import MainLayout from './components/MainLayout.vue'
import ProjectCard from './components/ProjectCard.vue'
import Sidebar from './components/Sidebar.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import { projects } from './assets/data'
</script>

<template>
  <AppHeader />

  <AlertNotice />

  <main>
    <MainLayout>
      <template #content>
        <ProjectCard
          v-for="project in projects"
          :key="project.name"
          :project="project"
        />
      </template>

      <template #sidebar>
        <Sidebar>
          <ActivityTimeline />
        </Sidebar>
      </template>
    </MainLayout>
  </main>

  <AppFooter />
</template>

<style scoped>
/* App-level styles if needed */
</style>
