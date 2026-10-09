<script setup lang="ts">
import { computed, ref } from "vue";
import { routeStops, routeSegments, PALISADES_DRIVE, ROUTE } from "../assets/data";
import { useTbmProgress, formatFt, formatPct, formatMonth } from "../useTbmProgress";

// Feet along the tunnel → percent of the track width, drawn to scale. A short
// stub of surface track runs in from the left edge to the portal.
const STUB = 9;
const pos = (ft: number) => STUB + ((100 - STUB) * ft) / ROUTE.eastFt;

const PORTAL = pos(0);
const RIVER_FROM = pos(ROUTE.riverFromFt);
// The Palisades: the diabase ridge the first drive bores through, portal → HC shaft
const ROCK_FROM = PORTAL;
const ROCK_TO = pos(PALISADES_DRIVE.lengthFt);
const RIVER_TO = pos(ROUTE.riverToFt);

const MILE = 5280;
const miles = (ft: number) => (ft === 0 ? "0" : (ft / MILE).toFixed(1));

const segments = routeSegments.map((seg) => ({
  ...seg,
  left: pos(seg.fromFt),
  width: pos(seg.toFt) - pos(seg.fromFt),
  length: seg.lengthLabel === undefined ? formatFt(seg.toFt - seg.fromFt) : seg.lengthLabel,
  href: seg.cam ? `#cam-${seg.cam}` : undefined,
}));

const drive = segments.find((seg) => seg.id === "palisades")!;
const casing = segments.find((seg) => seg.kind === "casing")!;
const dimSegments = segments.filter((seg) => seg.kind !== "casing");

// --- Hit areas -------------------------------------------------------------
// Every site gets a full-height column centred on its marker, up to HALF px
// each side, but never past the midpoint to its neighbour. The casing's anchor
// is the middle of its band (12th Ave shaft → card edge).
type Anchor = { pct: number; px: number };
const HALF = 130;
const at = (a: Anchor) => `calc(${a.pct}% + ${a.px}px)`;
const mid = (a: Anchor, b: Anchor): Anchor => ({ pct: (a.pct + b.pct) / 2, px: (a.px + b.px) / 2 });

const sites = [
  ...routeStops.map((stop) => ({
    id: stop.id,
    label: stop.label,
    href: stop.cams.length ? `#cam-${stop.cams[0]}` : undefined,
    anchor: { pct: pos(stop.ft), px: 0 } as Anchor,
  })),
  // Sections with a camera are sites too, anchored mid-band
  ...segments
    .filter((seg) => seg.href)
    .map((seg) => ({
      id: seg.id,
      label: seg.label,
      href: seg.href,
      anchor:
        seg.kind === "casing"
          ? ({ pct: (seg.left + 100) / 2, px: 8 } as Anchor) // band runs to the card edge
          : ({ pct: seg.left + seg.width / 2, px: 0 } as Anchor),
    })),
].sort((a, b) => a.anchor.pct - b.anchor.pct);

const hits = sites.map((site, i) => {
  const prev = sites[i - 1];
  const next = sites[i + 1];
  const left = prev
    ? `max(${at(mid(prev.anchor, site.anchor))}, calc(${site.anchor.pct}% - ${HALF - site.anchor.px}px))`
    : `max(-16px, calc(${site.anchor.pct}% - ${HALF}px))`;
  const right = next
    ? `min(${at(mid(site.anchor, next.anchor))}, calc(${site.anchor.pct}% + ${HALF + site.anchor.px}px))`
    : "calc(100% + 16px)";
  return { ...site, left, width: `calc(${right} - ${left})` };
});

const hovered = ref<string | null>(null);

// Hover glow for sections. The glow layer is the track plus the 16px run-off to
// the card edge, so a track percentage p sits at calc(p% - 0.16p px) inside it.
const tp = (p: number) => `calc(${p}% - ${(p * 0.16).toFixed(2)}px)`;
const glows = segments
  .filter((seg) => seg.href)
  .map((seg) => {
    const from = tp(seg.left);
    const to = seg.kind === "casing" ? "100%" : tp(seg.left + seg.width);
    const mask = `linear-gradient(to right, transparent ${from}, #000 ${from}, #000 ${to}, transparent ${to})`;
    return { id: seg.id, style: { maskImage: mask, WebkitMaskImage: mask } };
  });

const { progress } = useTbmProgress();

// A machine at 0 ft still sits just inside the portal, clear of the wing walls.
const MIN_INSIDE_PX = 22;

const markers = computed(() =>
  progress.value.map((p) => {
    const run = pos(p.fraction * PALISADES_DRIVE.lengthFt) - PORTAL;
    return {
      ...p,
      lane: p.tbm.tube === "North" ? "north" : "south",
      /** Leading edge of the machine, in track coordinates */
      x: `calc(${PORTAL}% + max(${MIN_INSIDE_PX}px, ${run}%))`,
      run: `max(${MIN_INSIDE_PX}px, ${run}%)`,
    };
  }),
);

const camHref = (stop: (typeof routeStops)[number]) =>
  stop.cams.length ? `#cam-${stop.cams[0]}` : undefined;

/** Section that begins at a given point (for the mobile list). */
const segmentFrom = (ft: number) => segments.find((seg) => seg.fromFt === ft && seg.kind !== "casing");
</script>

<template>
  <section id="route" class="route" aria-labelledby="route-title">
    <div class="container">
      <div class="route-head">
        <h2 id="route-title" class="route-title">Construction map</h2>
      </div>

      <div class="route-card">
        <!-- Horizontal strip map (tablet / desktop) -->
        <div class="strip">
          <div class="zone-labels" aria-hidden="true">
            <span class="zone zone--dir" :style="{ left: '0%' }">← To Washington, DC</span>
            <span
              class="zone zone--rock"
              :style="{ left: `${ROCK_FROM}%`, width: `${ROCK_TO - ROCK_FROM}%` }"
            >
              Palisades
            </span>
            <span
              class="zone zone--river"
              :style="{ left: `${RIVER_FROM}%`, width: `${RIVER_TO - RIVER_FROM}%` }"
            >
              Hudson River
            </span>
            <span class="zone zone--dir zone--end">To Boston →</span>
          </div>

          <div class="terrain terrain--rock" :style="{ '--from': ROCK_FROM / 100, '--to': ROCK_TO / 100 }" aria-hidden="true"></div>
          <div class="terrain terrain--river" :style="{ '--from': RIVER_FROM / 100, '--to': RIVER_TO / 100 }" aria-hidden="true"></div>

          <div class="track" aria-hidden="true">
            <!-- The active TBM drive -->
            <div
              class="band drive"
              :style="{ left: `${drive.left}%`, width: `${drive.width}%` }"
            ></div>
            <!-- Hudson Yards casing: cut-and-cover box from the 12th Ave shaft into Penn -->
            <div
              class="band casing-band"
              :style="{ left: `${casing.left}%` }"
            ></div>

            <!-- New tracks: on the surface to the portal (solid), then in tunnel (dashed) -->
            <div class="surface tube--north" :style="{ width: `calc(${PORTAL}% + 16px)` }"></div>
            <div class="surface tube--south" :style="{ width: `calc(${PORTAL}% + 16px)` }"></div>
                        <div class="tube tube--north" :style="{ left: `${PORTAL}%` }"></div>
            <div class="tube tube--south" :style="{ left: `${PORTAL}%` }"></div>

            <!-- Hover glow: the section's own dashed line lights up -->
            <div
              v-for="glow in glows"
              :key="glow.id"
              class="glow"
              :class="hovered === glow.id && 'glow--on'"
              :style="glow.style"
            >
              <div class="glow-tube tube--north" :style="{ left: tp(PORTAL) }"></div>
              <div class="glow-tube tube--south" :style="{ left: tp(PORTAL) }"></div>
            </div>

            <!-- Bored so far (estimated) + machine position -->
            <template v-for="m in markers" :key="m.tbm.id">
              <div
                v-if="m.status !== 'upcoming'"
                class="bored"
                :class="`bored--${m.lane}`"
                :style="{ left: `${PORTAL}%`, width: m.run }"
              ></div>
              <div class="tbm" :class="[`tbm--${m.lane}`, `tbm--${m.status}`]" :style="{ left: m.x }">
                <span class="tbm-body"></span>
                <span class="tbm-label">
                  {{ m.tbm.label }}<template v-if="m.status === 'upcoming'"> · soon</template>
                </span>
              </div>
            </template>
          </div>

          <!-- Sites: markers and labels (visual only; the hit columns below are the links) -->
          <ol class="stops" aria-hidden="true">
            <li
              v-for="stop in routeStops"
              :key="stop.id"
              class="stop"
              :class="[`stop--${stop.side}`, hovered === stop.id && 'stop--hover']"
              :style="{ left: `${pos(stop.ft)}%` }"
            >
              <span class="stop-box">
                <span class="stop-label">{{ stop.label }}</span>
                <span class="stop-marker">
                  <!-- Tunnel portal: wing walls splay toward the open-air side -->
                  <svg v-if="stop.ft === 0" class="portal" viewBox="-12 -26 24 52">
                    <path d="M0 -11 V-19 L-8 -26 M0 11 V19 L-8 26" />
                  </svg>
                  <span v-else class="stop-dot"></span>
                </span>
              </span>
            </li>
            <li
              class="stop stop--below stop--casing"
              :class="hovered === casing.id && 'stop--hover'"
              :style="{ left: `${casing.left}%` }"
            >
              <span class="stop-box">
                <span class="stop-label">{{ casing.label }}</span>
                <span class="stop-marker"></span>
              </span>
            </li>
          </ol>

          <!-- Hit columns: one full-height link per site -->
          <div class="hits">
            <a
              v-for="hit in hits"
              :key="hit.id"
              class="hit"
              :href="hit.href"
              :aria-label="`${hit.label} camera`"
              :style="{ left: hit.left, width: hit.width }"
              @mouseenter="hovered = hit.id"
              @mouseleave="hovered = null"
              @focus="hovered = hit.id"
              @blur="hovered = null"
            ></a>
          </div>

          <!-- Construction sections, dimensioned like an engineering drawing -->
          <ol class="dims">
            <li
              v-for="seg in dimSegments"
              :key="seg.id"
              class="dim"
              :class="`dim--${seg.kind}`"
              :style="{ left: `${seg.left}%`, width: `${seg.width}%` }"
            >
              <span class="dim-text">
                <span class="dim-label">{{ seg.label }}</span>
                <span v-if="seg.length" class="dim-length tabular">{{ seg.length }}</span>
              </span>
            </li>
          </ol>
        </div>

        <!-- Vertical line diagram (mobile) -->
        <ol class="vline">
          <li class="vstop vterm vterm--west" aria-hidden="true">
            <span class="vterm-text">↑ To Washington, DC</span>
          </li>
          <template v-for="stop in routeStops" :key="stop.id">
            <li
              class="vstop"
              :class="[stop.id === 'river' && 'vstop--river', stop.ft === 0 && 'vstop--portal-west']"
            >
              <component :is="camHref(stop) ? 'a' : 'div'" :href="camHref(stop)" class="vstop-link">
                <svg v-if="stop.ft === 0" class="vportal" viewBox="-20 -12 40 24" aria-hidden="true">
                  <path d="M-8 0 H-13 L-19 -7 M8 0 H13 L19 -7" />
                </svg>
                <span v-else class="vstop-dot" aria-hidden="true"></span>
                <span class="vstop-text">
                  <span class="stop-label">{{ stop.label }}</span>
                </span>
                <span class="vstop-mile tabular">mile {{ miles(stop.ft) }}</span>
              </component>
            </li>
            <li v-if="segmentFrom(stop.ft)" class="vstop vseg" :class="`vseg--${segmentFrom(stop.ft)!.id}`">
              <template v-if="stop.ft === 0">
                <span
                  v-for="m in markers"
                  :key="m.tbm.id"
                  class="vfill"
                  :class="[`vfill--${m.lane}`, `vfill--${m.status}`]"
                  :style="{ height: `max(26px, ${m.fraction * 100}%)` }"
                  aria-hidden="true"
                ></span>
              </template>
              <component
                :is="segmentFrom(stop.ft)!.href ? 'a' : 'span'"
                :href="segmentFrom(stop.ft)!.href"
                class="vseg-text"
              >
                <span class="vseg-label">
                  {{ segmentFrom(stop.ft)!.label }}
                  <span class="vseg-length tabular">· {{ segmentFrom(stop.ft)!.length }}</span>
                </span>
                <template v-if="stop.ft === 0">
                  <span v-for="m in markers" :key="m.tbm.id" class="vseg-tbm">
                    <strong>{{ m.tbm.label }}</strong> ·
                    {{ m.status === "upcoming" ? "launching soon" : `${formatPct(m.fraction)} of the way (est.)` }}
                  </span>
                </template>
              </component>
            </li>
          </template>
          <li class="vstop vcasing">
            <a :href="casing.href" class="vstop-link">
              <span class="vstop-text">
                <span class="stop-label">{{ casing.label }}</span>
              </span>
            </a>
          </li>
          <li class="vstop vterm" aria-hidden="true">
            <span class="vterm-text">To Boston ↓</span>
          </li>
        </ol>

        <!-- Progress table -->
        <div class="progress">
          <h3 class="progress-title">
            Palisades Tunnel progress <span class="progress-est">estimated</span>
          </h3>
          <ul class="progress-rows">
            <li v-for="m in markers" :key="m.tbm.id" class="progress-row">
              <span class="pr-name">
                <strong>{{ m.tbm.label }}</strong>
                <span>{{ m.tbm.tube }} tube</span>
              </span>
              <span class="pr-bar" aria-hidden="true">
                <span :style="{ width: `${m.fraction * 100}%` }"></span>
              </span>
              <template v-if="m.status === 'upcoming'">
                <span class="pr-figure pr-muted">{{ m.tbm.expected }}</span>
                <span class="pr-eta pr-muted">Not started</span>
              </template>
              <template v-else>
                <span class="pr-figure tabular">
                  ~{{ formatFt(m.ft) }} of {{ formatFt(PALISADES_DRIVE.lengthFt) }}
                  <span class="pr-muted">· {{ formatPct(m.fraction) }} · day {{ m.day }}</span>
                </span>
                <span class="pr-eta tabular">
                  <template v-if="m.status === 'arrived'">Est. at shaft</template>
                  <template v-else>Est. arrival {{ formatMonth(m.arrival!) }}</template>
                </span>
              </template>
            </li>
          </ul>
          <p class="progress-foot">
            Our estimate, not an official figure. It assumes GDC's stated average of about
            {{ PALISADES_DRIVE.rateFtPerDay }} ft per day, including maintenance pauses, over the
            {{ formatFt(PALISADES_DRIVE.lengthFt) }} first drive from the North Bergen portal to the
            Hudson County shaft. GDC's own schedule for this section, both tubes, is about a year, so
            treat these arrival dates as optimistic. We'll correct them as real figures are published.
            <a :href="PALISADES_DRIVE.sourceUrl" target="_blank" rel="noopener">Source</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.route {
  padding: var(--spacing-lg) 0 var(--spacing-xl);
}

.route-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px var(--spacing-md);
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

/* =========== Horizontal strip =========== */

.strip {
  --track-y: 104px;
  --tube-gap: 7px; /* half the distance between tube centrelines */
  --dims-y: 180px;
  position: relative;
  height: 234px;
  border-bottom: 1px solid var(--color-border);
}

/* Background terrain bands: rock under the Palisades, water over the river */
.terrain {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Same coordinate frame as .track (16px inset each side) */
  left: calc(16px + (100% - 32px) * var(--from));
  right: calc(16px + (100% - 32px) * (1 - var(--to)));
}

.terrain--river {
  background: var(--river-waves) 0 0 / 40px 20px, var(--color-river);
}

.terrain--rock {
  background: var(--rock-pattern) 0 0 / 40px 32px, var(--color-rock);
}

.zone-labels {
  position: absolute;
  z-index: 2;
  inset: 12px 16px auto 16px;
  height: 14px;
}

.zone {
  position: absolute;
  top: 0;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.zone--river,
.zone--rock {
  text-align: center;
}

.zone--river {
  color: var(--color-primary);
}

.zone--end {
  right: 0;
}

.zone--dir {
  letter-spacing: 0.06em;
}

.track {
  position: absolute;
  z-index: 1;
  left: 16px;
  right: 16px;
  top: var(--track-y);
  height: 0;
  pointer-events: none;
}

.tube,
.surface,
.bored {
  position: absolute;
  height: 4px;
  border-radius: 2px;
}

.tube {
  right: -16px; /* runs off the card edge into Penn Station */
  background: repeating-linear-gradient(
    90deg,
    var(--color-map-line) 0 12px,
    transparent 12px 19px
  );
  opacity: 0.75;
}

.tube--north,
.bored--north {
  top: calc(-1 * var(--tube-gap) - 2px);
}

.tube--south,
.bored--south {
  top: calc(var(--tube-gap) - 2px);
}

/* New surface track, from the card edge to the portal */
.surface {
  left: -16px;
  background: var(--color-map-line);
  opacity: 0.75;
}

.glow {
  position: absolute;
  left: 0;
  right: -16px;
  top: -20px;
  height: 40px;
  opacity: 0;
  transition: opacity 200ms ease;
}

.glow--on {
  opacity: 1;
}

/* Same dash rhythm as .tube, so the glow sits exactly on the line */
.glow-tube {
  position: absolute;
  right: 0;
  height: 4px;
  margin-top: 20px;
  border-radius: 2px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-primary) 0 12px,
    transparent 12px 19px
  );
  filter: drop-shadow(0 0 2px var(--color-glow)) drop-shadow(0 0 5px var(--color-glow));
}

.bored {
  background: var(--color-accent);
  z-index: 1;
  transition: width 600ms ease;
}

.band {
  position: absolute;
  top: -17px;
  height: 34px;
  /* Opaque, so the pill reads the same over rock, water or plain card */
  background: linear-gradient(var(--color-accent-muted), var(--color-accent-muted)), var(--color-card-bg);
}

.drive {
  border-radius: 17px;
}

.casing-band {
  right: -16px; /* into Penn Station, off the card edge */
  border-radius: 17px 0 0 17px;
}

/* TBMs: identical machine-shaped pills riding their tube, leading edge at the
   estimated position. Labels sit outside the pair: north above, south below. */
.tbm {
  position: absolute;
  z-index: 4;
  width: 0;
  height: 0;
  transition: left 600ms ease;
}

.tbm--north {
  top: calc(-1 * var(--tube-gap));
}

.tbm--south {
  top: var(--tube-gap);
}

.tbm-body {
  position: absolute;
  left: -18px;
  top: -5px;
  width: 18px;
  height: 10px;
  box-sizing: border-box;
  border-radius: 5px;
  background: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-card-bg);
}

.tbm--upcoming .tbm-body {
  background: var(--color-card-bg);
  border: 2px solid var(--color-accent);
}

.tbm-label {
  position: absolute;
  left: -18px;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-navy);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  line-height: 16px;
  white-space: nowrap;
}

.tbm--north .tbm-label {
  bottom: 9px;
}

.tbm--south .tbm-label {
  top: 9px;
}

.tbm--upcoming .tbm-label {
  background: var(--color-card-bg);
  color: var(--color-accent-ink);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

/* --- Sites --- */

.stops {
  position: absolute;
  z-index: 2;
  inset: 0 16px;
  list-style: none;
  pointer-events: none;
}

.stop {
  position: absolute;
  top: var(--track-y);
  width: 0;
  height: 0;
}

/* Marker + label. The marker is centred on the track; the label sits above or
   below, clear of the TBM tags. */
.stop-box {
  position: absolute;
  left: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 8px 12px;
  color: var(--color-text-primary);
}

.stop--above .stop-box {
  bottom: -26px;
}

.stop--below .stop-box {
  top: -26px;
  flex-direction: column-reverse;
}

/* Full-height click/hover columns, one per site */
.hits {
  position: absolute;
  z-index: 3;
  inset: 0 16px;
  pointer-events: none;
}

/* Invisible: hovering a column lights up its label and marker instead. */
.hit {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: auto;
}

.hit:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.stop-marker {
  position: relative;
  width: 22px;
  height: 36px;
}

.stop-dot {
  position: absolute;
  inset: 0;
  border-radius: 11px;
  border: 4px solid var(--color-map-line);
  background: var(--color-card-bg);
  transition: background var(--transition-fast);
}

/* Hudson Yards casing: the box spans the band, label below it */
.stop--casing {
  right: -16px;
  width: auto;
}

.stop--casing .stop-box {
  right: 0;
  transform: none;
  padding-inline: 6px;
  top: -25px;
  gap: 23px;
  border-radius: 10px 0 0 10px;
}

.stop--casing .stop-marker {
  width: 100%;
  height: 34px;
}

.stop--casing .stop-label {
  white-space: normal;
  text-align: center;
}

.stop--hover .stop-dot,
a.vstop-link:hover .vstop-dot {
  background: var(--color-primary);
}

.portal,
.vportal {
  position: absolute;
  overflow: visible;
  fill: none;
  stroke: var(--color-map-line);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke var(--transition-fast);
}

.portal {
  left: -1px;
  top: -8px;
  width: 24px;
  height: 52px;
}

.stop--hover .portal,
a.vstop-link:hover .vportal {
  stroke: var(--color-primary);
}

.stop-label {
  font-family: var(--font-family-display);
  font-size: 17px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  white-space: nowrap;
}

.stop--hover .stop-label,
a.vstop-link:hover .stop-label {
  color: var(--color-primary);
  text-decoration: underline;
}

/* Dimension lines naming each tunnel-boring section */
.dims {
  position: absolute;
  left: 16px;
  right: 16px;
  top: var(--dims-y);
  list-style: none;
}

.dim {
  position: absolute;
  top: 0;
  height: 36px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 2px 6px;
  border-bottom: 1px solid var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.2;
}

/* Wraps onto two lines when the section is narrow */
.dim-text {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 6px;
  text-align: center;
}



/* End ticks */
.dim::before,
.dim::after {
  content: "";
  position: absolute;
  bottom: -5px;
  width: 1px;
  height: 10px;
  background: var(--color-text-secondary);
}

.dim::before {
  left: 0;
}

.dim::after {
  right: 0;
}

.dim-label {
  white-space: nowrap;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.dim-length {
  color: var(--color-text-secondary);
}

/* =========== Vertical line (mobile) =========== */

.vline {
  display: none;
  list-style: none;
  padding: 0;
  border-bottom: 1px solid var(--color-border);
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
  background: repeating-linear-gradient(
    180deg,
    var(--color-map-line) 0 9px,
    transparent 9px 14px
  );
  opacity: 0.75;
}

.vstop::before {
  left: 22px;
}

.vstop::after {
  left: 31px;
}

/* Portals: solid surface track on the open-air side, dashed tunnel beyond. */
.vstop--portal-west::before,
.vstop--portal-west::after {
  background:
    linear-gradient(var(--color-map-line) 0 50%, transparent 50%),
    repeating-linear-gradient(180deg, var(--color-map-line) 0 9px, transparent 9px 14px) 0 50% / 100% 50% no-repeat;
}

.vstop--portal-east::before,
.vstop--portal-east::after {
  background:
    linear-gradient(transparent 0 50%, var(--color-map-line) 50%),
    repeating-linear-gradient(180deg, var(--color-map-line) 0 9px, transparent 9px 14px) 0 0 / 100% 50% no-repeat;
}

.vportal {
  left: 8px;
  top: calc(50% - 12px);
  width: 40px;
  height: 24px;
}

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

a.vstop-link:hover,
a.vstop-link:visited {
  color: var(--color-text-primary);
  text-decoration: none;
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
}


.vstop-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.vseg {
  min-height: 64px;
  display: flex;
  align-items: center;
}

.vseg--palisades {
  min-height: 96px;
  background: var(--rock-pattern) 0 0 / 40px 32px, var(--color-rock);
}

.vseg-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
}

a.vseg-text,
a.vseg-text:visited {
  flex: 1;
  color: inherit;
  text-decoration: none;
}

a.vseg-text:hover .vseg-label {
  color: var(--color-primary);
  text-decoration: underline;
}

.vseg-label {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.vseg-length {
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}

.vseg-tbm {
  font-size: 13px;
  color: var(--color-accent-ink);
}

/* Open-air track at each end of the list */
.vterm {
  display: flex;
  align-items: center;
  min-height: 44px;
}

.vterm--west::before,
.vterm--west::after {
  background: var(--color-map-line);
}

.vcasing {
  background: var(--color-accent-muted);
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

.vstop-mile {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.vstop .stop-label {
  font-size: 18px;
  white-space: normal;
}

/* =========== Progress table =========== */

.progress {
  padding: var(--spacing-sm) 20px 18px;
}

.progress-title {
  margin: 0 0 10px;
  font-family: var(--font-family-base);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.progress-est {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-accent-muted);
  color: var(--color-accent-ink);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.progress-rows {
  list-style: none;
  display: grid;
  gap: 8px;
}

.progress-row {
  display: grid;
  grid-template-columns: 170px minmax(120px, 1fr) minmax(0, auto) 150px;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}

.pr-name {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.pr-name span {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.pr-bar {
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-map-line), transparent 85%);
  overflow: hidden;
}

.pr-bar > span {
  position: absolute;
  inset: 0 auto 0 0;
  min-width: 4px;
  border-radius: 4px;
  background: var(--color-accent);
}

.progress-row:has(.pr-muted.pr-eta) .pr-bar > span {
  min-width: 0;
}

.pr-figure {
  white-space: nowrap;
}

.pr-muted {
  color: var(--color-text-secondary);
}

.pr-eta {
  text-align: right;
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.progress-foot {
  margin: 12px 0 0;
  max-width: 90ch;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

@media (max-width: 1000px) {
  .progress-row {
    grid-template-columns: 1fr auto;
    gap: 4px 12px;
  }

  .pr-bar {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .pr-figure {
    grid-column: 1 / -1;
    grid-row: 3;
    white-space: normal;
  }

  .pr-eta {
    grid-column: 2;
    grid-row: 1;
  }

  .progress-rows {
    gap: 14px;
  }
}

/* Below this the to-scale Manhattan end gets too crowded for labels. */
@media (max-width: 1080px) {
  .strip {
    display: none;
  }

  .vline {
    display: block;
  }

  .route-title {
    font-size: 26px;
  }

  .progress {
    padding: var(--spacing-sm);
  }
}
</style>
