import type { GalleryImage, BlueskyPost, PressRelease, ConstructionNotice, YoutubeVideo } from './activityDataTypes'
import data from './activityData.json'

type ActivityData = {
  images: GalleryImage[]
  blueskyPosts: BlueskyPost[]
  pressReleases: PressRelease[]
  constructionNotices: ConstructionNotice[]
  youtubeVideos: YoutubeVideo[]
}

const activityData = data as ActivityData

export const images = activityData.images
export const blueskyPosts = activityData.blueskyPosts
export const pressReleases = activityData.pressReleases
export const constructionNotices = activityData.constructionNotices
export const youtubeVideos = activityData.youtubeVideos
