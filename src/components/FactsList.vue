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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-xs);
  margin: 10px 0;
  padding: 10px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.fact-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fact-label {
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fact-value {
  font-size: 15px;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .facts-list {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }

  .fact-value {
    font-size: 14px;
  }
}
</style>
