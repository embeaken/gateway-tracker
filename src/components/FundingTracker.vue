<script setup lang="ts">
const TOTAL = 12_000_000_000
const CONFIRMED = 30_000_000
const EXPECTED = 175_000_000
const FROZEN = TOTAL - CONFIRMED - EXPECTED
const UNLOCKED = CONFIRMED + EXPECTED

const unlockedPct = (UNLOCKED / TOTAL) * 100
const confirmedZoomPct = (CONFIRMED / UNLOCKED) * 100
const expectedZoomPct = (EXPECTED / UNLOCKED) * 100

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}
</script>

<template>
  <div class="funding-card">
    <h3 class="funding-title">Funding Tracker</h3>

    <div class="stats-row">
      <div class="stat-item stat-item--confirmed">
        <span class="stat-value">{{ fmt(CONFIRMED) }}</span>
        <span class="stat-name">Confirmed disbursed</span>
      </div>
      <div class="stat-item stat-item--expected">
        <span class="stat-value">{{ fmt(EXPECTED) }}</span>
        <span class="stat-name">Disbursement imminent</span>
      </div>
      <div class="stat-item stat-item--frozen">
        <span class="stat-value">{{ fmt(FROZEN) }}</span>
        <span class="stat-name">Frozen</span>
      </div>
    </div>

    <div class="bar-section">
      <div class="bar-header">
        <span class="bar-label">Full program &mdash; {{ fmt(TOTAL) }}</span>
        <span class="bar-pct">{{ unlockedPct.toFixed(1) }}% unlocked</span>
      </div>
      <div class="bar" aria-hidden="true">
        <div
          class="bar-segment bar-segment--confirmed"
          :style="{ width: Math.max(unlockedPct * (CONFIRMED / UNLOCKED), 0) + '%', minWidth: '4px' }"
        ></div>
        <div class="bar-notch"></div>
        <div
          class="bar-segment bar-segment--expected"
          :style="{ width: Math.max(unlockedPct * (EXPECTED / UNLOCKED), 0) + '%', minWidth: '4px' }"
        ></div>
        <div class="bar-notch"></div>
        <div class="bar-segment bar-segment--frozen" style="flex: 1"></div>
      </div>
    </div>

    <div class="zoom-connector" aria-hidden="true">
      <svg class="zoom-svg" viewBox="0 0 1000 40" preserveAspectRatio="none">
        <polygon :points="`1,0 ${unlockedPct * 10},0 999,40 1,40`" class="zoom-fill" />
        <line x1="1" y1="0" x2="1" y2="40" class="zoom-line" />
        <line :x1="unlockedPct * 10" y1="0" x2="999" y2="40" class="zoom-line" />
      </svg>
    </div>

    <div class="bar-section">
      <div class="bar-header">
        <span class="bar-label">Disbursed + imminent &mdash; {{ fmt(UNLOCKED) }}</span>
      </div>
      <div class="bar" aria-hidden="true">
        <div
          class="bar-segment bar-segment--confirmed"
          :style="{ width: confirmedZoomPct + '%' }"
        >
          <span class="segment-label">{{ fmt(CONFIRMED) }}</span>
        </div>
        <div class="bar-notch"></div>
        <div
          class="bar-segment bar-segment--expected"
          :style="{ width: expectedZoomPct + '%' }"
        >
          <span class="segment-label">{{ fmt(EXPECTED) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.funding-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.funding-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
  letter-spacing: -0.01em;
}

/* --- Stats --- */

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  border-left: 3px solid;
  padding-left: 10px;
}

.stat-item--confirmed { border-color: #16A34A; }
.stat-item--expected { border-color: var(--color-primary); }
.stat-item--frozen { border-color: #CBD5E1; }

[data-theme="dark"] .stat-item--confirmed { border-color: #4ADE80; }
[data-theme="dark"] .stat-item--frozen { border-color: #475569; }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .stat-item--confirmed { border-color: #4ADE80; }
  :root:not([data-theme="light"]) .stat-item--frozen { border-color: #475569; }
}

.stat-value {
  display: block;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.stat-name {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
  line-height: 1.2;
}

/* --- Bars --- */

.bar-section {
  margin-bottom: 0;
}

.bar-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}

.bar-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.bar-pct {
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.bar {
  display: flex;
  align-items: stretch;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

[data-theme="dark"] .bar {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.25);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .bar {
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.25);
  }
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-segment--confirmed { background: #16A34A; }
.bar-segment--expected { background: var(--color-primary); }
.bar-segment--frozen {
  background: repeating-linear-gradient(
    -45deg,
    #CBD5E1,
    #CBD5E1 5px,
    #D4DCE6 5px,
    #D4DCE6 10px
  );
}

[data-theme="dark"] .bar-segment--confirmed { background: #22C55E; }
[data-theme="dark"] .bar-segment--frozen {
  background: repeating-linear-gradient(
    -45deg,
    #334155,
    #334155 5px,
    #2E3C50 5px,
    #2E3C50 10px
  );
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .bar-segment--confirmed { background: #22C55E; }
  :root:not([data-theme="light"]) .bar-segment--frozen {
    background: repeating-linear-gradient(
      -45deg,
      #334155,
      #334155 5px,
      #2E3C50 5px,
      #2E3C50 10px
    );
  }
}

.bar-notch {
  width: 2px;
  background: var(--color-background);
  flex-shrink: 0;
}

.segment-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: #fff;
  white-space: nowrap;
}


/* --- Zoom connector --- */

.zoom-connector {
  position: relative;
  height: 44px;
}

.zoom-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.zoom-fill {
  fill: var(--color-border);
  opacity: 0.25;
}

.zoom-line {
  stroke: var(--color-border);
  stroke-width: 1;
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}

/* --- Responsive --- */

@media (max-width: 768px) {
  .funding-card {
    padding: var(--spacing-md);
  }

  .stat-value {
    font-size: 20px;
  }

  .bar {
    height: 32px;
  }

  .segment-label {
    font-size: 11px;
  }

  .zoom-connector {
    height: 36px;
  }
}
</style>
