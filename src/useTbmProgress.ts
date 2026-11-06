import { computed, onMounted, onUnmounted, ref } from 'vue'
import { PALISADES_DRIVE, tbms, type Tbm } from './assets/data'

const TZ = 'America/New_York'
const DAY_MS = 86_400_000

/** Calendar date in New York as a UTC-midnight timestamp (for day arithmetic). */
const nyDay = (d: Date) => Date.parse(`${d.toLocaleDateString('en-CA', { timeZone: TZ })}T00:00:00Z`)
const dateDay = (yyyyMmDd: string) => Date.parse(`${yyyyMmDd}T00:00:00Z`)

/** Fraction of the current New York day that has elapsed, 0–1. */
const nyDayFraction = (d: Date) => {
  const [h = 0, m = 0] = d
    .toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
    .split(':')
    .map(Number)
  return (h * 60 + m) / 1440
}

export type TbmProgress = {
  tbm: Tbm
  status: 'upcoming' | 'mining' | 'arrived'
  /** Estimated feet bored */
  ft: number
  /** 0–1 */
  fraction: number
  /** Estimated arrival at the Hudson County shaft */
  arrival: Date | null
}

/** An even pace per weekday that finishes the drive on GDC's schedule. The machines don't mine on weekends. */
const FT_PER_WORKDAY = PALISADES_DRIVE.lengthFt / PALISADES_DRIVE.durationWorkdays

const isWorkday = (day: number) => {
  const dow = new Date(day).getUTCDay()
  return dow !== 0 && dow !== 6
}

/** Whole weekdays in [from, to), both UTC-midnight day timestamps. */
const workdaysBetween = (from: number, to: number) => {
  let n = 0
  for (let d = from; d < to; d += DAY_MS) if (isWorkday(d)) n++
  return n
}

/** Midnight of the day on which `n` weekdays have passed since `from`. */
const addWorkdays = (from: number, n: number) => {
  let d = from
  let left = n
  while (left > 0) {
    if (isWorkday(d)) left--
    d += DAY_MS
  }
  return d
}

const estimate = (tbm: Tbm, now: Date): TbmProgress => {
  const { lengthFt } = PALISADES_DRIVE
  if (!tbm.launched) return { tbm, status: 'upcoming', ft: 0, fraction: 0, arrival: null }

  // Run forward from the latest reported figure if there is one, else from launch.
  const anchorDay = dateDay(tbm.reported?.date ?? tbm.launched)
  const anchorFt = tbm.reported?.ft ?? 0
  const today = nyDay(now)
  const workdays = Math.max(
    0,
    workdaysBetween(anchorDay, today) + (isWorkday(today) ? nyDayFraction(now) : 0),
  )
  const ft = Math.min(lengthFt, anchorFt + workdays * FT_PER_WORKDAY)
  const arrival = new Date(addWorkdays(anchorDay, Math.ceil((lengthFt - anchorFt) / FT_PER_WORKDAY)))

  return { tbm, status: ft >= lengthFt ? 'arrived' : 'mining', ft, fraction: ft / lengthFt, arrival }
}

/** Estimated progress for every TBM, re-evaluated every minute. */
export function useTbmProgress() {
  const now = ref(new Date())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => (now.value = new Date()), 60_000)
  })
  onUnmounted(() => window.clearInterval(timer))

  return computed(() => tbms.map((tbm) => estimate(tbm, now.value)))
}

export const formatPct = (fraction: number) => {
  const pct = fraction * 100
  return pct > 0 && pct < 1 ? '<1%' : `${Math.floor(pct)}%`
}

export const formatFt = (ft: number) => `${Math.round(ft).toLocaleString('en-US')}-foot`
