<script setup lang="ts">
// The dashboard's card frame: a small uppercase title, an optional
// right-aligned #meta slot, then content.
defineProps<{ title: string; titleId?: string }>()
</script>

<template>
  <section class="dash-card" :aria-labelledby="titleId">
    <header class="dash-card-head">
      <h2 :id="titleId" class="dash-card-title">{{ title }}</h2>
      <span v-if="$slots.meta" class="dash-card-meta"><slot name="meta" /></span>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.dash-card {
  min-width: 0;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 16px 16px;
}

.dash-card-head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  margin-bottom: 12px;
}

.dash-card-title {
  font-family: var(--font-family-base);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.dash-card-meta {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: right;
}
</style>
