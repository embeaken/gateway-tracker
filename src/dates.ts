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
