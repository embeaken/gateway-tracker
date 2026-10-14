// GET /api/cam-panoramas/:site/:camera
// Every regular panorama capture for one camera, oldest first, as /api/cam-frame
// paths. Captures are near-daily and only their dates matter, so they come from
// EarthCam's month listings: one request per month since the first capture,
// found on the site's page. (EarthCam's "Ultra HD" panoramas are left out:
// they're taken every few weeks.) See src/earthcam.ts.
import { projects } from '../../src/assets/data'
import { nyDate } from '../../src/dates'
import {
  earthcamPage,
  errorMessage,
  fetchEarthcam,
  framePath,
  isoDate,
  jsonResponse,
  type CamFrame,
  type CamFramesResponse,
  type EarthCamPage,
} from '../../src/earthcam'

type Context = { params: Record<string, string> }
type Item = { url: string; datetime: string; full?: { url: string } }

async function getJson<T>(path: string, emptyIfMissing = false): Promise<T | null> {
  const res = await fetchEarthcam(path)
  // A month with no captures comes back as 204, 403 or 404
  if (emptyIfMissing && [204, 403, 404].includes(res.status)) return null
  if (!res.ok) throw new Error(`EarthCam returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export default async (_req: Request, context: Context) => {
  const { site, camera = '' } = context.params
  const project = projects.find((p) => p.id === site)
  if (!project || !/^\w+$/.test(camera)) return jsonResponse({ error: 'Not found' }, 404, 'public, max-age=3600')
  const page = earthcamPage(project.earthcam)

  let items: Item[]
  try {
    const start = (await getJson<EarthCamPage>(page))?.cameras
      .find((c) => c.short_name === camera)
      ?.archives.find((a) => a.type === 'panorama' && a.ref === 'regular')?.start_datetime
    if (!start) return jsonResponse({ error: 'Not found' }, 404, 'public, max-age=3600')

    // The first of each month from the first capture to now
    const thisMonth = nyDate(new Date()).slice(0, 7)
    const months: string[] = []
    for (let d = new Date(`${start.slice(0, 7)}-01T00:00:00Z`); d.toISOString().slice(0, 7) <= thisMonth; d.setUTCMonth(d.getUTCMonth() + 1)) {
      months.push(d.toISOString().slice(0, 10))
    }
    const base = `${page}/${camera}/panorama/regular/daily`
    items = (await Promise.all(months.map((m) => getJson<Item[]>(`${base}/${m}?direction=1`, true)))).flatMap((l) => l ?? [])
  } catch (e) {
    return jsonResponse({ error: errorMessage(e) }, 502, 'no-store')
  }

  const byFrame = new Map<string, CamFrame>()
  for (const i of items) {
    // The preview is small; the "full" object is what EarthCam resizes from
    const frame = framePath((i.full ?? i).url)
    if (frame) byFrame.set(frame, { frame, takenAt: isoDate(i.datetime) })
  }
  const frames = [...byFrame.values()].sort((a, b) => a.takenAt.localeCompare(b.takenAt))
  return jsonResponse({ frames } satisfies CamFramesResponse, 200, 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')
}

export const config = { path: '/api/cam-panoramas/:site/:camera' }
