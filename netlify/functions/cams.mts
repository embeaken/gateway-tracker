// GET /api/cams: the latest still for every camera view on the site.
// Cached at Netlify's CDN, so EarthCam sees one request per site every few
// minutes no matter how many people load the dashboard. See src/earthcam.ts.
import { projects } from '../../src/assets/data'
import { earthcamPage, errorMessage, fetchEarthcam, framePath, isoDate, type CamSite, type CamView, type CamsResponse, type EarthCamPage } from '../../src/earthcam'

async function fetchSite(projectId: string, playerUrl: string): Promise<CamSite> {
  try {
    const res = await fetchEarthcam(earthcamPage(playerUrl), 8000)
    if (!res.ok) throw new Error(`EarthCam returned HTTP ${res.status}`)
    const page = (await res.json()) as EarthCamPage

    const views: CamView[] = []
    const panoramas: string[] = []
    for (const { short_name: camera, archives } of page.cameras) {
      for (const a of archives) {
        if (a.type === 'panorama' && a.ref === 'regular') panoramas.push(camera)
        const frame = a.type === 'archive' && a.image && a.ref && a.start_datetime && framePath(a.image.url)
        if (frame) views.push({ frame, takenAt: isoDate(a.image!.datetime), camera, ref: a.ref!, slug: a.slug, since: isoDate(a.start_datetime!) })
      }
    }
    return { projectId, views, panoramas }
  } catch (e) {
    return { projectId, views: [], panoramas: [], error: errorMessage(e) }
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
