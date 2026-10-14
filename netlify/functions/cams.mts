// GET /api/cams: the latest still for every camera view on the site.
// Cached at Netlify's CDN, so EarthCam sees one request per site every few
// minutes no matter how many people load the dashboard. See src/earthcam.ts.
import { projects } from '../../src/assets/data'
import { USER_AGENT, earthcamPage, framePath, isoDate, type CamPano, type CamSite, type CamView, type CamsResponse } from '../../src/earthcam'

type EarthCamPage = {
  cameras: {
    short_name: string
    archives: {
      type: string
      ref?: string
      start_datetime?: string
      image?: { url: string; datetime: string }
    }[]
  }[]
}

async function fetchSite(projectId: string, playerUrl: string): Promise<CamSite> {
  try {
    const res = await fetch(`https://share.earthcam.net/api/v2/public/page/${earthcamPage(playerUrl)}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`EarthCam returned HTTP ${res.status}`)
    const page = (await res.json()) as EarthCamPage

    const views: CamView[] = page.cameras.flatMap((camera) =>
      camera.archives.flatMap((a) => {
        const frame = a.type === 'archive' && a.image && a.ref && a.start_datetime && framePath(a.image.url)
        return frame
          ? [{ frame, takenAt: isoDate(a.image!.datetime), camera: camera.short_name, ref: a.ref!, since: isoDate(a.start_datetime!) }]
          : []
      }),
    )
    const panoramas: CamPano[] = page.cameras.flatMap((camera) =>
      camera.archives.flatMap((a) =>
        a.type === 'panorama' && a.ref === 'regular' && a.image && a.start_datetime
          ? [{ camera: camera.short_name, since: isoDate(a.start_datetime), takenAt: isoDate(a.image.datetime) }]
          : [],
      ),
    )
    return { projectId, views, panoramas }
  } catch (e) {
    return { projectId, views: [], panoramas: [], error: e instanceof Error ? e.message : String(e) }
  }
}

export default async () => {
  const body: CamsResponse = {
    fetchedAt: new Date().toISOString(),
    sites: await Promise.all(projects.map((p) => fetchSite(p.id, p.earthcam))),
  }
  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=60',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=300, stale-while-revalidate=600',
    },
  })
}

export const config = { path: '/api/cams' }
