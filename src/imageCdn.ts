// Gateway publishes enormous originals (some photos are 40MB+), so every photo
// we show goes through Netlify Image CDN to be resized and re-encoded.
// Allowed source domains live in netlify.toml ([images] remote_images).
//
// There's no CDN on a local dev/preview server, so borrow production's rather
// than downloading the originals.

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const ENDPOINT = isLocal ? 'https://hudson.tube/.netlify/images' : '/.netlify/images'

/** A resized WebP of `url`, `width` px wide. */
export const cdnImage = (url: string, width: number) =>
  `${ENDPOINT}?${new URLSearchParams({ url, w: String(width), fm: 'webp' })}`

/** A `srcset` of resized WebPs, so the browser picks a size for the screen. */
export const cdnSrcset = (url: string, widths: number[]) =>
  widths.map((w) => `${cdnImage(url, w)} ${w}w`).join(', ')
