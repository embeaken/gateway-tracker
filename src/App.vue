<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroPhotos from './components/HeroPhotos.vue'
import OverviewExplainer from './components/OverviewExplainer.vue'
import RouteMap from './components/RouteMap.vue'
import TbmStatus from './components/TbmStatus.vue'
import AppFooter from './components/AppFooter.vue'
import MainLayout from './components/MainLayout.vue'
import ProjectCard from './components/ProjectCard.vue'
import Sidebar from './components/Sidebar.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import { projects } from './assets/data'

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}

// "What's going on?" opens a slide-out drawer from the header.
const showExplainer = ref(false)

// Hero: full-bleed photo with the live TBM status; the map card overlaps its
// bottom edge by this much.
const OVERLAP = 72
</script>

<template>
  <AppHeader :explainer-open="showExplainer" @open-explainer="showExplainer = true" />
  <OverviewExplainer :open="showExplainer" @close="showExplainer = false" />

  <HeroPhotos :overlap="OVERLAP">
    <TbmStatus tone="dark" />
  </HeroPhotos>
  <RouteMap class="route--overlap" :style="{ '--overlap': `${OVERLAP}px` }">
    <template #head>
      <h2 id="route-title" class="sr-only">Construction map</h2>
    </template>
  </RouteMap>

  <main>
    <MainLayout>
      <template #content>
        <section id="cameras" class="cams" aria-labelledby="cams-title">
          <div class="section-head">
            <h2 id="cams-title" class="section-title">Construction cameras</h2>
          </div>

          <div class="cam-grid">
            <ProjectCard
              v-for="(project, i) in projects"
              :key="project.id"
              :project="project"
              :index="i"
            />
          </div>
        </section>
      </template>

      <template #sidebar>
        <div id="activity" class="activity-anchor"></div>
        <Sidebar data-testid="activity">
          <ActivityTimeline />
        </Sidebar>
      </template>
    </MainLayout>
  </main>

  <AppFooter />
</template>

<style scoped>
/* The map card rides up over the bottom of the photo */
.route--overlap {
  position: relative;
  z-index: 2;
  margin-top: calc(-1 * var(--overlap));
  padding-top: 0;
}

.route--overlap :deep(.route-head) {
  margin: 0;
}

.route--overlap :deep(.route-card) {
  box-shadow: var(--shadow-lg);
}

.cams {
  scroll-margin-top: var(--spacing-lg);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.section-title {
  font-size: 32px;
  line-height: 1.1;
}

/* One column: every camera full width so EarthCam serves its interactive
   player (see ProjectCard). */
.cam-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (max-width: 820px) {
  .section-title {
    font-size: 26px;
  }
}

.activity-anchor {
  scroll-margin-top: var(--spacing-lg);
}
</style>
