import { formatMonthYear, parseDate } from "../dates";
import type { Project, RouteSegment, RouteStop } from "../types";

export type Tbm = {
  id: string;
  label: string;
  tube: "North" | "South";
  /** YYYY-MM-DD the machine started mining, or null if not launched yet */
  launched: string | null;
  /** Month it's expected to launch, while `launched` is null */
  expected?: string;
  /** Latest official progress figure; estimates run forward from it when set */
  reported?: { date: string; ft: number };
};

export const tbms: Tbm[] = [
  { id: "tbm-1", label: "TBM 1", tube: "North", launched: "2026-10-08" },
  { id: "tbm-2", label: "TBM 2", tube: "South", launched: null, expected: "November" },
];

/** e.g. "The north tube TBM started drilling in October 2026. The south tube TBM will launch in November." */
const tbmStatus = tbms
  .map((t) =>
    t.launched
      ? `The ${t.tube.toLowerCase()} tube TBM started drilling in ${formatMonthYear(parseDate(t.launched))}.`
      : `The ${t.tube.toLowerCase()} tube TBM will launch in ${t.expected}.`,
  )
  .join(" ");

export const projects: Project[] = [
  {
    id: "palisades-tunnel",
    name: "Palisades Tunnel Project",
    desc: "This project will drill the first section of tunnel through the NJ Palisades from North Bergen to Hudson County.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DHnIWc3K6LbTCb94NA4Z6s/tonnelle_ave_bridge",
    status: tbmStatus,
    location: "North Bergen, NJ",
  },
  {
    id: "launch-box",
    name: "Palisades TBM Launch Box",
    desc: "This is the view from the tunnel's west portal, where the first TBM was assembled and launched.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DYh7fIx4oqpKxs7kkPWy_A/palisades_portal_site",
    status: tbmStatus,
    location: "North Bergen, NJ",
  },
  {
    id: "hudson-county-shaft",
    name: "Hudson County Access Shaft",
    desc: "TBMs will drill east from Tonnelle Avenue to this access shaft. The Hudson River Tunnel TBMs will then launch from here.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88GNFxpIIqJR7pVbVOesSSvk/hudson_county_shaft_site",
    status: "Shaft excavation in progress",
    location: "Hudson County, NJ",
  },
  {
    id: "river",
    name: "Hudson River Ground Stabilization",
    desc: "The soil beneath the Hudson River is being reinforced to create a stable foundation that the TBMs can drill through.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88NgWcY4qcaFR1ARpUFeGtWU/311_-_11th_ave",
    status: "80% complete",
    location: "Hudson River near 30th Street",
  },
  {
    id: "manhattan-shaft",
    name: "Manhattan Access Shaft",
    desc: "The Hudson River TBMs will emerge here when they're done drilling.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88O0s3ogRDpd-gZcv_VlnrGM/311_-_11th_ave",
    status: "Shaft excavation in progress",
    location: "12th Avenue & 30th Street",
  },
  {
    id: "hudson-yards",
    name: "Hudson Yards Concrete Casing – Section 3",
    desc: "This project will connect the new tunnel to Penn Station.",
    earthcam: "https://share.earthcam.net/public/edgenyc/hudson_yards/camera",
    status: "Tunnel roof installation in progress. Substantial completion is expected by the end of 2026.",
    location: "Hudson Yards between 11th and 12th Avenues",
  },
];

// ---------------------------------------------------------------------------
// Route geometry, in feet east of the Tonnelle Avenue tunnel portal.
//
// Section lengths are GDC's published figures:
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
// Positions within the river section (shoreline, ground stabilization,
// Manhattan bulkhead) are measured off the tunnel profile on slide 14 of:
//   gatewayprogram.org/wp-content/uploads/2026/04/April-2026-Board-Meeting-Public-Presentation.pdf
// ---------------------------------------------------------------------------

const HC_SHAFT_FT = 5100;
const TWELFTH_AVE_SHAFT_FT = HC_SHAFT_FT + 7250;
const MANHATTAN_BULKHEAD_FT = HC_SHAFT_FT + 6965;
const CASING_START_FT = MANHATTAN_BULKHEAD_FT + 700;
const TENTH_AVE_FT = CASING_START_FT + 500 + 800;

export const ROUTE = {
  /** Tie-in to the Penn Station approach tracks, just east of 10th Ave */
  eastFt: TENTH_AVE_FT + 300,
  riverFromFt: HC_SHAFT_FT + 1480,
  riverToFt: MANHATTAN_BULKHEAD_FT,
  stabilizedFromFt: HC_SHAFT_FT + 5115,
  stabilizedToFt: HC_SHAFT_FT + 6355,
} as const;

export const routeSegments: RouteSegment[] = [
  { id: "palisades", label: "Palisades Tunnel", fromFt: 0, toFt: HC_SHAFT_FT, kind: "bored", cam: "launch-box" },
  { id: "hudson-river", label: "Hudson River Tunnel", fromFt: HC_SHAFT_FT, toFt: TWELFTH_AVE_SHAFT_FT, kind: "bored" },
  {
    id: "hudson-yards",
    label: "Hudson Yards concrete casing",
    fromFt: TWELFTH_AVE_SHAFT_FT,
    toFt: ROUTE.eastFt,
    kind: "casing",
    cam: "hudson-yards",
  },
];

export const routeStops: RouteStop[] = [
  { id: "portal", label: "Tonnelle Avenue", ft: 0, cam: "palisades-tunnel" },
  { id: "hudson-county-shaft", label: "Hudson County access shaft", ft: HC_SHAFT_FT, cam: "hudson-county-shaft" },
  {
    id: "river",
    label: "Ground stabilization",
    ft: (ROUTE.stabilizedFromFt + ROUTE.stabilizedToFt) / 2,
    cam: "river",
  },
  { id: "manhattan-shaft", label: "Manhattan access shaft", ft: TWELFTH_AVE_SHAFT_FT, cam: "manhattan-shaft" },
];

// The Palisades drive, portal → Hudson County shaft. GDC says each machine
// builds "roughly 30 feet of tunnel per day" while mining (weekdays only) and
// will "reach the Hudson County Access Shaft approximately one year after
// launching", so estimates follow the one-year schedule.
export const PALISADES_DRIVE = {
  lengthFt: HC_SHAFT_FT,
  durationDays: 365,
  quotedFtPerDay: 30,
  sourceUrl:
    "https://www.gatewayprogram.org/wp-content/uploads/2026/09/September-2026-TBM-Launch-Press-Release.pdf",
} as const;
