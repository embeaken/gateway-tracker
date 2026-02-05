export type Project = {
  name: string
  desc: string
  earthcam: string
  facts: ProjectFact[]
}

export type ProjectFact = {
  label: string
  value: string
}
