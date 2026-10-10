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

/** An even pace that finishes the drive on GDC's schedule */
const FT_PER_DAY = PALISADES_DRIVE.lengthFt / PALISADES_DRIVE.durationDays

const estimate = (tbm: Tbm, now: Date): TbmProgress => {
  const { lengthFt } = PALISADES_DRIVE
  if (!tbm.launched) return { tbm, status: 'upcoming', ft: 0, fraction: 0, arrival: null }

  // Run forward from the latest reported figure if there is one, else from launch.
  const anchorDay = dateDay(tbm.reported?.date ?? tbm.launched)
  const anchorFt = tbm.reported?.ft ?? 0
  const days = Math.max(0, (nyDay(now) - anchorDay) / DAY_MS + nyDayFraction(now))
  const ft = Math.min(lengthFt, anchorFt + days * FT_PER_DAY)
  const arrival = new Date(anchorDay + ((lengthFt - anchorFt) / FT_PER_DAY) * DAY_MS)

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
