<script setup lang="ts">
// Twin-tube cross-section: the whole project is "two new tubes under the river".
</script>

<template>
  <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
    <rect width="40" height="40" rx="9" fill="var(--color-accent)" />
    <!-- riverbed line -->
    <path d="M0 13.5h40" stroke="#0D1B21" stroke-width="2" opacity=".35" />
    <circle cx="13" cy="24" r="7.5" fill="#0D1B21" />
    <circle cx="27" cy="24" r="7.5" fill="#0D1B21" />
    <circle cx="13" cy="24" r="3" fill="var(--color-accent)" />
    <circle cx="27" cy="24" r="3" fill="var(--color-accent)" />
  </svg>
</template>

<style scoped>
.brand-mark {
  display: block;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}
</style>
