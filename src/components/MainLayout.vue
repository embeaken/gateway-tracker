<script setup lang="ts">
// Two-column layout: main content + sidebar
</script>

<template>
  <div class="main-layout container">
    <div class="content-area">
      <slot name="content"></slot>
    </div>
    <aside class="sidebar-area">
      <slot name="sidebar"></slot>
    </aside>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.content-area {
  flex: 1;
  min-width: 0; /* Prevent flex item overflow */
}

.sidebar-area {
  width: 100%;
}

/* Desktop: Two-column grid layout */
@media (min-width: 1024px) {
  .main-layout {
    display: grid;
    grid-template-columns: 1fr var(--sidebar-width);
    gap: var(--content-gap);
  }

  .sidebar-area {
    position: sticky;
    top: 20px;
    align-self: start;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding-right: 8px;
  }

  /* Custom scrollbar for sidebar */
  .sidebar-area::-webkit-scrollbar {
    width: 8px;
  }

  .sidebar-area::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-area::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 4px;
  }

  .sidebar-area::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary-dark);
  }
}

/* Tablet: Keep single column but with more spacing */
@media (min-width: 768px) and (max-width: 1023px) {
  .main-layout {
    gap: var(--spacing-2xl);
  }
}

/* Mobile: Single column with reduced spacing */
@media (max-width: 767px) {
  .main-layout {
    gap: var(--spacing-lg);
    padding-top: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }
}
</style>
