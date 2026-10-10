export type Project = {
  /** Used for #cam-{id} anchors */
  id: string
  name: string
  desc: string
  earthcam: string
  status: string
  location: string
}

/** Project id of the construction camera at a route section or stop */
type Cam = { cam?: string }

export type RouteSegment = Cam & {
  id: string
  label: string
  fromFt: number
  toFt: number
  kind: 'bored' | 'casing'
}

export type RouteStop = Cam & {
  id: string
  label: string
  /** Feet east of the Tonnelle Ave portal */
  ft: number
}
