// GET /api/cam-archive/:site/:camera?ref=…&kind=day|daily&date=YYYY-MM-DD
// One day's stills at 10-minute intervals (`day`), or the month's noon stills
// (`daily`, `date` is any day in the month). Frames come back as /api/cam-frame
// paths. Past days and months never change, so they're cached for a year;
// the current one for five minutes. See src/earthcam.ts.
import { projects } from '../../src/assets/data'
import { USER_AGENT, earthcamPage, framePath, isoDate, type CamArchiveResponse } from '../../src/earthcam'

type Context = { params: Record<string, string> }
type Item = { url: string; datetime: string }

const json = (body: unknown, status: number, cache: string) =>
  Response.json(body, { status, headers: { 'Cache-Control': cache, 'Netlify-CDN-Cache-Control': cache } })

export default async (req: Request, context: Context) => {
  const { site = '', camera = '' } = context.params
  const q = new URL(req.url).searchParams
  const ref = q.get('ref') ?? ''
  const kind = q.get('kind')
  const date = q.get('date') ?? ''

  const project = projects.find((p) => p.id === site)
  if (!project || !/^\w+$/.test(camera) || !/^[\w-]+$/.test(ref) || (kind !== 'day' && kind !== 'daily') || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'Not found' }, 404, 'public, max-age=3600')
  }

  const url = `https://share.earthcam.net/api/v2/public/page/${earthcamPage(project.earthcam)}/${camera}/archive/${kind}/${date}?${new URLSearchParams({ ref, direction: '1' })}`
  let items: Item[]
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`EarthCam returned HTTP ${res.status}`)
    items = (await res.json()) as Item[]
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502, 'no-store')
  }

  const frames = items.flatMap((i) => {
    const frame = framePath(i.url)
    return frame ? [{ frame, takenAt: isoDate(i.datetime) }] : []
  })

  // Dates are the camera's local days (New York). Anything before the current
  // day (or month) is final.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const current = kind === 'day' ? date >= today : date.slice(0, 7) >= today.slice(0, 7)
  const cache = current ? 'public, max-age=60, s-maxage=300' : 'public, max-age=86400, s-maxage=31536000, immutable'
  return json({ frames } satisfies CamArchiveResponse, 200, cache)
}

export const config = { path: '/api/cam-archive/:site/:camera' }
