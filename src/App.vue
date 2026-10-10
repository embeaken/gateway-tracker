<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroPhotos from './components/HeroPhotos.vue'
import OverviewExplainer from './components/OverviewExplainer.vue'
import RouteMap from './components/RouteMap.vue'
import AppFooter from './components/AppFooter.vue'
import MainLayout from './components/MainLayout.vue'
import ProjectCard from './components/ProjectCard.vue'
import Sidebar from './components/Sidebar.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import { projects } from './assets/data'

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}

const showExplainer = ref(false)

/** How far the map card rides up over the bottom of the hero photo, px */
const OVERLAP = 72
</script>

<template>
  <AppHeader :explainer-open="showExplainer" @open-explainer="showExplainer = true" />
  <OverviewExplainer :open="showExplainer" @close="showExplainer = false" />

  <HeroPhotos :overlap="OVERLAP" />
  <RouteMap :style="{ marginTop: `-${OVERLAP}px` }" />

  <main>
    <MainLayout>
      <template #content>
        <section id="cameras" class="cams" aria-labelledby="cams-title">
          <h2 id="cams-title" class="section-title">Construction cameras</h2>
          <!-- One column so every camera is wide enough for EarthCam's interactive player -->
          <div class="cam-grid">
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
          </div>
        </section>
      </template>

      <template #sidebar>
        <h2 id="activity" class="section-title">
          Updates from the <abbr title="Gateway Development Commission">GDC</abbr>
        </h2>
        <Sidebar>
          <ActivityTimeline />
        </Sidebar>
      </template>
    </MainLayout>
  </main>

  <AppFooter />
</template>

<style scoped>
.cams,
#activity {
  scroll-margin-top: var(--spacing-lg);
}

.section-title {
  margin-bottom: var(--spacing-sm);
  font-size: 32px;
  line-height: 1.1;
}

.section-title abbr {
  text-decoration: underline dotted 2px;
  text-underline-offset: 3px;
  cursor: help;
}

.cam-grid {
  display: grid;
  gap: var(--spacing-md);
}

@media (max-width: 820px) {
  .section-title {
    font-size: 26px;
  }
}
</style>
