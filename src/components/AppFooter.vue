<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'

// Gateway Tracker Footer
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <p>Made with civic pride by Ilya Rubnich &bull; <a href="https://github.com/embeaken/gateway-tracker" target="_blank">GitHub</a></p>
      <ThemeToggle />
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md) 0;
  background-color: var(--color-background);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
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
    margin-top: var(--spacing-sm);
    padding: var(--spacing-md) 0;
  }
}
</style>
