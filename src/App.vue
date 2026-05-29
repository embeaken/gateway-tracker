<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import GatewayOverview from './components/GatewayOverview.vue'
import OverviewExplainer from './components/OverviewExplainer.vue'
import AppFooter from './components/AppFooter.vue'
import MainLayout from './components/MainLayout.vue'
import ProjectCard from './components/ProjectCard.vue'
import Sidebar from './components/Sidebar.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import { projects } from './assets/data'

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}

// The "What's going on?" explainer is tucked under the header and pulled into
// view by the tab on the header's bottom edge. Toggles open and closed; the
// viewport is intentionally left where it is.
const showExplainer = ref(false)

function toggleExplainer() {
  showExplainer.value = !showExplainer.value
}

</script>

<template>
  <AppHeader :explainer-open="showExplainer" @toggle-explainer="toggleExplainer" />
  <div class="explainer-collapse">
    <Transition name="explainer">
      <OverviewExplainer v-if="showExplainer" />
    </Transition>
  </div>
  <GatewayOverview />

  <main>
    <MainLayout>
      <template #content>
        <div id="construction-cameras" class="camera-anchor"></div>

        <ProjectCard
          v-for="project in projects"
          :key="project.name"
          :project="project"
        />
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
/* Simple CSS transition for the explainer: transform + opacity (animates
   reliably). Layout shift is instant — height is not animated. */
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

.camera-anchor,
.activity-anchor {
  scroll-margin-top: var(--spacing-lg);
}
</style>
