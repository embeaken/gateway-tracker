<script setup lang="ts">
// Gateway Tracker Footer
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <hr class="divider" />
      <p>
        <a href="https://www.gatewayprogram.org" target="_blank" rel="noopener noreferrer">
          All data is sourced from the Gateway Program's official channels
        </a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--spacing-1xl);
  padding: var(--spacing-xl) 0;
  background-color: var(--color-background);
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0 0 var(--spacing-md) 0;
}

.app-footer p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.app-footer a {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.app-footer a:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 768px) {
  .app-footer {
    margin-top: var(--spacing-2xl);
    padding: var(--spacing-md) 0;
  }
}
</style>
