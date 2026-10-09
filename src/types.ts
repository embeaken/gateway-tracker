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

/** A named construction section on the route diagram. */
export type RouteSegment = {
  id: string
  label: string
  fromFt: number
  toFt: number
  kind: 'bored' | 'casing'
  /** Shown instead of the computed length; null hides it */
  lengthLabel?: string | null
  /** Project id whose camera this section links to */
  cam?: string
}

/** A stop on the west→east route diagram. */
export type RouteStop = {
  id: string
  label: string
  /** Distance from the Tonnelle Ave tunnel portal, in feet (negative = west of it) */
  ft: number
  /** Project ids whose cameras live at this stop */
  cams: string[]
  /** Label placement on the horizontal map */
  side: 'above' | 'below'
}
