<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import GatewayOverview from './components/GatewayOverview.vue'
import AppFooter from './components/AppFooter.vue'
import MainLayout from './components/MainLayout.vue'
import ProjectCard from './components/ProjectCard.vue'
import Sidebar from './components/Sidebar.vue'
import ContextCard from './components/ContextCard.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import CommitmentTracker from './components/CommitmentTracker.vue'
import { projects } from './assets/data'

const contextOpen = ref(false)

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}
</script>

<template>
  <AppHeader />
  <GatewayOverview @open-context="contextOpen = true" />

  <main>
    <MainLayout>
      <template #content>
        <div id="construction-cameras" class="camera-anchor"></div>

        <CommitmentTracker class="mobile-only-tracker" />

        <section id="activity" class="mobile-activity" data-testid="mobile-activity">
          <Sidebar>
            <ActivityTimeline />
          </Sidebar>
        </section>

        <ProjectCard
          v-for="project in projects"
          :key="project.name"
          :project="project"
        />
      </template>

      <template #sidebar>
        <div id="desktop-activity" class="activity-anchor"></div>
        <CommitmentTracker class="desktop-only-tracker" />
        <Sidebar data-testid="desktop-activity">
          <ActivityTimeline />
        </Sidebar>
      </template>
    </MainLayout>
  </main>

  <AppFooter />

  <ContextCard :open="contextOpen" @close="contextOpen = false" />
</template>

<style scoped>
.camera-anchor,
.activity-anchor {
  scroll-margin-top: var(--spacing-lg);
}

.mobile-activity {
  display: none;
  scroll-margin-top: var(--spacing-lg);
}

@media (max-width: 1199px) {
  .mobile-activity {
    display: block;
    margin-bottom: var(--spacing-md);
  }
}

.desktop-only-tracker {
  display: none;
}

@media (min-width: 1200px) {
  .desktop-only-tracker {
    display: block;
  }
  .mobile-only-tracker {
    display: none;
  }
}
</style>
