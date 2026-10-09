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

/** A stop on the west→east route diagram. */
export type RouteStop = {
  id: string
  label: string
  sublabel: string
  /** Position along the route, 0–100 */
  at: number
  /** Project ids whose cameras live at this stop */
  cams: string[]
  /** Visual state of the stop */
  state: 'active' | 'endpoint'
}
