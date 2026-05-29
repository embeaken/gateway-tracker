<script setup lang="ts">
defineProps<{ explainerOpen: boolean }>()
const emit = defineEmits<{ (e: 'toggle-explainer'): void }>()
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <div class="brand-row">
          <a href="#" class="brand-lockup" aria-label="hudson.tube home">
            <span class="brand-mark" aria-hidden="true">🚇️</span>
            <span>
              <span class="brand-name">hudson.tube</span>
              <span class="brand-subtitle">Gateway construction tracker</span>
            </span>
          </a>
        </div>
      </div>

      <button
        type="button"
        class="explainer-tab"
        :class="{ 'explainer-tab--open': explainerOpen }"
        :aria-expanded="explainerOpen"
        aria-controls="overview-explainer"
        @click="emit('toggle-explainer')"
      >
        <span class="explainer-tab-label">{{ explainerOpen ? 'Close' : "What's going on?" }}</span>
        <svg class="explainer-tab-chevron" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  background: var(--color-primary-dark);
  color: white;
  padding: 12px 0;
  border-bottom: 3px solid var(--color-accent);
}

/* Handle hanging off the header's bottom edge — pulls the explainer out. */
.explainer-tab {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 2;
  transform: translate(-50%, 100%);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 16px 7px;
  border: 0;
  /* Continue the header's accent stripe across the tab so the yellow line
     isn't broken by the tab's dark background. */
  border-top: 3px solid var(--color-accent);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  background: var(--color-primary-dark);
  color: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition:
    background var(--transition-base),
    color var(--transition-base),
    transform var(--transition-base);
}

/* Subtle lighten of the tab's own colour — never the bright accent teal, which
   clashed with the gold header stripe. Stays flush to the header (no gap). */
.explainer-tab:hover {
  color: #fff;
  background: color-mix(in srgb, #004555, white 12%);
  box-shadow: var(--shadow-md);
}

.explainer-tab-chevron {
  width: 10px;
  height: 6px;
  transition: transform var(--transition-base);
}

/* Chevron leans in the toggle direction on hover — down to pull out, up to tuck back. */
.explainer-tab:hover .explainer-tab-chevron {
  transform: translateY(2px);
}

.explainer-tab--open .explainer-tab-chevron {
  transform: rotate(180deg);
}

.explainer-tab--open:hover .explainer-tab-chevron {
  transform: rotate(180deg) translateY(2px);
}

[data-theme="dark"] .app-header,
[data-theme="dark"] .explainer-tab {
  background: #083344;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .app-header,
  :root:not([data-theme="light"]) .explainer-tab {
    background: #083344;
  }
}

[data-theme="dark"] .explainer-tab:hover {
  background: color-mix(in srgb, #083344, white 12%);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .explainer-tab:hover {
    background: color-mix(in srgb, #083344, white 12%);
  }
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: white;
  border-bottom: 0;
}

.brand-lockup:hover,
.brand-lockup:visited {
  color: white;
  border-bottom: 0;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: white;
  font-size: 34px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  transform: translateY(-4px);
}

.brand-name,
.brand-subtitle {
  display: block;
}

.brand-name {
  color: white;
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  letter-spacing: 0;
}

.brand-subtitle {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .app-header {
    padding: 10px 0;
  }

  .brand-mark {
    width: 30px;
    height: 30px;
    font-size: 30px;
  }

  .brand-name {
    font-size: 18px;
  }

  .brand-subtitle {
    font-size: 10px;
  }

}
</style>
