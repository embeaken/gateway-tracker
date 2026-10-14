// GET /api/cam-frame/:host/:id[?size=full]: one EarthCam still at medium size
// (1440px), or larger with ?size=half|full (used when zoomed in).
// Frame URLs are unique per still, so the response is cached forever at the CDN
// and EarthCam serves each frame once. The site resizes it further through
// Netlify Image CDN. See src/earthcam.ts.
import { FRAME_SIZES, USER_AGENT, earthcamFrameUrl, type FrameSize } from '../../src/earthcam'

type Context = { params: Record<string, string> }

export default async (req: Request, context: Context) => {
  const size = new URL(req.url).searchParams.get('size') ?? 'medium'
  const url = size in FRAME_SIZES && earthcamFrameUrl(context.params.host ?? '', context.params.id ?? '', size as FrameSize)
  if (!url) return new Response('Not found', { status: 404 })

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(15000) })
  if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) {
    return new Response('Upstream error', { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': res.headers.get('content-type')!,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Netlify-CDN-Cache-Control': 'public, durable, max-age=31536000, immutable',
    },
  })
}

export const config = { path: '/api/cam-frame/:host/:id' }
