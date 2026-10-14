// GET /api/cam-archive/:site/:camera?ref=…&date=YYYY-MM-DD
// One New York day's stills (every 10 minutes) as /api/cam-frame paths. Past
// days never change, so they're cached for a year; today for five minutes.
// See src/earthcam.ts.
import { projects } from '../../src/assets/data'
import { nyDate } from '../../src/dates'
import { earthcamPage, errorMessage, fetchEarthcam, framePath, isoDate, jsonResponse, type CamFramesResponse } from '../../src/earthcam'

type Context = { params: Record<string, string> }

export default async (req: Request, context: Context) => {
  const { site, camera = '' } = context.params
  const q = new URL(req.url).searchParams
  const ref = q.get('ref') ?? ''
  const date = q.get('date') ?? ''

  const project = projects.find((p) => p.id === site)
  if (!project || !/^\w+$/.test(camera) || !/^[\w-]+$/.test(ref) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonResponse({ error: 'Not found' }, 404, 'public, max-age=3600')
  }

  let items: { url: string; datetime: string }[]
  try {
    const query = new URLSearchParams({ ref, direction: '1' })
    const res = await fetchEarthcam(`${earthcamPage(project.earthcam)}/${camera}/archive/day/${date}?${query}`)
    if (!res.ok) throw new Error(`EarthCam returned HTTP ${res.status}`)
    items = (await res.json()) as typeof items
  } catch (e) {
    return jsonResponse({ error: errorMessage(e) }, 502, 'no-store')
  }

  const frames = items.flatMap((i) => {
    const frame = framePath(i.url)
    return frame ? [{ frame, takenAt: isoDate(i.datetime) }] : []
  })
  const cache = date >= nyDate(new Date()) ? 'public, max-age=60, s-maxage=300' : 'public, max-age=86400, s-maxage=31536000, immutable'
  return jsonResponse({ frames } satisfies CamFramesResponse, 200, cache)
}

export const config = { path: '/api/cam-archive/:site/:camera' }
