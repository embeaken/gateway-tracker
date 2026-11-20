<script setup lang="ts">
import { useRoute } from 'vue-router'
import BrandMark from './BrandMark.vue'

const route = useRoute()

defineProps<{ explainerOpen: boolean }>()
const emit = defineEmits<{ (e: 'open-explainer'): void }>()
</script>

<template>
  <header class="app-header" :class="{ 'has-beta-notice': route.name === 'cameras' }">
    <div class="container header-content">
      <RouterLink to="/" class="brand-lockup" aria-label="hudson.tube home">
        <BrandMark class="brand-icon" />
        <span class="brand-name">hudson.tube</span>
      </RouterLink>

      <nav class="header-nav" aria-label="Main">
        <RouterLink to="/" class="nav-link">Overview</RouterLink>
        <RouterLink to="/cameras" class="nav-link">Cameras</RouterLink>
      </nav>

      <button
        type="button"
        class="explainer-btn"
        aria-haspopup="dialog"
        :aria-expanded="explainerOpen"
        aria-controls="overview-explainer"
        @click="emit('open-explainer')"
      >
        What is this?
      </button>
    </div>
    <div v-if="route.name === 'cameras'" class="beta-row">
      <div class="container">
        <p>This page is somewhat experimental.</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-chrome);
  color: white;
  border-bottom: 3px solid var(--color-accent);
}

.app-header.has-beta-notice {
  border-bottom: 0;
}

.beta-row {
  border-top: 3px solid var(--beta-line, #e6b535);
  background: var(--beta-bg, #e8eef5);
  color: var(--beta-text, #30465b);
  font-size: var(--font-size-base);
}

.beta-row p {
  max-width: 1280px;
  margin: 0 auto;
  padding-block: var(--spacing-xs);
}

[data-theme="dark"] .beta-row {
  --beta-line: #c99930;
  --beta-bg: #3c3017;
  --beta-text: #ffe194;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .beta-row {
    --beta-line: #c99930;
    --beta-bg: #3c3017;
    --beta-text: #ffe194;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding-top: 14px;
  padding-bottom: 14px;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: white;
}

.brand-lockup:hover,
.brand-lockup:visited {
  color: white;
  text-decoration: none;
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: 23px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

.header-nav {
  display: flex;
  gap: var(--spacing-md);
  margin-left: var(--spacing-sm);
}

.nav-link,
.nav-link:visited {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-underline-offset: 6px;
  text-decoration-thickness: 2px;
}

.explainer-btn {
  flex: none;
  margin-left: auto;
  padding: 7px 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background: transparent;
  color: white;
  font: inherit;
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base);
}

.explainer-btn:hover {
  border-color: var(--color-accent);
  background: rgba(255, 255, 255, 0.06);
}

.explainer-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@media (max-width: 820px) {
  .header-content {
    flex-wrap: wrap;
    row-gap: 6px;
  }
}

@media (max-width: 640px) {
  .header-content {
    gap: 12px;
  }

  /* The links drop to their own row under the logo and button */
  .brand-lockup {
    flex: 1;
    gap: 9px;
  }

  .header-nav {
    order: 3;
    flex-basis: 100%;
    margin-left: 0;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
  }

  .brand-name {
    font-size: 20px;
  }
}
</style>
