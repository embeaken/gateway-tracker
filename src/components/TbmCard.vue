<script setup lang="ts">
import { computed } from 'vue'
import { PALISADES_DRIVE } from '../assets/data'
import { formatLongDate, formatMonthYear, parseDate } from '../dates'
import type { TbmProgress } from '../useTbmProgress'

const props = defineProps<{ progress: TbmProgress }>()

const tbm = computed(() => props.progress.tbm)
const ft = computed(() => Math.round(props.progress.ft))
const pct = computed(() => props.progress.fraction * 100)

const status = computed(
  () => ({ upcoming: 'Not launched', mining: 'Mining', arrived: 'Arrived' })[props.progress.status],
)

const title = computed(() => `${tbm.value.tube} tube TBM`)

const subtitle = computed(() => {
  const { launched, expected } = tbm.value
  if (!launched) return expected ? `Expected to launch in ${expected}` : ''
  const parts = [`Launched ${formatLongDate(parseDate(launched))}`]
  const { status, arrival } = props.progress
  if (status === 'mining' && arrival) parts.push(`expected done in ${formatMonthYear(arrival)}`)
  return parts.join(', ')
})
</script>

<template>
  <section class="tbm-card" :aria-label="`${title}, ${status}`">
    <header class="tbm-head">
      <h2 class="tbm-name">{{ title }}</h2>
      <span class="tbm-status" :class="`tbm-status--${progress.status}`">{{ status }}</span>
    </header>
    <p v-if="subtitle" class="tbm-sub">{{ subtitle }}</p>

    <p class="tbm-ft">
      {{ ft.toLocaleString('en-US') }}<span class="unit">
        ft bored{{ progress.status === 'mining' ? ' (estimated)' : '' }}</span
      >
    </p>

    <div
      class="tbm-track"
      role="progressbar"
      :aria-valuenow="Math.round(pct)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${title} progress`"
    >
      <b :style="{ width: `${progress.status === 'upcoming' ? 0 : Math.max(0.6, pct)}%` }" />
    </div>
    <div class="tbm-ends">
      <span v-if="progress.status === 'mining'">{{ pct.toFixed(1) }}%</span>
      <span>{{ PALISADES_DRIVE.lengthFt.toLocaleString('en-US') }} ft</span>
    </div>
  </section>
</template>

<style scoped>
.tbm-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 16px 16px;
}

.tbm-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.tbm-name {
  font-family: var(--font-family-display);
  font-size: 22px;
  line-height: 1.2;
}

.tbm-status {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  background: var(--color-background-alt);
  color: var(--color-text-secondary);
}

.tbm-status--mining,
.tbm-status--arrived {
  background: var(--color-ok-bg);
  color: var(--color-ok);
}

.tbm-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.tbm-ft {
  margin-top: 10px;
  font-family: var(--font-family-mono);
  font-size: 34px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.unit {
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0;
  color: var(--color-text-secondary);
}

.tbm-track {
  height: 10px;
  margin: 8px 0 4px;
  border-radius: 5px;
  background: var(--color-line);
  overflow: hidden;
}

.tbm-track b {
  display: block;
  height: 100%;
  background: var(--color-accent);
}

.tbm-ends {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-xs);
  font-size: 11px;
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

.tbm-ends span:last-child {
  margin-left: auto;
}
</style>
