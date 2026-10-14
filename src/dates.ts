const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Date-only strings ("2026-10-01") parse as UTC midnight, which is the previous
 * day in US timezones, so anchor them to local noon instead.
 */
export const parseDate = (date: string) =>
  DATE_ONLY_RE.test(date) ? new Date(`${date}T12:00:00`) : new Date(date)

/** "Oct 1, 2026" */
export const formatShortDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** "October 2026" */
export const formatMonthYear = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

/** "October 8, 2026" */
export const formatLongDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

// The cameras' days are New York days, wherever the visitor is.
const NY = 'America/New_York'
const DAY_MS = 86_400_000
const utcDay = (ymd: string) => Date.parse(`${ymd}T00:00:00Z`)

/** "2026-10-10": the New York calendar day of a moment */
export const nyDate = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: NY })

/** "2026-10-11" for ("2026-10-10", 1) */
export const addDays = (ymd: string, n: number) => new Date(utcDay(ymd) + n * DAY_MS).toISOString().slice(0, 10)

/** Whole days from a to b (both "YYYY-MM-DD") */
export const daysBetween = (a: string, b: string) => Math.round((utcDay(b) - utcDay(a)) / DAY_MS)

/** "3:42 PM" in New York */
export const formatNyTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { timeZone: NY, hour: 'numeric', minute: '2-digit' })

/** Minutes since midnight in New York, for sorting photos into a time of day */
export const nyMinutes = (iso: string) => {
  const [h = 0, m = 0] = new Date(iso)
    .toLocaleTimeString('en-GB', { timeZone: NY, hour: '2-digit', minute: '2-digit', hour12: false })
    .split(':')
    .map(Number)
  return h * 60 + m
}
