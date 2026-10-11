<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fundingShares } from '../assets/data'
import { fundingData } from '../assets/fundingData'

// Who pays for the tunnel, how much federal grant money has actually been paid,
// and payments by month. Federal figures come from USAspending.gov via
// scripts/update_funding.py; the split of the $16B is from GDC's Jan 2026 board deck.

const awards = fundingData.awards
const sum = (f: (a: (typeof awards)[number]) => number) => awards.reduce((t, a) => t + f(a), 0)

const committed = sum((a) => a.committed)
const obligated = sum((a) => a.obligated)
const paid = sum((a) => a.paid)

const shares = [
  { key: 'federal', label: 'Federal grants', amount: committed, note: 'FTA, FRA and USDOT grants' },
  ...fundingShares.filter((s) => s.key !== 'federal'),
]
const total = shares.reduce((t, s) => t + s.amount, 0)

const billions = (n: number) => `$${(n / 1e9).toFixed(n >= 1e10 ? 1 : 2)}B`
const pct = (n: number, of: number) => `${(n / of) * 100}%`

const monthLabel = (ym: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${ym}-15T12:00:00`).toLocaleDateString('en-US', opts)
const throughLabel = monthLabel(fundingData.through, { month: 'long', year: 'numeric' })

// --- Monthly chart ---

// Federal payments to GDC were suspended Oct 1, 2025 and resumed Feb 13, 2026
// (GDC's COFC complaint and Feb 2026 statements).
const FREEZE = { from: '2025-10', to: '2026-01' }

type Month = { ym: string; gdc: number; amtrak: number; span?: string }

const months = computed<Month[]>(() => {
  const all = awards.flatMap((a) => a.monthly)
  const first = all.reduce((m, p) => (p.to < m ? p.to : m), fundingData.through)
  const out: Month[] = []
  for (let d = new Date(`${first}-15T12:00:00`); ; d.setMonth(d.getMonth() + 1)) {
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (ym > fundingData.through) break
    out.push({ ym, gdc: 0, amtrak: 0 })
  }
  for (const a of awards) {
    for (const p of a.monthly) {
      const m = out.find((x) => x.ym === p.to)
      if (!m) continue
      m[a.recipient === 'GDC' ? 'gdc' : 'amtrak'] += p.amount
      if (p.from !== p.to) m.span = p.from
    }
  }
  return out
})

const chart = ref<HTMLElement | null>(null)
const width = ref(600)
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!chart.value) return
  width.value = chart.value.clientWidth
  observer = new ResizeObserver(([e]) => e && (width.value = e.contentRect.width))
  observer.observe(chart.value)
})
onBeforeUnmount(() => observer?.disconnect())

const H = 170
const AXIS = 34
const TOP = 8
const BOTTOM = 22

const max = computed(() => {
  const peak = Math.max(...months.value.map((m) => m.gdc + m.amtrak))
  return Math.ceil(peak / 50e6) * 50e6
})
const ticks = computed(() => [0, max.value / 2, max.value])
const bw = computed(() => (width.value - AXIS) / months.value.length)
const y = (v: number) => H - BOTTOM - (v / max.value) * (H - BOTTOM - TOP)
const freezeIdx = computed(() => ({
  from: months.value.findIndex((m) => m.ym === FREEZE.from),
  to: months.value.findIndex((m) => m.ym === FREEZE.to),
}))

// January and July, plus the first bar, which can cover several months
// (USAspending's first report for these grants was quarterly)
const xLabel = (m: Month, i: number) => {
  if (i === 0) return m.span ? `${monthLabel(m.span, { month: 'short' })}–${monthLabel(m.ym, { month: 'short', year: '2-digit' })}` : monthLabel(m.ym, { month: 'short', year: '2-digit' })
  if (i < 3) return ''
  return ['01', '07'].includes(m.ym.slice(5)) ? monthLabel(m.ym, { month: 'short', year: '2-digit' }) : ''
}

const millions = (n: number) => `$${(n / 1e6).toFixed(1)}M`
const barTitle = (m: Month) => {
  const when = m.span
    ? `${monthLabel(m.span, { month: 'short', year: 'numeric' })} – ${monthLabel(m.ym, { month: 'short', year: 'numeric' })}`
    : monthLabel(m.ym, { month: 'long', year: 'numeric' })
  return `${when}: ${millions(m.gdc)} to GDC, ${millions(m.amtrak)} to Amtrak`
}
</script>

<template>
  <div class="funding">
    <h3 class="q">Who pays</h3>
    <div class="split" role="img" :aria-label="shares.map((s) => `${s.label} ${billions(s.amount)}`).join(', ')">
      <div v-for="s in shares" :key="s.key" :class="`split--${s.key}`" :style="{ flex: s.amount }" />
    </div>
    <div class="split-labels">
      <div v-for="s in shares" :key="s.key" :class="`label--${s.key}`" :style="{ flex: s.amount }">
        <b>{{ billions(s.amount) }}</b>
        <span>{{ s.label }} · {{ Math.round((s.amount / total) * 100) }}%</span>
        <small v-if="s.note">{{ s.note }}</small>
      </div>
    </div>

    <h3 class="q">Federal grants so far</h3>
    <div class="fedbar" role="img" :aria-label="`${billions(paid)} paid, ${billions(obligated - paid)} released, ${billions(committed - obligated)} to come`">
      <div class="fedbar-paid" :style="{ width: pct(paid, committed) }" />
      <div class="fedbar-released" :style="{ width: pct(obligated - paid, committed) }" />
    </div>
    <div class="fed-labels">
      <div>
        <b class="paid">{{ billions(paid) }} paid</b>
        <span>for work already done</span>
      </div>
      <div>
        <b class="released">{{ billions(obligated - paid) }} released</b>
        <span>available, not yet paid</span>
      </div>
      <div>
        <b class="to-come">{{ billions(committed - obligated) }} to come</b>
        <span>promised in signed agreements, released year by year</span>
      </div>
    </div>

    <h3 class="q">Federal payments by month</h3>
    <div class="legend">
      <span><i class="swatch swatch--gdc" />To GDC for the tunnel</span>
      <span><i class="swatch swatch--amtrak" />To Amtrak for the Hudson Yards casing</span>
    </div>
    <div ref="chart" class="chart">
      <svg :width="width" :height="H" :viewBox="`0 0 ${width} ${H}`" role="img" aria-label="Federal grant payments by month">
        <g v-for="t in ticks" :key="t">
          <line class="grid" :x1="AXIS" :x2="width" :y1="y(t)" :y2="y(t)" />
          <text class="axis" x="0" :y="y(t) + 3">${{ Math.round(t / 1e6) }}M</text>
        </g>
        <g v-if="freezeIdx.from >= 0 && freezeIdx.to >= 0">
          <rect
            class="freeze"
            :x="AXIS + freezeIdx.from * bw"
            :y="TOP"
            :width="(freezeIdx.to - freezeIdx.from + 1) * bw"
            :height="H - BOTTOM - TOP"
          />
          <text class="freeze-text" :x="AXIS + freezeIdx.from * bw + 5" :y="TOP + 14">Tunnel</text>
          <text class="freeze-text" :x="AXIS + freezeIdx.from * bw + 5" :y="TOP + 27">payments</text>
          <text class="freeze-text" :x="AXIS + freezeIdx.from * bw + 5" :y="TOP + 40">frozen</text>
        </g>
        <g v-for="(m, i) in months" :key="m.ym">
          <title>{{ barTitle(m) }}</title>
          <rect class="bar-hit" :x="AXIS + i * bw" :y="TOP" :width="bw" :height="H - BOTTOM - TOP" />
          <rect
            v-if="m.gdc"
            class="bar bar--gdc"
            :x="AXIS + i * bw + 2"
            :y="y(m.gdc)"
            :width="Math.max(1, bw - 4)"
            :height="y(0) - y(m.gdc)"
          />
          <rect
            v-if="m.amtrak"
            class="bar bar--amtrak"
            :x="AXIS + i * bw + 2"
            :y="y(m.gdc + m.amtrak)"
            :width="Math.max(1, bw - 4)"
            :height="y(0) - y(m.amtrak)"
          />
          <text
            v-if="xLabel(m, i)"
            class="axis"
            :x="i > months.length - 3 ? AXIS + (i + 1) * bw : AXIS + i * bw + 2"
            :text-anchor="i > months.length - 3 ? 'end' : 'start'"
            :y="H - 6"
            >{{ xLabel(m, i) }}</text
          >
        </g>
      </svg>
    </div>

    <p class="note">
      GDC pays contractors first and the federal government reimburses it, so payments trail the work by about a
      month. Federal grant figures are from
      <a href="https://www.usaspending.gov/" target="_blank" rel="noopener">USAspending.gov</a> through
      {{ throughLabel }}. The states' and Amtrak's payments aren't published monthly.
    </p>
  </div>
</template>

<style scoped>
.q {
  margin: 16px 0 6px;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}

.q:first-child {
  margin-top: 0;
}

.split {
  display: flex;
  gap: 2px;
  height: 28px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.split--federal {
  background: var(--color-primary);
}
.split--local {
  background: var(--color-accent);
}
.split--amtrak {
  background: var(--color-fund-amtrak);
}

.split-labels {
  display: flex;
  gap: 2px;
  margin-top: 6px;
}

.split-labels div {
  min-width: 0;
  padding-right: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.split-labels b,
.fed-labels b {
  display: block;
  font-family: var(--font-family-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.split-labels span,
.split-labels small {
  display: block;
}

.split-labels small {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.fedbar {
  display: flex;
  height: 16px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-line);
}

.fedbar-paid {
  background: var(--color-fund-paid);
}
.fedbar-released {
  background: var(--color-fund-released);
}

.fed-labels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.fed-labels .paid {
  color: var(--color-fund-paid);
}
.fed-labels .released {
  color: var(--color-primary);
}
.fed-labels .to-come {
  color: var(--color-text-secondary);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border-radius: 2px;
  vertical-align: -1px;
}

.swatch--gdc,
.bar--gdc {
  background: var(--color-fund-paid);
  fill: var(--color-fund-paid);
}

.swatch--amtrak,
.bar--amtrak {
  background: var(--color-fund-amtrak);
  fill: var(--color-fund-amtrak);
}

.chart {
  margin-top: 6px;
}

.chart svg {
  display: block;
}

.grid {
  stroke: var(--color-line);
}

.axis {
  font-family: var(--font-family-mono);
  font-size: 10px;
  fill: var(--color-text-tertiary);
}

.freeze {
  fill: var(--color-alert-bg);
}

.freeze-text {
  font-family: var(--font-family-mono);
  font-size: 10px;
  fill: var(--color-alert);
}

.bar-hit {
  fill: transparent;
}

g:hover > .bar-hit {
  fill: var(--color-primary-muted);
}

.note {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

@media (max-width: 600px) {
  .fed-labels {
    grid-template-columns: 1fr;
  }

  /* Labels stack instead of sitting under their (narrow) segments */
  .split-labels {
    flex-direction: column;
    gap: 6px;
  }
  .split-labels div {
    flex: none !important;
    padding-left: 14px;
    position: relative;
  }
  .split-labels div::before {
    content: "";
    position: absolute;
    left: 0;
    top: 5px;
    width: 9px;
    height: 9px;
    border-radius: 2px;
  }
  .split-labels .label--federal::before { background: var(--color-primary); }
  .split-labels .label--local::before { background: var(--color-accent); }
  .split-labels .label--amtrak::before { background: var(--color-fund-amtrak); }
}
</style>
