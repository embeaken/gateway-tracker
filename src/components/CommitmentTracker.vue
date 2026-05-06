<script setup lang="ts">
import { computed } from 'vue'
import { commitments } from '../assets/boardCommitments'
import type { Commitment } from '../assets/boardCommitmentsTypes'

const PROGRAM_BUDGET_USD = 16_000_000_000

const buildingCommitments = computed(() =>
  commitments
    .filter(
      (c) =>
        c.amountUsd != null &&
        !c.isDuplicate &&
        (c.category === 'construction' || c.category === 'delivery-partner'),
    )
    .slice()
    .sort((a, b) => a.meetingDate.localeCompare(b.meetingDate)),
)

const cumulativeTotal = computed(() =>
  buildingCommitments.value.reduce((sum, c) => sum + (c.amountUsd ?? 0), 0),
)

const programPct = computed(() =>
  Math.round((cumulativeTotal.value / PROGRAM_BUDGET_USD) * 100),
)

const recentAwards = computed(() => {
  // Show the 4 most recent dollar-bearing resolutions across construction,
  // delivery-partner, and professional-services categories. Funding and
  // operating-budget excluded since the headline frames "construction".
  return commitments
    .filter(
      (c) =>
        c.amountUsd != null &&
        !c.isDuplicate &&
        c.category !== 'funding' &&
        c.category !== 'operating-budget' &&
        c.category !== 'governance',
    )
    .slice()
    .sort((a, b) =>
      a.meetingDate === b.meetingDate
        ? b.resolutionId.localeCompare(a.resolutionId)
        : b.meetingDate.localeCompare(a.meetingDate),
    )
    .slice(0, 4)
})

const fmtMonthYear = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fmtAmount = (amount: number) => {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount >= 100_000_000 ? 0 : 1)}M`
  return `$${(amount / 1000).toFixed(0)}k`
}

const fmtTotal = (amount: number) => {
  const billions = amount / 1_000_000_000
  return `$${billions.toFixed(2)}B`
}

const titleSummary = (c: Commitment) => {
  // Strip the verbose "Authorization of …" boilerplate so the recent-awards
  // list reads as a list of things, not a wall of "AUTHORIZATION OF …".
  let t = c.title.replace(/^authoriz\w*\s+(of|to)\s+(award|increase|delegation|notice)\s+(of|to)?\s*/i, '')
  t = t.replace(/^(award|increase|delegation|notice)\s+(of|to|to proceed)\s+/i, '')
  t = t.replace(/^contract\s+(no\.\s+)?/i, '')
  t = t.replace(/\s+to\s+support\s+the\s+hudson\s+tunnel\s+project.*$/i, '')
  return t.trim().replace(/\s+/g, ' ')
}

// ─── Step chart geometry ─────────────────────────────────────────────────────

const VIEW_W = 800
const VIEW_H = 110
const PAD_X = 6
const PAD_TOP = 12
const PAD_BOTTOM = 22

const chartData = computed(() => {
  const series = buildingCommitments.value
  const firstItem = series[0]
  const lastItem = series[series.length - 1]
  if (!firstItem || !lastItem) return null

  const firstDate = new Date(firstItem.meetingDate + 'T00:00:00').getTime()
  const lastDate = new Date(lastItem.meetingDate + 'T00:00:00').getTime()
  const span = Math.max(1, lastDate - firstDate)

  let running = 0
  const points = series.map((c) => {
    running += c.amountUsd ?? 0
    const t = new Date(c.meetingDate + 'T00:00:00').getTime()
    const x = PAD_X + ((t - firstDate) / span) * (VIEW_W - PAD_X * 2)
    return { x, total: running, commitment: c }
  })

  const max = Math.max(...points.map((p) => p.total))
  const yScale = (v: number) =>
    VIEW_H - PAD_BOTTOM - (v / max) * (VIEW_H - PAD_TOP - PAD_BOTTOM)

  // Build a stepped path: horizontal line at the previous total, then a
  // vertical jump up to the new total at this meeting's x.
  const cmds: string[] = []
  let prevY = yScale(0)
  cmds.push(`M ${PAD_X} ${prevY}`)
  for (const p of points) {
    cmds.push(`L ${p.x} ${prevY}`)
    const newY = yScale(p.total)
    cmds.push(`L ${p.x} ${newY}`)
    prevY = newY
  }
  cmds.push(`L ${VIEW_W - PAD_X} ${prevY}`)

  const linePath = cmds.join(' ')
  const areaPath = `${linePath} L ${VIEW_W - PAD_X} ${VIEW_H - PAD_BOTTOM} L ${PAD_X} ${VIEW_H - PAD_BOTTOM} Z`

  // Year tick positions
  const years: { x: number; label: string }[] = []
  const startYear = new Date(firstDate).getFullYear()
  const endYear = new Date(lastDate).getFullYear()
  for (let y = startYear; y <= endYear; y++) {
    const t = new Date(`${y}-01-01T00:00:00`).getTime()
    if (t < firstDate || t > lastDate) continue
    const x = PAD_X + ((t - firstDate) / span) * (VIEW_W - PAD_X * 2)
    years.push({ x, label: String(y) })
  }
  // Ensure first and last meeting years are shown
  if (!years.some((y) => y.label === String(startYear))) {
    years.unshift({ x: PAD_X, label: String(startYear) })
  }

  return { points, linePath, areaPath, years, max }
})

const sourceRange = computed(() => {
  const series = buildingCommitments.value
  const firstItem = series[0]
  const lastItem = series[series.length - 1]
  if (!firstItem || !lastItem) return ''
  const first = new Date(firstItem.meetingDate + 'T00:00:00')
  const last = new Date(lastItem.meetingDate + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${fmt(first)} – ${fmt(last)}`
})
</script>

<template>
  <section class="commitment-card">
    <p class="kicker">Authorized by the Board</p>
    <p class="headline">
      <span class="amount">{{ fmtTotal(cumulativeTotal) }}</span>
      <span class="amount-context">
        committed to construction &amp; program management of the
        ${{ (PROGRAM_BUDGET_USD / 1_000_000_000).toFixed(0) }}B Hudson Tunnel Program
        <span class="pct">({{ programPct }}%)</span>
      </span>
    </p>

    <svg
      v-if="chartData"
      class="chart"
      :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
      preserveAspectRatio="none"
      role="img"
      aria-label="Cumulative authorized contract value by board meeting"
    >
      <!-- Year grid lines -->
      <g class="year-grid">
        <line
          v-for="y in chartData.years"
          :key="y.label"
          :x1="y.x"
          :x2="y.x"
          :y1="PAD_TOP"
          :y2="VIEW_H - PAD_BOTTOM"
        />
      </g>

      <!-- Area fill -->
      <path class="chart-area" :d="chartData.areaPath" />

      <!-- Step line -->
      <path class="chart-line" :d="chartData.linePath" />

      <!-- Meeting markers -->
      <g class="markers">
        <circle
          v-for="(p, i) in chartData.points"
          :key="i"
          :cx="p.x"
          :cy="VIEW_H - PAD_BOTTOM - (p.total / chartData.max) * (VIEW_H - PAD_TOP - PAD_BOTTOM)"
          r="2.2"
        >
          <title>{{ fmtMonthYear(p.commitment.meetingDate) }} — {{ fmtTotal(p.total) }} cumulative</title>
        </circle>
      </g>

      <!-- Year labels -->
      <g class="year-labels">
        <text
          v-for="y in chartData.years"
          :key="y.label"
          :x="y.x"
          :y="VIEW_H - 6"
          text-anchor="middle"
        >
          {{ y.label }}
        </text>
      </g>
    </svg>

    <ul class="recent-list">
      <li v-for="c in recentAwards" :key="c.meetingDate + c.resolutionId">
        <a :href="c.minutesPdf" target="_blank" rel="noopener">
          <span class="recent-date">{{ fmtMonthYear(c.meetingDate) }}</span>
          <span class="recent-title">{{ titleSummary(c) }}</span>
          <span class="recent-amount">{{ fmtAmount(c.amountUsd ?? 0) }}</span>
        </a>
      </li>
    </ul>

    <p class="source">
      Source: GDC board resolutions, {{ sourceRange }} ·
      <a
        href="https://www.gatewayprogram.org/board-meetings-3.html"
        target="_blank"
        rel="noopener"
      >
        all meetings
      </a>
    </p>
  </section>
</template>

<style scoped>
.commitment-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.kicker {
  margin: 0 0 4px;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.07em;
  line-height: 1;
  text-transform: uppercase;
}

.headline {
  margin: 0 0 12px;
  line-height: 1.25;
}

.amount {
  display: block;
  color: var(--color-text-primary);
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  line-height: 1.05;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.amount-context {
  display: block;
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.35;
}

.pct {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* --- Chart --- */

.chart {
  display: block;
  width: 100%;
  height: 110px;
  margin-bottom: 10px;
  overflow: visible;
}

.year-grid line {
  stroke: var(--color-border);
  stroke-width: 1;
  stroke-dasharray: 2 3;
  vector-effect: non-scaling-stroke;
}

.chart-area {
  fill: var(--color-primary);
  fill-opacity: 0.12;
}

.chart-line {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.markers circle {
  fill: var(--color-primary);
}

.year-labels text {
  fill: var(--color-text-secondary);
  font-size: 11px;
  font-family: inherit;
}

/* --- Recent list --- */

.recent-list {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  border-top: 1px solid var(--color-border);
}

.recent-list li {
  border-bottom: 1px solid var(--color-border);
}

.recent-list a {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  column-gap: 10px;
  padding: 7px 0;
  color: inherit;
  text-decoration: none;
  border-bottom: 0;
}

.recent-list a:hover .recent-title {
  color: var(--color-primary);
}

.recent-date {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.recent-title {
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-text-primary);
  transition: color var(--transition-base);
  /* Truncate to a single line in the sidebar to avoid varied row heights */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-amount {
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.source {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.4;
}

.source a {
  color: var(--color-text-secondary);
  text-decoration: underline dotted;
  border-bottom: 0;
}

.source a:hover {
  color: var(--color-primary);
}

/* --- Dark mode --- */

[data-theme="dark"] .chart-area {
  fill-opacity: 0.18;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chart-area {
    fill-opacity: 0.18;
  }
}

@media (max-width: 767px) {
  .amount {
    font-size: 28px;
  }
  .recent-title {
    white-space: normal;
  }
}
</style>
