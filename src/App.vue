<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import GatewayOverview from './components/GatewayOverview.vue'
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

// The "What's going on?" explainer expands in place under the hero.
const showExplainer = ref(false)

function toggleExplainer() {
  showExplainer.value = !showExplainer.value
}
</script>

<template>
  <AppHeader />
  <GatewayOverview :explainer-open="showExplainer" @toggle-explainer="toggleExplainer" />
  <div class="explainer-collapse">
    <Transition name="explainer">
      <OverviewExplainer v-if="showExplainer" />
    </Transition>
  </div>
  <RouteMap />

  <main>
    <MainLayout>
      <template #content>
        <section id="cameras" class="cams" aria-labelledby="cams-title">
          <div class="section-head">
            <h2 id="cams-title" class="section-title">Live from the sites</h2>
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
.explainer-enter-active,
.explainer-leave-active {
  transition: transform 190ms ease, opacity 190ms ease;
}

.explainer-enter-from,
.explainer-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (prefers-reduced-motion: reduce) {
  .explainer-enter-active,
  .explainer-leave-active {
    transition: none;
  }
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
