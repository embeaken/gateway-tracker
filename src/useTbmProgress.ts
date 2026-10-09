import { computed, onMounted, onUnmounted, ref } from 'vue'
import { PALISADES_DRIVE, tbms, type Tbm } from './assets/data'

const TZ = 'America/New_York'
const DAY_MS = 86_400_000

/** Calendar date in New York as a UTC-midnight timestamp (for day arithmetic). */
const nyDay = (d: Date) => Date.parse(`${d.toLocaleDateString('en-CA', { timeZone: TZ })}T00:00:00Z`)
const dateDay = (yyyyMmDd: string) => Date.parse(`${yyyyMmDd}T00:00:00Z`)

/** Fraction of the current New York day that has elapsed, 0–1. */
const nyDayFraction = (d: Date) => {
  const [h, m] = d
    .toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
    .split(':')
    .map(Number)
  return ((h ?? 0) * 60 + (m ?? 0)) / 1440
}

export type TbmProgress = {
  tbm: Tbm
  status: 'upcoming' | 'mining' | 'arrived'
  /** Day N of mining (1 on launch day); 0 if not launched */
  day: number
  /** Estimated feet bored */
  ft: number
  /** 0–1 */
  fraction: number
  /** Estimated arrival at the Hudson County shaft */
  arrival: Date | null
}

const estimate = (tbm: Tbm, now: Date): TbmProgress => {
  const { lengthFt, rateFtPerDay } = PALISADES_DRIVE
  if (!tbm.launched) {
    return { tbm, status: 'upcoming', day: 0, ft: 0, fraction: 0, arrival: null }
  }

  const today = nyDay(now)
  const day = Math.floor((today - dateDay(tbm.launched)) / DAY_MS) + 1

  // Anchor to the latest real figure if there is one, else to launch day.
  const anchorDay = dateDay(tbm.reported?.date ?? tbm.launched)
  const anchorFt = tbm.reported?.ft ?? 0
  const daysSinceAnchor = Math.max(0, (today - anchorDay) / DAY_MS + nyDayFraction(now))

  const ft = Math.min(lengthFt, anchorFt + daysSinceAnchor * rateFtPerDay)
  const arrival = new Date(anchorDay + ((lengthFt - anchorFt) / rateFtPerDay) * DAY_MS)

  return {
    tbm,
    status: ft >= lengthFt ? 'arrived' : 'mining',
    day,
    ft,
    fraction: ft / lengthFt,
    arrival,
  }
}

/** Estimated progress for every TBM. Re-evaluates every minute. */
export function useTbmProgress() {
  const now = ref(new Date())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => (now.value = new Date()), 60_000)
  })
  onUnmounted(() => window.clearInterval(timer))

  const progress = computed(() => tbms.map((tbm) => estimate(tbm, now.value)))
  const lead = computed(() => progress.value[0]!)

  return { progress, lead }
}

export const formatPct = (fraction: number) => {
  const pct = fraction * 100
  if (pct > 0 && pct < 1) return '<1%'
  return `${Math.floor(pct)}%`
}

export const formatFt = (ft: number) => `${Math.round(ft).toLocaleString('en-US')} ft`

export const formatMonth = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
