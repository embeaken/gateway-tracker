// GDC's originals can be 40MB+, so every photo goes through Netlify Image CDN
// (allowed sources: [images] in netlify.toml). Local servers have no CDN, so
// they borrow production's.
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const ENDPOINT = isLocal ? 'https://hudson.tube/.netlify/images' : '/.netlify/images'

export const cdnImage = (url: string, width: number) =>
  `${ENDPOINT}?${new URLSearchParams({ url, w: String(width), fm: 'webp' })}`

export const cdnSrcset = (url: string, widths: number[]) =>
  widths.map((w) => `${cdnImage(url, w)} ${w}w`).join(', ')

/** For "view the photo" links: wider than any screen; the CDN never upscales. */
export const cdnFullImage = (url: string) => cdnImage(url, 4000)
