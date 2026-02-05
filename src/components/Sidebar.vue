<script setup lang="ts">
// Sidebar container for widgets (Twitter feed, etc.)
</script>

<template>
  <div class="sidebar">
    <slot></slot>
  </div>
</template>

<style scoped>
.sidebar {
  background-color: var(--color-background-alt);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  height: fit-content;
}

@media (max-width: 1023px) {
  .sidebar {
    margin-top: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .sidebar {
    padding: var(--spacing-sm);
  }
}
</style>
