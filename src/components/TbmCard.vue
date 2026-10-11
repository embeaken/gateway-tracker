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

const subtitle = computed(() => {
  const tube = `${tbm.value.tube} tube · Palisades drive`
  if (tbm.value.launched) return `${tube} · launched ${formatLongDate(parseDate(tbm.value.launched))}`
  return tbm.value.expected ? `${tube} · expected to launch in ${tbm.value.expected}` : tube
})
</script>

<template>
  <section class="tbm-card" :aria-label="`${tbm.label}, ${status}`">
    <header class="tbm-head">
      <h2 class="tbm-name">{{ tbm.label }}</h2>
      <span class="tbm-status" :class="`tbm-status--${progress.status}`">{{ status }}</span>
    </header>
    <p class="tbm-sub">{{ subtitle }}</p>

    <p class="tbm-ft">
      <template v-if="progress.status === 'mining'">~</template>{{ ft.toLocaleString('en-US') }}<span class="unit">
        ft{{ progress.status === 'mining' ? ' estimated' : '' }}</span
      >
    </p>

    <div
      class="tbm-track"
      role="progressbar"
      :aria-valuenow="Math.round(pct)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${tbm.label} progress`"
    >
      <b :style="{ width: `${progress.status === 'upcoming' ? 0 : Math.max(0.6, pct)}%` }" />
    </div>
    <div class="tbm-ends">
      <span>Tonnelle Ave portal</span>
      <span v-if="progress.status === 'mining' && progress.arrival">
        {{ pct.toFixed(1) }}% · expected at the Hudson County shaft {{ formatMonthYear(progress.arrival) }}
      </span>
      <span>{{ PALISADES_DRIVE.lengthFt.toLocaleString('en-US') }} ft</span>
    </div>

    <p v-if="progress.status === 'mining'" class="tbm-note">
      Estimate assumes an even pace over GDC's
      <a :href="PALISADES_DRIVE.sourceUrl" target="_blank" rel="noopener">"approximately one year"</a>
      schedule. GDC hasn't published measured footage yet.
    </p>
    <p v-else-if="progress.status === 'upcoming'" class="tbm-note">
      After the Palisades drive, two mixed-ground TBMs bore the 7,250 ft river section from the Hudson County shaft.
    </p>
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

.tbm-note {
  margin-top: auto;
  padding-top: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

@media (max-width: 520px) {
  .tbm-ends span:nth-child(2) {
    display: none;
  }
}
</style>
