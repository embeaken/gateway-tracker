<script setup lang="ts">
// Gateway Tracker Header with Stats Banner
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <h1>hudson.tube 🚇</h1>
        <p class="tagline">
          We're tracking <em>the most urgent infrastructure project in America</em>: a pair of new passenger rail tunnels under the Hudson River.
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #005E71 0%, #004555 100%);
  color: white;
  padding: var(--spacing-xl) 0;
}

.header-content h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
  color: white;
}

.tagline {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
}

.tagline em {
  font-style: italic;
  font-weight: var(--font-weight-medium);
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
