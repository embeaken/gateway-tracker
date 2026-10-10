<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { routeStops, routeSegments, PALISADES_DRIVE, ROUTE } from "../assets/data";
import { useTbmProgress, formatFt, formatPct } from "../useTbmProgress";

// ---------------------------------------------------------------------------
// Side-view profile of the route, west → east. Horizontal is to scale (feet
// along the tunnel); vertical is stylised and heavily exaggerated. Everything
// is laid out in real pixels so the SVG drawing and the HTML labels share one
// coordinate system.
// ---------------------------------------------------------------------------

const strip = ref<HTMLElement | null>(null);
const W = ref(1200);
let observer: ResizeObserver | undefined;
onMounted(() => {
  if (!strip.value) return;
  W.value = strip.value.clientWidth;
  observer = new ResizeObserver(([entry]) => {
    if (entry) W.value = entry.contentRect.width;
  });
  observer.observe(strip.value);
});
onBeforeUnmount(() => observer?.disconnect());

/** Strip height and ground level, px */
const H = 270;
const SURF = 148;
/** Half the distance between the two tube centrelines */
const GAP = 7;

/** Width of open-air track left of the portal */
const x0 = computed(() => Math.max(36, W.value * 0.03));
const x = (ft: number) => x0.value + ((W.value - x0.value) * ft) / ROUTE.eastFt;

type Pt = [ft: number, y: number];

// Tunnel centreline depth: enters the Palisades just below grade, descends to
// the Hudson County shaft, bottoms out under the river, climbs to Manhattan.
const TUNNEL: Pt[] = [
  [0, SURF - 10],
  [PALISADES_DRIVE.lengthFt, SURF + 46],
  [ROUTE.riverFromFt, SURF + 58],
  [9600, SURF + 82],
  [routeSegments[2]!.fromFt, SURF + 52],
  [ROUTE.eastFt, SURF + 30],
];

// Monotone cubic (Fritsch–Carlson) through the points: a smooth line with no
// overshoot, so the low point under the river stays where it's put.
const tangents = (() => {
  const n = TUNNEL.length;
  const d = TUNNEL.slice(1).map(([f, y], i) => (y - TUNNEL[i]![1]) / (f - TUNNEL[i]![0]));
  const m = TUNNEL.map((_, i) => {
    if (i === 0) return d[0]!;
    if (i === n - 1) return d[n - 2]!;
    return d[i - 1]! * d[i]! <= 0 ? 0 : (d[i - 1]! + d[i]!) / 2;
  });
  d.forEach((dk, k) => {
    if (dk === 0) {
      m[k] = m[k + 1] = 0;
      return;
    }
    const a = m[k]! / dk;
    const b = m[k + 1]! / dk;
    const s = a * a + b * b;
    if (s > 9) {
      m[k] = (3 * a * dk) / Math.sqrt(s);
      m[k + 1] = (3 * b * dk) / Math.sqrt(s);
    }
  });
  return m;
})();

const cy = (ft: number) => {
  if (ft <= TUNNEL[0]![0]) return TUNNEL[0]![1];
  for (let i = 1; i < TUNNEL.length; i++) {
    const [f1, y1] = TUNNEL[i]!;
    const [f0, y0] = TUNNEL[i - 1]!;
    if (ft <= f1) {
      const h = f1 - f0;
      const t = (ft - f0) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      return (
        (2 * t3 - 3 * t2 + 1) * y0 +
        (t3 - 2 * t2 + t) * h * tangents[i - 1]! +
        (-2 * t3 + 3 * t2) * y1 +
        (t3 - t2) * h * tangents[i]!
      );
    }
  }
  return TUNNEL[TUNNEL.length - 1]![1];
};

/** Slope of the tunnel at a point, in degrees (screen space) */
const slope = (ft: number) => {
  const d = 50;
  return (Math.atan2(cy(ft + d) - cy(ft - d), x(ft + d) - x(ft - d)) * 180) / Math.PI;
};

/** Polyline along the tunnel between two points, offset vertically by dy */
const STEP_FT = 100;
const along = (from: number, to: number, dy = 0) => {
  const fts = [from];
  for (let f = Math.ceil(from / STEP_FT) * STEP_FT; f < to; f += STEP_FT) if (f > from) fts.push(f);
  fts.push(to);
  return fts.map((f) => `${x(f).toFixed(1)},${(cy(f) + dy).toFixed(1)}`).join(" L");
};

// Ground surface: flat Meadowlands, the Palisades ridge (cliff faces on both
// sides), low ground to the shoreline, a lumpy riverbed, flat Manhattan.
const R0 = ROUTE.riverFromFt;
const R1 = ROUTE.riverToFt;
const PORTAL_FACE = SURF - 26;
const RIDGE: Pt[] = [
  [0, PORTAL_FACE],
  [250, SURF - 34],
  [550, SURF - 50],
  [850, SURF - 58],
  [1600, SURF - 63],
  [2500, SURF - 66],
  [3500, SURF - 74],
  [4100, SURF - 70],
  [4520, SURF - 61],
  [4700, SURF - 40],
  [4880, SURF - 10],
  [5000, SURF - 1],
];
// Deepest (and widest) where the river label sits; shallower toward the
// state line and the Manhattan side.
const RIVERBED: Pt[] = [
  [R0, SURF],
  [R0 + 160, SURF + 34],
  [R0 + 700, SURF + 44],
  [R0 + 1600, SURF + 48],
  [R0 + 2500, SURF + 46],
  [R0 + 3500, SURF + 40],
  [R0 + 4500, SURF + 36],
  [R1 - 260, SURF + 28],
  [R1, SURF],
];
const WATER_DEPTH = 52;

// The water's surface is the top row of the wave pattern: same 32px period,
// tiles anchored to x = 0 and y = SURF, so the edge and the waves line up.
const WAVE = 32;
const water = computed(() => {
  const from = x(R0);
  const to = x(R1);
  const start = Math.floor(from / WAVE) * WAVE;
  let surface = `M${start},${SURF + 4} Q${start + 8},${SURF} ${start + 16},${SURF + 4}`;
  let end = start + 16;
  while (end < to) {
    end += 16;
    surface += ` T${end},${SURF + 4}`;
  }
  const bottom = SURF + WATER_DEPTH;
  return { from, to, surface, body: `${surface} L${end},${bottom} L${start},${bottom} Z` };
});


const groundPath = computed(() => {
  const pts = [...RIDGE, [PALISADES_DRIVE.lengthFt, SURF] as Pt, ...RIVERBED];
  const p = (pt: Pt) => `${x(pt[0]).toFixed(1)},${pt[1]}`;
  return `M-2,${H + 2} L-2,${SURF} L${(x(0) - 3).toFixed(1)},${SURF} L${pts.map(p).join(" L")} L${W.value + 2},${SURF} L${W.value + 2},${H + 2} Z`;
});

const casing = routeSegments.find((seg) => seg.kind === "casing")!;
const drive = routeSegments.find((seg) => seg.id === "palisades")!;
const river = routeSegments.find((seg) => seg.id === "hudson-river")!;
const shafts = routeStops.filter((stop) => stop.id.endsWith("shaft"));
const portal = routeStops.find((stop) => stop.ft === 0)!;
const stabilization = routeStops.find((stop) => stop.id === "river")!;

// Sites with a construction camera get a hover highlight (no link).
const hasCam = (cams: string[] | string | undefined) => (Array.isArray(cams) ? cams.length > 0 : !!cams);

// --- TBMs ------------------------------------------------------------------

const { progress } = useTbmProgress();

/** A machine at 0 ft still sits just inside the portal */
const MIN_INSIDE_PX = 22;

const markers = computed(() => {
  const minFt = (MIN_INSIDE_PX / (W.value - x0.value)) * ROUTE.eastFt;
  return progress.value.map((p) => {
    const lane = p.tbm.tube === "North" ? "north" : "south";
    const dy = lane === "north" ? -GAP : GAP;
    const ft = Math.max(minFt, p.ft);
    return {
      ...p,
      lane,
      x: x(ft),
      y: cy(ft) + dy,
      angle: slope(ft),
      bored: p.status === "upcoming" ? "" : `M${along(0, ft, dy)}`,
      tag:
        p.status === "upcoming"
          ? "not started"
          : p.status === "arrived"
            ? "arrived"
            : formatPct(p.fraction),
    };
  });
});

// --- Floating labels -------------------------------------------------------
// Sites float in the sky with a pin down to what they name. Two tiers keep the
// crowded Manhattan end readable.
const TIER = { a: 58, b: 112 } as const;
type Align = "center" | "start" | "end";
type FloatLabel = {
  id: string;
  label: string;
  x: number;
  tier: keyof typeof TIER;
  align: Align;
  /** y the pin runs down to */
  to: number;
  /** Wrap onto two balanced lines at this width */
  wrapAt?: number;
};

// Rendered label widths, for collision checks
const labelEls: Record<string, HTMLElement> = {};
const labelWidths = ref<Record<string, number>>({});
const measureLabels = () => {
  labelWidths.value = Object.fromEntries(Object.entries(labelEls).map(([id, el]) => [id, el.offsetWidth]));
};
onMounted(() => {
  measureLabels();
  document.fonts?.ready.then(measureLabels);
});
watch(W, () => nextTick(measureLabels));

const labels = computed(() => {
  const shaftTop = SURF - 4;
  const list: FloatLabel[] = [
    { id: portal.id, label: portal.label, x: x(0), tier: "a", align: "start" as Align, to: PORTAL_FACE },
    ...shafts.map((s) => ({
      id: s.id,
      label: s.label,
      x: x(s.ft),
      tier: s.ft === PALISADES_DRIVE.lengthFt ? ("a" as const) : ("b" as const),
      align: "center" as Align,
      to: shaftTop,
      // The Manhattan end is crowded: stack its name on two lines
      wrapAt: s.ft === PALISADES_DRIVE.lengthFt ? undefined : 130,
    })),
    {
      id: stabilization.id,
      label: stabilization.label,
      x: x(stabilization.ft),
      tier: "a",
      align: "center" as Align,
      to: cy(stabilization.ft) - GAP - 12,
    },
    {
      id: casing.id,
      label: casing.label,
      x: W.value - 28,
      tier: "a",
      align: "end" as Align,
      to: cy(ROUTE.eastFt - 300) - 18,
      wrapAt: 150,
    },
  ];
  // Ground stabilization shares a tier with the casing label: slide it left
  // (over the open river) only as far as needed to keep a gap between them,
  // and never so far that its pin leaves the label.
  const gs = list.find((l) => l.id === stabilization.id)!;
  const cs = list.find((l) => l.id === casing.id)!;
  const gsW = labelWidths.value[gs.id];
  const csW = labelWidths.value[cs.id];
  const nudges: Record<string, number> = {};
  if (gsW && csW) {
    const limit = cs.x + 12 - csW - 20;
    const overlap = gs.x + gsW / 2 - limit;
    if (overlap > 0) nudges[gs.id] = -Math.min(overlap, gsW / 2 - 16);
  }
  return list.map((l) => ({ ...l, base: TIER[l.tier], nudge: nudges[l.id] ?? 0 }));
});

// --- Hit areas -------------------------------------------------------------
// Every site gets a full-height column centred on it, up to HALF px each side,
// never past the midpoint to its neighbour.
const HALF = 130;
const hits = computed(() => {
  const sites = [
    ...routeStops.map((stop) => ({ id: stop.id, cam: hasCam(stop.cams), at: x(stop.ft) })),
    { id: drive.id, cam: hasCam(drive.cam), at: (x(drive.fromFt) + x(drive.toFt)) / 2 },
    { id: casing.id, cam: hasCam(casing.cam), at: (x(casing.fromFt) + W.value) / 2 + 8 },
  ]
    .filter((site) => site.cam)
    .sort((a, b) => a.at - b.at);

  return sites.map((site, i) => {
    const prev = sites[i - 1];
    const next = sites[i + 1];
    const left = Math.max(prev ? (prev.at + site.at) / 2 : 0, site.at - HALF);
    const right = Math.min(next ? (site.at + next.at) / 2 : W.value, site.at + HALF);
    return { ...site, left: i === 0 ? 0 : left, width: (i === sites.length - 1 ? W.value : right) - (i === 0 ? 0 : left) };
  });
});

const hovered = ref<string | null>(null);

const glows = computed(() => [
  { id: drive.id, from: x(drive.fromFt), to: x(drive.toFt) },
  { id: casing.id, from: x(casing.fromFt) + 6, to: W.value + 4 },
]);

// --- Mobile list -----------------------------------------------------------
const segmentFrom = (ft: number) => routeSegments.find((seg) => seg.fromFt === ft && seg.kind !== "casing");
</script>

<template>
  <section id="route" class="route" aria-labelledby="route-title">
    <div class="container">
      <div class="route-head">
        <!-- The page can swap in a live status headline (must keep id="route-title") -->
        <slot name="head">
          <h2 id="route-title" class="route-title">Construction map</h2>
        </slot>
      </div>

      <div class="route-card">
        <!-- Side-view profile (tablet / desktop) -->
        <div ref="strip" class="strip" :style="{ height: `${H}px` }">
          <svg class="profile" :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
            <defs>
              <pattern id="rm-waves" x="0" :y="SURF" :width="WAVE" height="16" patternUnits="userSpaceOnUse">
                <path class="wave" d="M0 4 Q8 0 16 4 T32 4" />
                <path class="wave" d="M-8 12 Q0 8 8 12 T24 12 T40 12" />
              </pattern>
              <clipPath v-for="g in glows" :id="`rm-clip-${g.id}`" :key="g.id">
                <rect :x="g.from" y="0" :width="g.to - g.from" :height="H" />
              </clipPath>
              <clipPath id="rm-river">
                <rect :x="water.from" :y="SURF - 4" :width="water.to - water.from" :height="WATER_DEPTH + 4" />
              </clipPath>
              <!-- East of the portal: the tunnel proper -->
              <clipPath id="rm-inside">
                <rect :x="x(0)" y="0" :width="W" :height="H" />
              </clipPath>
              <clipPath id="rm-ground">
                <path :d="groundPath" />
              </clipPath>
            </defs>

            <!-- Water, then the ground over it (the riverbed shapes its bottom) -->
            <g clip-path="url(#rm-river)">
              <path class="water" :d="water.body" />
              <path class="water-waves" :d="water.body" />
              <path class="water-surface" :d="water.surface" />
            </g>
            <path class="ground" :d="groundPath" />

            <!-- Hudson River Ground Stabilization: treated soil around the tunnel line -->
            <rect
              class="treated"
              :class="hovered === stabilization.id && 'treated--hover'"
              clip-path="url(#rm-ground)"
              :x="x(ROUTE.stabilizedFromFt)"
              :y="SURF"
              :width="x(ROUTE.stabilizedToFt) - x(ROUTE.stabilizedFromFt)"
              :height="cy(stabilization.ft) + 22 - SURF"
              rx="3"
            />

            <!-- State line, mid-river -->
            <g class="state-line">
              <line :x1="(x(R0) + x(R1)) / 2 + 30" :x2="(x(R0) + x(R1)) / 2 + 30" :y1="SURF - 10" :y2="SURF + 28" />
              <text :x="(x(R0) + x(R1)) / 2 + 24" :y="SURF - 4" text-anchor="end">NJ</text>
              <text :x="(x(R0) + x(R1)) / 2 + 36" :y="SURF - 4">NY</text>
            </g>

            <!-- Active work: the TBM drive and the Hudson Yards casing -->
            <g clip-path="url(#rm-ground)">
              <path class="band" clip-path="url(#rm-inside)" :d="`M${along(drive.fromFt, drive.toFt)}`" />
            </g>
            <path class="band band--casing" :d="`M${along(casing.fromFt + 40, ROUTE.eastFt + 400)}`" />

            <!-- Twin tubes: surface track to the portal, then tunnel -->
            <g v-for="dy in [-GAP, GAP]" :key="dy">
              <path class="surface" :d="`M-4,${cy(0) + dy} L${x(0)},${cy(0) + dy}`" />
              <path class="tube" :d="`M${along(0, ROUTE.eastFt, dy)}`" />
              <!-- Hover glow on sections with a camera: the whole tube, clipped to
                   the section, so its dashes sit exactly on the tube's own -->
              <path
                v-for="g in glows"
                :key="g.id"
                class="glow"
                :class="hovered === g.id && 'glow--on'"
                :clip-path="`url(#rm-clip-${g.id})`"
                :d="`M${along(0, ROUTE.eastFt, dy)}`"
              />
            </g>

            <!-- Bored so far (estimated) -->
            <path v-for="m in markers" :key="`b-${m.tbm.id}`" class="bored" :d="m.bored" />

            <!-- Shafts: surface down to the tunnel -->
            <rect
              v-for="s in shafts"
              :key="s.id"
              class="shaft"
              :class="hovered === s.id && 'shaft--hover'"
              :x="x(s.ft) - 6"
              :y="SURF - 4"
              width="12"
              :height="cy(s.ft) + GAP + 8 - (SURF - 4)"
              rx="2"
            />

            <!-- TBMs: machine-shaped pills riding their tube, leading edge at the estimate -->
            <g
              v-for="m in markers"
              :key="m.tbm.id"
              class="tbm"
              :class="`tbm--${m.status}`"
              :transform="`translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.angle.toFixed(2)})`"
            >
              <rect x="-18" y="-5" width="18" height="10" rx="5" />
            </g>

            <!-- Terrain and section names, set in the ground -->
            <text class="terrain-label" :x="x(2600)" :y="SURF - 36" text-anchor="middle">The Palisades</text>
            <text class="terrain-label terrain-label--water" :x="x(R0 + 1550)" :y="SURF + 28" text-anchor="middle">
              Hudson River
            </text>
            <text
              class="section-label"
              :class="hovered === drive.id && 'section-label--hover'"
              :x="(x(drive.fromFt) + x(drive.toFt)) / 2"
              :y="SURF + 76"
              text-anchor="middle"
            >
              {{ drive.label }}
            </text>
            <text class="section-label" :x="(x(river.fromFt) * 2 + x(river.toFt)) / 3" :y="SURF + 108" text-anchor="middle">
              {{ river.label }}
            </text>
            <text class="section-label section-label--end" :x="W - 16" :y="SURF + 86" text-anchor="end">Penn Station →</text>
          </svg>

          <!-- Floating site labels with pins -->
          <div class="labels" aria-hidden="true">
            <template v-for="l in labels" :key="l.id">
              <span
                class="pin"
                :class="hovered === l.id && 'pin--hover'"
                :style="{ left: `${l.x}px`, top: `${l.base + 6}px`, height: `${Math.max(0, l.to - l.base - 6)}px` }"
              ></span>
              <span
                class="flabel"
                :class="[`flabel--${l.align}`, hovered === l.id && 'flabel--hover', l.wrapAt && 'flabel--wrap']"
                :ref="(el) => el && (labelEls[l.id] = el as HTMLElement)"
                :style="{ left: `${l.x + l.nudge}px`, bottom: `${H - l.base}px`, maxWidth: l.wrapAt && `${l.wrapAt}px` }"
              >
                <span class="flabel-name">{{ l.label }}</span>
              </span>
            </template>
          </div>

          <!-- Hover columns: one full-height area per site -->
          <div class="hits" aria-hidden="true">
            <div
              v-for="hit in hits"
              :key="hit.id"
              class="hit"
              :style="{ left: `${hit.left}px`, width: `${hit.width}px` }"
              @mouseenter="hovered = hit.id"
              @mouseleave="hovered = null"
            ></div>
          </div>

          <!-- TBM tags -->
          <div
            v-for="m in markers"
            :key="`t-${m.tbm.id}`"
            class="tbm-tag"
            :class="[`tbm-tag--${m.lane}`, `tbm-tag--${m.status}`]"
            :style="{ left: `${m.x - 18}px`, top: `${m.y}px` }"
            aria-hidden="true"
          >
            <span class="tbm-tag-text">
              <strong>{{ m.tbm.label }}</strong> · {{ m.tag }}
            </span>
          </div>
        </div>

        <!-- Vertical line diagram (mobile) -->
        <ol class="vline">
          <template v-for="stop in routeStops" :key="stop.id">
            <li
              class="vstop"
              :class="[stop.id === 'river' && 'vstop--river', stop.ft === 0 && 'vstop--portal-west']"
            >
              <div class="vstop-link" :class="hasCam(stop.cams) && 'is-hoverable'">
                <svg v-if="stop.ft === 0" class="vportal" viewBox="-20 -12 40 24" aria-hidden="true">
                  <path d="M-8 0 H-13 L-19 -7 M8 0 H13 L19 -7" />
                </svg>
                <span v-else class="vstop-dot" aria-hidden="true"></span>
                <span class="vstop-text">
                  <span class="stop-label">{{ stop.label }}</span>
                </span>
              </div>
            </li>
            <li v-if="segmentFrom(stop.ft)" class="vstop vseg" :class="`vseg--${segmentFrom(stop.ft)!.id}`">
              <template v-if="stop.ft === 0">
                <span
                  v-for="m in markers"
                  :key="m.tbm.id"
                  class="vfill"
                  :class="[`vfill--${m.lane}`, `vfill--${m.status}`]"
                  :style="{ height: m.status === 'upcoming' ? '12px' : `max(26px, ${m.fraction * 100}%)` }"
                  aria-hidden="true"
                ></span>
              </template>
              <span class="vseg-text" :class="hasCam(segmentFrom(stop.ft)!.cam) && 'is-hoverable'">
                <span class="vseg-label">{{ segmentFrom(stop.ft)!.label }}</span>
                <template v-if="stop.ft === 0">
                  <span v-for="m in markers" :key="m.tbm.id" class="vseg-tbm">
                    <strong>{{ m.tbm.label }}</strong> ·
                    {{ m.status === "upcoming" ? m.tbm.expected : `${formatPct(m.fraction)} of the way (est.)` }}
                  </span>
                </template>
              </span>
            </li>
          </template>
          <li class="vstop vcasing">
            <div class="vstop-link" :class="hasCam(casing.cam) && 'is-hoverable'">
              <span class="vstop-text">
                <span class="stop-label">{{ casing.label }}</span>
              </span>
            </div>
          </li>
          <li class="vstop vterm" aria-hidden="true">
            <span class="vterm-text">Penn Station ↓</span>
          </li>
        </ol>

        <!-- How the TBM positions are estimated -->
        <details class="estimate">
          <summary>TBM positions are estimates</summary>
          <p>
            Our estimate, not an official figure. It assumes GDC's stated average of about
            {{ PALISADES_DRIVE.rateFtPerDay }} ft per day, including maintenance pauses, over the
            {{ formatFt(PALISADES_DRIVE.lengthFt) }} first drive from the Tonnelle Avenue portal to the
            Hudson County shaft. GDC's own schedule for this section, both tubes, is about a year, so
            treat these arrival dates as optimistic. We'll correct them as real figures are published.
            <a :href="PALISADES_DRIVE.sourceUrl" target="_blank" rel="noopener">Source</a>
          </p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.route {
  padding: var(--spacing-lg) 0 var(--spacing-xl);
}

.route-head {
  margin-bottom: var(--spacing-sm);
}

.route-title {
  font-size: 32px;
  line-height: 1.1;
}

.route-card {
  border-radius: var(--radius-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* =========== Profile strip =========== */

.strip {
  position: relative;
}

.profile {
  position: absolute;
  inset: 0;
  display: block;
}

.water {
  fill: var(--color-river);
}

.water-waves {
  fill: url(#rm-waves);
}

.water-surface {
  fill: none;
  stroke: var(--color-primary);
  stroke-opacity: 0.35;
  stroke-width: 1.2;
}

.wave {
  fill: none;
  stroke: var(--color-primary);
  stroke-opacity: 0.16;
  stroke-width: 1.1;
}

.ground {
  fill: var(--color-ground);
  stroke: var(--color-ground-edge);
  stroke-width: 1.5;
  stroke-linejoin: round;
}

.treated {
  fill: color-mix(in srgb, var(--color-ground-edge) 60%, var(--color-ground));
  transition: fill var(--transition-fast);
}

.treated--hover {
  fill: color-mix(in srgb, var(--color-primary) 30%, var(--color-ground));
}

.state-line line {
  stroke: var(--color-primary);
  stroke-opacity: 0.45;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.state-line text {
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  fill: var(--color-primary);
  fill-opacity: 0.7;
}

.band {
  fill: none;
  stroke: var(--color-band);
  stroke-width: 34;
  stroke-linejoin: round;
}

.surface,
.tube,
.glow,
.bored {
  fill: none;
  stroke-width: 4;
  stroke-linejoin: round;
}

.surface {
  stroke: var(--color-map-line);
  stroke-opacity: 0.75;
}

.tube {
  stroke: var(--color-map-line);
  stroke-opacity: 0.75;
  stroke-dasharray: 12 7;
}

.glow {
  stroke: var(--color-primary);
  stroke-dasharray: 12 7;
  opacity: 0;
  filter: drop-shadow(0 0 2px var(--color-glow)) drop-shadow(0 0 5px var(--color-glow));
  transition: opacity 200ms ease;
}

.glow--on {
  opacity: 1;
}

.bored {
  stroke: var(--color-accent);
  stroke-linecap: round;
}

.shaft {
  fill: var(--color-map-shaft);
  transition: fill var(--transition-fast);
}

.shaft--hover {
  fill: var(--color-primary);
}

.tbm rect {
  fill: var(--color-accent);
  stroke: var(--color-card-bg);
  stroke-width: 2;
  paint-order: stroke;
}

.tbm--upcoming rect {
  fill: var(--color-card-bg);
  stroke: var(--color-accent);
  stroke-width: 2;
}

.terrain-label {
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  fill: var(--color-ground-ink);
}

.terrain-label--water {
  fill: var(--color-primary);
}

.section-label {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  fill: var(--color-ground-ink);
  transition: fill var(--transition-fast);
}

.section-label--hover {
  fill: var(--color-primary);
}

/* --- Floating labels --- */

.labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pin {
  position: absolute;
  width: 1px;
  margin-left: -0.5px;
  background: var(--color-text-secondary);
  opacity: 0.55;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}

.pin--hover {
  background: var(--color-primary);
  opacity: 1;
}

.flabel {
  position: absolute;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  color: var(--color-text-primary);
}

.flabel--center {
  align-items: center;
  text-align: center;
  transform: translateX(-50%);
}

.flabel--start {
  align-items: flex-start;
  transform: translateX(-12px);
}

.flabel--end {
  align-items: flex-end;
  text-align: right;
  transform: translateX(calc(-100% + 12px));
}

.flabel--wrap {
  width: max-content;
  white-space: normal;
  text-wrap: balance;
}

.flabel-name {
  font-family: var(--font-family-display);
  font-size: 17px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
}

.flabel--hover .flabel-name {
  color: var(--color-primary);
}

/* --- Hit columns --- */

.hits {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hit {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: auto;
}

/* --- TBM tags --- */

.tbm-tag {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  width: 0;
  height: 0;
  transition: left 600ms ease, top 600ms ease;
}

.tbm-tag-text {
  position: absolute;
  left: 0;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  /* Dark brass + white in light mode; light brass + dark text in dark mode */
  background: var(--color-accent-ink);
  color: var(--color-card-bg);
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}

.tbm-tag--north .tbm-tag-text {
  bottom: 9px;
}

.tbm-tag--south .tbm-tag-text {
  top: 9px;
}

.tbm-tag--upcoming .tbm-tag-text {
  background: var(--color-card-bg);
  color: var(--color-accent-ink);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

/* =========== Estimate note =========== */

.estimate {
  border-top: 1px solid var(--color-border);
  padding: 10px 20px;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.estimate summary {
  cursor: pointer;
  width: fit-content;
  font-weight: var(--font-weight-semibold);
}

.estimate summary::marker {
  color: var(--color-accent);
}

.estimate p {
  margin: 8px 0 4px;
  max-width: 90ch;
  line-height: 1.5;
}

/* =========== Vertical line (mobile) =========== */

.vline {
  display: none;
  list-style: none;
  padding: 0;
}

.vstop {
  position: relative;
  padding: 0 var(--spacing-sm) 0 54px;
}

/* twin tubes */
.vstop::before,
.vstop::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: repeating-linear-gradient(180deg, var(--color-map-line) 0 9px, transparent 9px 14px);
  opacity: 0.75;
}

.vstop::before {
  left: 22px;
}

.vstop::after {
  left: 31px;
}

/* Portal: solid surface track above, dashed tunnel below */
.vstop--portal-west::before,
.vstop--portal-west::after {
  background:
    linear-gradient(var(--color-map-line) 0 50%, transparent 50%),
    repeating-linear-gradient(180deg, var(--color-map-line) 0 9px, transparent 9px 14px) 0 50% / 100% 50% no-repeat;
}

.vportal {
  position: absolute;
  left: 8px;
  top: calc(50% - 12px);
  width: 40px;
  height: 24px;
  overflow: visible;
  fill: none;
  stroke: var(--color-map-line);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke var(--transition-fast);
}

.vstop-link.is-hoverable:hover .vportal {
  stroke: var(--color-primary);
}

/* Terrain blocks: the ridge, then water from the river section onwards */
.vseg--palisades {
  min-height: 112px;
  background: var(--color-ground);
}

.vseg--hudson-river,
.vstop--river {
  background: var(--river-waves) 0 0 / 40px 20px, var(--color-river);
}

.vstop-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: var(--color-text-primary);
}

/* First row: room for the open-air track coming in from the top edge */
.vstop--portal-west .vstop-link {
  padding-block: 16px;
}

.vstop-dot {
  position: absolute;
  left: 16px;
  width: 24px;
  height: 20px;
  border-radius: 10px;
  border: 4px solid var(--color-map-line);
  background: var(--color-card-bg);
  z-index: 1;
  transition: background var(--transition-fast);
}

.vstop-link.is-hoverable:hover .vstop-dot {
  background: var(--color-primary);
}

.vstop-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.stop-label {
  font-family: var(--font-family-display);
  font-size: 18px;
  text-wrap: balance;
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
}

.vstop-link.is-hoverable:hover .stop-label {
  color: var(--color-primary);
}

.vseg {
  min-height: 64px;
  display: flex;
  align-items: center;
}

.vseg-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
}

.vseg-text.is-hoverable {
  flex: 1;
}

.vseg-text.is-hoverable:hover .vseg-label {
  color: var(--color-primary);
}

.vseg-label {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.vseg-tbm {
  font-size: 13px;
  color: var(--color-accent-ink);
}

.vterm {
  display: flex;
  align-items: center;
  min-height: 44px;
}

.vcasing {
  background: var(--color-band);
}

.vterm-text {
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.vfill {
  position: absolute;
  top: -10px;
  width: 3px;
  max-height: calc(100% + 10px);
  background: var(--color-accent);
  z-index: 1;
}

/* The machine: a vertical pill at the leading (bottom) end of the fill */
.vfill::after {
  content: "";
  position: absolute;
  left: -2px;
  bottom: -2px;
  width: 7px;
  height: 16px;
  box-sizing: border-box;
  border-radius: 4px;
  background: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-card-bg);
}

.vfill--upcoming {
  background: transparent;
}

.vfill--upcoming::after {
  background: var(--color-card-bg);
  border: 2px solid var(--color-accent);
}

.vfill--north {
  left: 22px;
}

.vfill--south {
  left: 31px;
}

@media (max-width: 1024px) {
  .strip {
    display: none;
  }

  .vline {
    display: block;
  }

  .route-title {
    font-size: 26px;
  }

  .estimate {
    padding: 10px var(--spacing-sm);
  }
}
</style>
