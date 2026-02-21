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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
}

@media (min-width: 1024px) {
  .sidebar {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
  }

  .sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 3px;
  }

  .sidebar::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary-dark);
  }
}


@media (max-width: 768px) {
  .sidebar {
    padding: var(--spacing-sm);
  }
}
</style>
