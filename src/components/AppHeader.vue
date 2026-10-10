<script setup lang="ts">
import BrandMark from './BrandMark.vue'

defineProps<{ explainerOpen: boolean }>()
const emit = defineEmits<{ (e: 'open-explainer'): void }>()
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <a href="/" class="brand-lockup" aria-label="hudson.tube home">
        <BrandMark class="brand-icon" />
        <span class="brand-name">hudson.tube</span>
      </a>

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
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-navy);
  color: white;
  border-bottom: 3px solid var(--color-accent);
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

.brand-icon {
  color: var(--color-accent);
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: 23px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

.explainer-btn {
  flex: none;
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
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 820px) {
  .header-content {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .brand-lockup {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .header-content {
    gap: 12px;
  }

  .brand-lockup {
    gap: 9px;
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
