<script setup lang="ts">
import type { ProjectFact } from '../types'

defineProps<{
  facts: ProjectFact[]
}>()
</script>

<template>
  <div class="facts-list">
    <div v-for="(fact, index) in facts" :key="index" class="fact-item">
      <span class="fact-label">{{ fact.label }}</span>
      <span class="fact-value">{{ fact.value }}</span>
    </div>
  </div>
</template>

<style scoped>
.facts-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.fact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fact-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fact-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .facts-list {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .fact-value {
    font-size: var(--font-size-sm);
  }
}
</style>
