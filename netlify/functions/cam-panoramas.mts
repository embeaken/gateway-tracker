// GET /api/cam-panoramas/:site/:camera?since=YYYY-MM-DD
// Every panorama capture for one camera, oldest first, as /api/cam-frame paths.
// Captures are near-daily and dates, not times, so they come from EarthCam's
// month listings. Old captures never change, so the result is cached for an
// hour at the CDN. (EarthCam's "Ultra HD" panoramas are left out: they're taken
// every few weeks.) See src/earthcam.ts.
import { projects } from '../../src/assets/data'
import { USER_AGENT, earthcamPage, framePath, isoDate, type CamFrame, type CamPanoramasResponse } from '../../src/earthcam'

type Context = { params: Record<string, string> }
type Item = { url: string; datetime: string; full?: { url: string } }

const json = (body: unknown, status: number, cache: string) =>
  Response.json(body, { status, headers: { 'Cache-Control': cache, 'Netlify-CDN-Cache-Control': cache } })

const addDays = (ymd: string, n: number) => new Date(Date.parse(`${ymd}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)

export default async (req: Request, context: Context) => {
  const { site = '', camera = '' } = context.params
  const since = new URL(req.url).searchParams.get('since') ?? ''

  const project = projects.find((p) => p.id === site)
  if (!project || !/^\w+$/.test(camera) || !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    return json({ error: 'Not found' }, 404, 'public, max-age=3600')
  }

  const base = `https://share.earthcam.net/api/v2/public/page/${earthcamPage(project.earthcam)}/${camera}/panorama/regular/daily`
  /** One month's captures (any date in the month), or none when EarthCam has nothing (204/403/404) */
  async function month(date: string): Promise<Item[]> {
    const res = await fetch(`${base}/${date}?direction=1`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })
    if (res.status === 204 || res.status === 403 || res.status === 404) return []
    if (!res.ok) throw new Error(`EarthCam returned HTTP ${res.status}`)
    return (await res.json()) as Item[]
  }

  // The first of each month from the first capture to now (28 + 4 days is always next month)
  const thisMonth = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }).slice(0, 7)
  const months: string[] = []
  for (let m = `${since.slice(0, 7)}-01`; m.slice(0, 7) <= thisMonth; m = `${addDays(`${m.slice(0, 7)}-28`, 4).slice(0, 7)}-01`) months.push(m)

  let items: Item[]
  try {
    items = (await Promise.all(months.map(month))).flat()
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502, 'no-store')
  }

  const byFrame = new Map<string, CamFrame>()
  for (const i of items) {
    // The preview is small; the "full" object is what EarthCam resizes from
    const frame = framePath((i.full ?? i).url)
    if (frame) byFrame.set(frame, { frame, takenAt: isoDate(i.datetime) })
  }
  const captures = [...byFrame.values()].sort((a, b) => a.takenAt.localeCompare(b.takenAt))
  return json({ captures } satisfies CamPanoramasResponse, 200, 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')
}

export const config = { path: '/api/cam-panoramas/:site/:camera' }
