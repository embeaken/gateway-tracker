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
import { useSiteClock } from './useSiteClock'

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}

const { time, isNight } = useSiteClock()

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
            <p class="kicker section-meta">
              <span class="live-dot" aria-hidden="true"></span>
              {{ projects.length }} cams · {{ time }} in New York
              <span v-if="isNight" class="night-chip">Night shift</span>
            </p>
          </div>

          <div class="cam-grid">
            <ProjectCard
              v-for="(project, i) in projects"
              :key="project.id"
              :project="project"
              :index="i"
              :featured="i === 0"
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
  container: cams / inline-size;
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
  line-height: 1;
}

.section-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.night-chip {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-ink);
  color: #ffd27a;
}

.cam-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
}

@container cams (min-width: 700px) {
  .cam-grid {
    grid-template-columns: 1fr 1fr;
  }

  /* Featured cam spans the row; so does a trailing orphan. */
  .cam-grid > :first-child,
  .cam-grid > :last-child:nth-child(even) {
    grid-column: 1 / -1;
  }
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
