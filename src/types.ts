export type Project = {
  /** URL-safe id, used for #cam-{id} anchors */
  id: string
  name: string
  /** Short label used on the route map */
  short: string
  desc: string
  earthcam: string
  facts: ProjectFact[]
}

export type ProjectFact = {
  label: string
  value: string
}

/** A named tunnel section on the route diagram. */
export type RouteSegment = {
  id: string
  label: string
  fromFt: number
  toFt: number
}

/** A stop on the west→east route diagram. */
export type RouteStop = {
  id: string
  label: string
  /** Distance along the new tunnel from the North Bergen portal, in feet */
  ft: number
  /** Project ids whose cameras live at this stop */
  cams: string[]
  /** Label placement on the horizontal map (the Manhattan end is crowded) */
  side: 'above' | 'below'
  align?: 'start' | 'center' | 'end'
}
