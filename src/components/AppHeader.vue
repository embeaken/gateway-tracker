<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <div class="header-top">
          <h1>hudson.tube 🚇</h1>
          <ThemeToggle />
        </div>
        <p class="tagline">
          Tracking <em>the most urgent infrastructure project in America</em>: a pair of new passenger rail tunnels under the Hudson River.
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #005E71 0%, #004555 100%);
  color: white;
  padding: var(--spacing-lg) 0;
  border-bottom: 4px solid #D4980A;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
  color: white;
  letter-spacing: -0.03em;
}

.tagline {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  margin: 0;
  color: rgba(255, 255, 255, 1);
  font-weight: var(--font-weight-medium);
}

.tagline em {
  font-style: italic;
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--spacing-md) 0;
  }

  .header-content h1 {
    font-size: var(--font-size-md);
  }

  .tagline {
    font-size: var(--font-size-sm);
  }
}
</style>
