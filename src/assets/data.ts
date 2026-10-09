import type { Project, RouteSegment, RouteStop } from "../types";

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

// ---------------------------------------------------------------------------
// Route geometry, in feet from the Tonnelle Avenue tunnel portal (west → east).
//
// Lengths are GDC's published figures:
//   NJ Surface Alignment, County Road (Secaucus) → portal ... ~1.5 mi
//     gatewayprogram.org/nj-surface-alignment.html
//   Palisades Tunnel, portal → Hudson County Shaft ......... 5,100 ft
//     gatewayprogram.org/palisades-tunnel-project.html
//   Hudson River Tunnel Section, HC Shaft → 12th Ave Shaft . ~7,250 ft
//     gatewayprogram.org/wp-content/uploads/2026/04/P1C-Contract-Award-Press-Release.pdf
//   Manhattan Tunnel, Manhattan bulkhead → casing ............ ~700 ft
//     gatewayprogram.org/manhattan-tunnel-project.html
//   Hudson Yards Concrete Casing §3, → 11th Ave .............. ~500 ft
//   Hudson Yards Concrete Casing §1–2, 11th → 10th Ave ....... ~1 block
//     gatewayprogram.org/hudson-yards-concrete-casing-section-3.html
//
// Positions *within* the river section (NJ shoreline, ground stabilization
// zone, Manhattan bulkhead) are measured off GDC's "Tunneling Under the Hudson
// River" profile, April 2026 board presentation, slide 14:
//   gatewayprogram.org/wp-content/uploads/2026/04/April-2026-Board-Meeting-Public-Presentation.pdf
// ---------------------------------------------------------------------------

const NJ_SURFACE_FT = 1.5 * 5280; // ~7,920
const HC_SHAFT_FT = 5100;
const TWELFTH_AVE_SHAFT_FT = HC_SHAFT_FT + 7250; // 12,350
const MANHATTAN_BULKHEAD_FT = HC_SHAFT_FT + 6965; // 12,065 (profile)
const CASING_START_FT = MANHATTAN_BULKHEAD_FT + 700; // 12,765
const TENTH_AVE_FT = CASING_START_FT + 500 + 800; // ~14,065

export const ROUTE = {
  /** County Road, Secaucus: west end of the NJ Surface Alignment (the NEC widens from 2 to 4 tracks) */
  westFt: -NJ_SURFACE_FT,
  /** Tie-in to the Penn Station approach tracks, just east of 10th Ave */
  eastFt: TENTH_AVE_FT + 300,
  /** NJ waterfront (profile: ~1,480 ft east of the HC shaft) */
  riverFromFt: HC_SHAFT_FT + 1480,
  riverToFt: MANHATTAN_BULKHEAD_FT,
} as const;

/** Construction sections, west → east. */
export const routeSegments: RouteSegment[] = [
  {
    id: "nj-surface",
    label: "NJ Surface Alignment",
    fromFt: -NJ_SURFACE_FT,
    toFt: 0,
    kind: "surface",
    lengthLabel: "~1.5 mi",
  },
  { id: "palisades", label: "Palisades Tunnel", fromFt: 0, toFt: HC_SHAFT_FT, kind: "bored" },
  {
    id: "hudson-river",
    label: "Hudson River Tunnel",
    fromFt: HC_SHAFT_FT,
    toFt: TWELFTH_AVE_SHAFT_FT,
    kind: "bored",
  },
  {
    id: "hudson-yards",
    label: "Hudson Yards casing",
    fromFt: TWELFTH_AVE_SHAFT_FT,
    toFt: TENTH_AVE_FT + 300,
    kind: "casing",
    lengthLabel: null,
    cam: "hudson-yards",
  },
];

export const routeStops: RouteStop[] = [
  {
    id: "portal",
    label: "Tonnelle Avenue",
    ft: 0,
    cams: ["palisades-tunnel", "launch-box"],
    side: "below",
  },
  {
    id: "hudson-county-shaft",
    label: "Access shaft",
    ft: HC_SHAFT_FT,
    cams: ["hudson-county-shaft"],
    side: "above",
  },
  {
    id: "river",
    label: "Ground stabilization",
    // Midpoint of the Hudson River Ground Stabilization zone (profile)
    ft: HC_SHAFT_FT + 5735,
    cams: ["river"],
    side: "below",
  },
  {
    id: "manhattan-shaft",
    label: "Access shaft",
    ft: TWELFTH_AVE_SHAFT_FT,
    cams: ["manhattan-shaft"],
    side: "above",
  },
];

// ---------------------------------------------------------------------------
// Tunnel boring: the Palisades drive (portal → Hudson County shaft)
// Source: GDC press release, Oct 8 2026
// https://www.gatewayprogram.org/wp-content/uploads/2026/10/TBM-Start-of-Mining-Press-Release.pdf
// ---------------------------------------------------------------------------

export const PALISADES_DRIVE = {
  lengthFt: 5100,
  /** GDC: "roughly 30 feet of tunnel per day, including scheduled pauses for maintenance" */
  rateFtPerDay: 30,
  sourceUrl:
    "https://www.gatewayprogram.org/wp-content/uploads/2026/10/TBM-Start-of-Mining-Press-Release.pdf",
} as const;

/** Back-compat alias used by copy. */
export const PALISADES_DRIVE_FT = PALISADES_DRIVE.lengthFt;

export type Tbm = {
  id: string;
  label: string;
  tube: "North" | "South";
  /** YYYY-MM-DD the machine started mining, or null if not launched yet */
  launched: string | null;
  /** Shown while `launched` is null */
  expected?: string;
  /**
   * Optional real progress report. When set, estimates run forward from this
   * figure instead of from the launch date.
   */
  reported?: { date: string; ft: number };
};

export const tbms: Tbm[] = [
  { id: "tbm-1", label: "TBM 1", tube: "North", launched: "2026-10-08" },
  { id: "tbm-2", label: "TBM 2", tube: "South", launched: null, expected: "Launching later this fall" },
];

/** The first TBM started mining on this date. */
export const MINING_START = tbms[0]!.launched!;
