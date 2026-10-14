// Shared by the browser and the Netlify functions in netlify/functions/.
//
// EarthCam's public player pages are backed by a JSON API:
//   GET https://share.earthcam.net/api/v2/public/page/{page}
// which lists each camera's views and the latest still for each (refreshed
// every ~15 min). Every still has its own permanent URL, and EarthCam resizes
// on request with a `?Size:` suffix: thumbnail (180w), Tiny (360w),
// medium (1440w), Half (1920w), Full (4K).
//
// The browser never talks to EarthCam for stills. /api/cams (cached at
// Netlify's CDN for a few minutes) lists the latest frames, and
// /api/cam-frame fetches each frame from EarthCam once and caches it forever
// (medium by default, or ?size=full at 4K for zooming; panoramas, which are far
// wider, use ?size=half),
// so EarthCam's load stays flat however many people visit.

export const USER_AGENT = 'hudson.tube'

/** A still: our cached proxy path for it, and when it was taken */
export type CamFrame = {
  /** e.g. /api/cam-frame/resource6/AbC… */
  frame: string
  /** ISO timestamp the still was taken */
  takenAt: string
}

/** One camera view's latest still, plus what's needed to browse its archive */
export type CamView = CamFrame & {
  /** EarthCam camera short name, e.g. "camera_1" (or just "camera") */
  camera: string
  /** Archive reference for this view */
  ref: string
  /** ISO timestamp of the view's first archived still */
  since: string
}

/** GET /api/cam-panoramas/:site/:camera: every capture, oldest first */
export type CamPanoramasResponse = { captures: CamFrame[] }

/** GET /api/cam-archive/:site/:camera */
export type CamArchiveResponse = { frames: CamFrame[] }

/** A camera's panorama series, near-daily. Each capture is a date, not a time. */
export type CamPano = {
  /** EarthCam camera short name */
  camera: string
  /** ISO timestamp of the first capture */
  since: string
  /** ISO timestamp of the latest capture */
  takenAt: string
}

export type CamSite = {
  /** Project id from src/assets/data.ts */
  projectId: string
  views: CamView[]
  panoramas: CamPano[]
  /** Set when EarthCam couldn't be reached for this site */
  error?: string
}

export type CamsResponse = {
  fetchedAt: string
  sites: CamSite[]
}

/** "2026-10-10T20:32:00-0400" → ISO 8601 with a colon in the offset */
export const isoDate = (s: string) => new Date(s.replace(/([+-]\d\d)(\d\d)$/, '$1:$2')).toISOString()

/** "tJ90…/tonnelle_ave_bridge" from a share.earthcam.net player URL */
export const earthcamPage = (playerUrl: string) => {
  const path = new URL(playerUrl).pathname.replace(/^\/public\//, '')
  return path.split('/').slice(0, 2).join('/')
}

/**
 * "https://resource6.earthcam.net/v0/object/AbC…?" → "/api/cam-frame/resource6/AbC…".
 * Returns null for anything that isn't an EarthCam object URL.
 */
export const framePath = (objectUrl: string) => {
  const m = objectUrl.match(/^https:\/\/(resource\d{1,2})\.earthcam\.net\/v0\/object\/([\w-]+)\??$/)
  return m ? `/api/cam-frame/${m[1]}/${m[2]}` : null
}

/** EarthCam's size suffixes for the sizes /api/cam-frame serves (default medium, 1440w) */
export const FRAME_SIZES = { medium: 'medium', half: 'Half', full: 'Full' } as const
export type FrameSize = keyof typeof FRAME_SIZES

/** Reverse of framePath: the EarthCam URL for a validated host and object id */
export const earthcamFrameUrl = (host: string, id: string, size: FrameSize = 'medium') =>
  /^resource\d{1,2}$/.test(host) && /^[\w-]+$/.test(id)
    ? `https://${host}.earthcam.net/v0/object/${id}?Size:${FRAME_SIZES[size]}`
    : null
