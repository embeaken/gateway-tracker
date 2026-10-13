// GDC's originals can be 40MB+, so every photo goes through Netlify Image CDN
// (allowed sources: [images] in netlify.toml). Local servers have no CDN, so
// they borrow production's. DEV covers phones hitting the dev server by LAN IP.
const isLocal =
  import.meta.env.DEV || ['localhost', '127.0.0.1'].includes(window.location.hostname)
const ENDPOINT = isLocal ? 'https://hudson.tube/.netlify/images' : '/.netlify/images'

export const cdnImage = (url: string, width: number) =>
  `${ENDPOINT}?${new URLSearchParams({ url, w: String(width), fm: 'webp' })}`

export const cdnSrcset = (url: string, widths: number[]) =>
  widths.map((w) => `${cdnImage(url, w)} ${w}w`).join(', ')

/**
 * Like cdnImage, but for paths served by this site's own functions (e.g.
 * /api/cam-frame/…). Locally there's no Image CDN that can reach the dev
 * server, so those load as-is.
 */
export const cdnSiteImage = (path: string, width: number) => (isLocal ? path : cdnImage(path, width))

export const cdnSiteSrcset = (path: string, widths: number[]) => (isLocal ? undefined : cdnSrcset(path, widths))
