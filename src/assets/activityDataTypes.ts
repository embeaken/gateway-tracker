export type GalleryImage = {
  url: string
  caption: string
  date: string
}

export type BlueskyPost = {
  text: string
  date: string
  link: string
  imageUrl?: string
}

export type PressRelease = {
  title: string
  date: string
  link: string
}

export type ConstructionNotice = {
  title: string
  date: string
  link: string
}
