import type { Project, RouteStop } from "../types";

export const projects: Project[] = [
  {
    id: "palisades-tunnel",
    name: "Palisades Tunnel Project",
    short: "Palisades Tunnel",
    desc: "This project will drill the first section of tunnel through the NJ Palisades from North Bergen to Hudson County.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DHnIWc3K6LbTCb94NA4Z6s/tonnelle_ave_bridge",
    facts: [
      { label: "Construction status", value: "TBM 1 began mining Oct 8, 2026. TBM 2 launches later this fall." },
      { label: "Location", value: "North Bergen, NJ" },
    ],
  },
  {
    id: "launch-box",
    name: "Palisades TBM Launch Box",
    short: "Launch box",
    desc: "This is the view from the tunnel's west portal, where the first TBM was assembled and launched.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DYh7fIx4oqpKxs7kkPWy_A/palisades_portal_site",
    facts: [
      { label: "Construction status", value: "TBM 1 began mining Oct 8, 2026. TBM 2 launches later this fall." },
      { label: "Location", value: "North Bergen, NJ" },
    ],
  },
  {
    id: "hudson-county-shaft",
    name: "Hudson County Access Shaft",
    short: "Hudson County shaft",
    desc: "TBMs will drill east from Tonnelle Avenue to this access shaft. The Hudson River Tunnel TBMs will then launch from here.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88GNFxpIIqJR7pVbVOesSSvk/hudson_county_shaft_site",
    facts: [
      {
        label: "Construction status",
        value: "Shaft excavation in progress",
      },
      { label: "Location", value: "Hudson County, NJ" },
    ],
  },
  {
    id: "river",
    name: "Hudson River Ground Stabilization",
    short: "Ground stabilization",
    desc: "The soil beneath the Hudson River is being reinforced to create a stable foundation that the TBMs can drill through.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88NgWcY4qcaFR1ARpUFeGtWU/311_-_11th_ave",
    facts: [
      { label: "Construction status", value: "Ground stabilization 80% complete, progress of pier removal unknown" },
      { label: "Location", value: "Hudson River near 30th Street" },
    ],
  },
  {
    id: "manhattan-shaft",
    name: "Manhattan Access Shaft",
    short: "Manhattan shaft",
    desc: "The Hudson River TBMs will emerge here when they're done drilling.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88O0s3ogRDpd-gZcv_VlnrGM/311_-_11th_ave",
    facts: [
      {
        label: "Construction status",
        value: "Shaft excavation in progress",
      },
      { label: "Location", value: "12th Avenue & 30th Street" },
    ],
  },
  {
    id: "hudson-yards",
    name: "Hudson Yards Concrete Casing – Section 3",
    short: "Hudson Yards casing",
    desc: "This project will connect the new tunnel to Penn Station.",
    earthcam: "https://share.earthcam.net/public/edgenyc/hudson_yards/camera",
    facts: [
      { label: "Construction status", value: "Tunnel roof installation in progress. Substantial completion is expected by the end of 2026." },
      { label: "Location", value: "Hudson Yards between 11th and 12th Avenues" },
    ],
  },
];

// West → east. Positions are schematic, not to scale.
export const routeStops: RouteStop[] = [
  {
    id: "portal",
    label: "Palisades portal",
    sublabel: "North Bergen, NJ",
    at: 3,
    cams: ["palisades-tunnel", "launch-box"],
    state: "active",
  },
  {
    id: "hudson-county-shaft",
    label: "Hudson County shaft",
    sublabel: "Weehawken / Hoboken",
    at: 36,
    cams: ["hudson-county-shaft"],
    state: "active",
  },
  {
    id: "river",
    label: "Under the Hudson",
    sublabel: "Ground stabilization",
    at: 54,
    cams: ["river"],
    state: "active",
  },
  {
    id: "manhattan-shaft",
    label: "Manhattan shaft",
    sublabel: "12th Ave & 30th St",
    at: 72,
    cams: ["manhattan-shaft"],
    state: "active",
  },
  {
    id: "hudson-yards",
    label: "Hudson Yards casing",
    sublabel: "11th–12th Aves",
    at: 85,
    cams: ["hudson-yards"],
    state: "active",
  },
  {
    id: "penn",
    label: "Penn Station",
    sublabel: "Midtown Manhattan",
    at: 97,
    cams: [],
    state: "endpoint",
  },
];

/** The first TBM started mining on this date (GDC press release, Oct 8 2026). */
export const MINING_START = "2026-10-08";
/** Length of the Palisades Tunnel drive, portal → Hudson County shaft. */
export const PALISADES_DRIVE_FT = 5100;
