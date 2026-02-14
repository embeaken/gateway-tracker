<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AlertNotice from './components/AlertNotice.vue'
import FundingTracker from './components/FundingTracker.vue'
import AppFooter from './components/AppFooter.vue'
import MainLayout from './components/MainLayout.vue'
import ProjectCard from './components/ProjectCard.vue'
import Sidebar from './components/Sidebar.vue'
import ContextCard from './components/ContextCard.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import { projects } from './assets/data'

const contextOpen = ref(false)
</script>

<template>
  <AppHeader />
  <AlertNotice />

  <main>
    <MainLayout>
      <template #content>
        <FundingTracker />

        <!-- Mobile-only trigger above project list -->
        <button class="context-trigger context-trigger--mobile" @click="contextOpen = true">
          <div class="trigger-text">
            <span class="trigger-title">What's going on?</span>
            <span class="trigger-hint">Learn about Gateway</span>
          </div>
          <svg class="trigger-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>

        <ProjectCard
          v-for="project in projects"
          :key="project.name"
          :project="project"
        />
      </template>

      <template #sidebar>
        <button class="context-trigger context-trigger--sidebar" @click="contextOpen = true">
          <div class="trigger-text">
            <span class="trigger-title">What's going on?</span>
            <span class="trigger-hint">Learn about Gateway</span>
          </div>
          <svg class="trigger-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <Sidebar>
          <ActivityTimeline />
        </Sidebar>
      </template>
    </MainLayout>
  </main>

  <AppFooter />

  <ContextCard :open="contextOpen" @close="contextOpen = false" />
</template>

<style scoped>
.context-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
  font-family: inherit;
}

.context-trigger:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--color-primary);
}

.trigger-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trigger-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.trigger-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.trigger-icon {
  flex-shrink: 0;
  color: var(--color-primary);
}

/* Sidebar trigger: detached above sidebar, hidden on mobile */
.context-trigger--sidebar {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 1023px) {
  .context-trigger--sidebar {
    display: none;
  }
}

/* Mobile trigger: hidden on desktop */
.context-trigger--mobile {
  display: none;
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 1023px) {
  .context-trigger--mobile {
    display: flex;
  }
}
</style>
