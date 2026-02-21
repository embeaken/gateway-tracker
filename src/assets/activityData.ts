import type { GalleryImage, BlueskyPost, PressRelease, ConstructionNotice } from './activityDataTypes'
import data from './activityData.json'

export const images = data.images as GalleryImage[]
export const blueskyPosts = data.blueskyPosts as BlueskyPost[]
export const pressReleases = data.pressReleases as PressRelease[]
export const constructionNotices = data.constructionNotices as ConstructionNotice[]
