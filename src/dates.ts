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

// The cameras' days are New York days, wherever the visitor is. The
// formatters are created once: some of these run for every photo of a day.
const NY = 'America/New_York'
const DAY_MS = 86_400_000
const utcDay = (ymd: string) => Date.parse(`${ymd}T00:00:00Z`)
const nyDay = new Intl.DateTimeFormat('en-CA', { timeZone: NY })
const nyLongDay = new Intl.DateTimeFormat('en-US', { timeZone: NY, month: 'long', day: 'numeric', year: 'numeric' })
const nyTime = new Intl.DateTimeFormat('en-US', { timeZone: NY, hour: 'numeric', minute: '2-digit' })
const nyClock = new Intl.DateTimeFormat('en-GB', { timeZone: NY, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** "2026-10-10": the New York calendar day of a moment */
export const nyDate = (d: Date) => nyDay.format(d)

/** "2026-10-11" for ("2026-10-10", 1) */
export const addDays = (ymd: string, n: number) => new Date(utcDay(ymd) + n * DAY_MS).toISOString().slice(0, 10)

/** Whole days from a to b (both "YYYY-MM-DD") */
export const daysBetween = (a: string, b: string) => Math.round((utcDay(b) - utcDay(a)) / DAY_MS)

/** "October 10, 2026" in New York */
export const formatNyDate = (iso: string) => nyLongDay.format(new Date(iso))

/** "3:42 PM" in New York */
export const formatNyTime = (iso: string) => nyTime.format(new Date(iso))

/** Minutes since midnight in New York */
export const nyMinutes = (iso: string) => {
  const [h = 0, m = 0] = nyClock.format(new Date(iso)).split(':').map(Number)
  return h * 60 + m
}
