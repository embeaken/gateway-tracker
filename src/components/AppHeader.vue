<script setup lang="ts">
import BrandMark from './BrandMark.vue'
import { computed } from 'vue'
import { PALISADES_DRIVE } from '../assets/data'
import { useTbmProgress, formatPct, formatFt } from '../useTbmProgress'

const { lead } = useTbmProgress()

const statusTitle = computed(
  () =>
    `${lead.value.tbm.label} (${lead.value.tbm.tube.toLowerCase()} tube): an estimated ` +
    `${formatFt(lead.value.ft)} of ${formatFt(PALISADES_DRIVE.lengthFt)} to the Hudson County shaft, ` +
    `assuming ~${PALISADES_DRIVE.rateFtPerDay} ft/day.`,
)
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <a href="#" class="brand-lockup" aria-label="hudson.tube home">
        <BrandMark class="brand-icon" />
        <span>
          <span class="brand-name">hudson.tube</span>
          <span class="brand-subtitle">Hudson River Tunnel tracker</span>
        </span>
      </a>

      <a href="#route" class="header-status" :title="statusTitle">
        <span class="status-dot" aria-hidden="true"></span>
        <span class="status-label">Tunnel boring</span>
        <span class="status-day tabular">Day {{ lead.day }}</span>
        <span class="status-pct tabular" :aria-label="`about ${formatPct(lead.fraction)} complete, estimated`">
          <span class="pct-bar" aria-hidden="true"><span :style="{ width: `${Math.max(2, lead.fraction * 100)}%` }"></span></span>
          {{ formatPct(lead.fraction) }}
        </span>
      </a>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-navy);
  color: white;
  border-bottom: 3px solid var(--color-accent);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding-top: 14px;
  padding-bottom: 14px;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: white;
}

.brand-lockup:hover,
.brand-lockup:visited {
  color: white;
  text-decoration: none;
}

.brand-icon {
  color: var(--color-accent);
}

.brand-name,
.brand-subtitle {
  display: block;
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: 23px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

.brand-subtitle {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.header-status:visited {
  color: rgba(255, 255, 255, 0.9);
}

.header-status:hover {
  color: white;
  text-decoration: none;
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.06);
}

.header-status .status-dot {
  background: #6FCF97;
}

.status-pct {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-right: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.pct-bar {
  position: relative;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.pct-bar > span {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--color-accent);
  border-radius: 2px;
}

.status-day {
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-navy);
  font-weight: var(--font-weight-bold);
}

@media (max-width: 640px) {
  .header-content {
    gap: 12px;
  }

  .brand-lockup {
    gap: 9px;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
  }

  .brand-name {
    font-size: 20px;
  }

  .brand-subtitle {
    display: none;
  }

  .header-status {
    gap: 6px;
    padding: 4px 4px 4px 10px;
    font-size: 12px;
  }

  .status-day {
    padding: 2px 7px;
  }

  .pct-bar {
    display: none;
  }
}

@media (max-width: 420px) {
  .status-label {
    display: none;
  }
}
</style>
