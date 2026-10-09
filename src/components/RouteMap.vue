<script setup lang="ts">
import { computed } from "vue";
import { routeStops, PALISADES_DRIVE, ROUTE } from "../assets/data";
import { useTbmProgress, formatFt, formatPct, formatMonth } from "../useTbmProgress";

// Drawn to scale: feet along the tunnel → percent of the track width, with a
// small inset at each end for the terminal capsules.
const INSET = 3;
const pos = (ft: number) => INSET + ((100 - 2 * INSET) * ft) / ROUTE.lengthFt;

const RIVER_FROM = pos(ROUTE.riverFromFt);
const RIVER_TO = pos(ROUTE.riverToFt);
const DRIVE_TO = pos(PALISADES_DRIVE.lengthFt);

const MILE = 5280;
const mileTicks = Array.from({ length: Math.floor(ROUTE.lengthFt / MILE) + 1 }, (_, i) => ({
  label: i === 0 ? "0" : i === 1 ? "1 mile" : `${i} miles`,
  at: pos(i * MILE),
}));

const miles = (ft: number) => (ft === 0 ? "0" : (ft / MILE).toFixed(1));

const { progress } = useTbmProgress();

/** Map a 0–1 drive fraction onto the route position (percent). */
const driveAt = (fraction: number) => pos(fraction * PALISADES_DRIVE.lengthFt);

const markers = computed(() =>
  progress.value.map((p) => ({
    ...p,
    at: driveAt(p.fraction),
    lane: p.tbm.tube === "North" ? "north" : "south",
  })),
);

const camHref = (stop: (typeof routeStops)[number]) =>
  stop.cams.length ? `#cam-${stop.cams[0]}` : undefined;

/** The tunnel's two ends are portals: tracks leave the ground there. */
const portalSide = (i: number) =>
  i === 0 ? "west" : i === routeStops.length - 1 ? "east" : null;
</script>

<template>
  <section id="route" class="route" aria-labelledby="route-title">
    <div class="container">
      <div class="route-head">
        <h2 id="route-title" class="route-title">The route</h2>
        <p class="route-note">
          Two tubes, west to east, drawn to scale · select a stop to see its camera
        </p>
      </div>

      <div class="route-card">
        <!-- Horizontal strip map (tablet / desktop) -->
        <div class="strip" :style="{ '--river-from': RIVER_FROM / 100, '--river-to': RIVER_TO / 100 }">
          <div class="zone-labels" aria-hidden="true">
            <span class="zone" :style="{ left: '0%' }">New Jersey</span>
            <span
              class="zone zone--river"
              :style="{ left: `${RIVER_FROM}%`, width: `${RIVER_TO - RIVER_FROM}%` }"
            >
              Hudson River
            </span>
            <span class="zone zone--end">Manhattan</span>
          </div>

          <div class="river-band" aria-hidden="true"></div>

          <div class="track" aria-hidden="true">
            <!-- First drive highlight -->
            <div class="drive" :style="{ left: `${INSET}%`, width: `${DRIVE_TO - INSET}%` }"></div>

            <!-- Twin tubes: underground (dashed), plus surface track beyond each portal (solid) -->
            <div class="tube tube--north"></div>
            <div class="tube tube--south"></div>
            <div class="surface surface--west tube--north"></div>
            <div class="surface surface--west tube--south"></div>
            <div class="surface surface--east tube--north"></div>
            <div class="surface surface--east tube--south"></div>

            <!-- Bored so far (estimated) + machine position -->
            <template v-for="m in markers" :key="m.tbm.id">
              <div
                v-if="m.status !== 'upcoming'"
                class="bored"
                :class="`bored--${m.lane}`"
                :style="{ left: `${INSET}%`, width: `${m.at - INSET}%` }"
              ></div>
              <div
                class="tbm"
                :class="[`tbm--${m.lane}`, `tbm--${m.status}`]"
                :style="{ left: `${m.at}%` }"
              >
                <span class="tbm-head"></span>
                <span class="tbm-label">
                  {{ m.tbm.label }}<template v-if="m.status === 'upcoming'"> · soon</template>
                </span>
              </div>
            </template>
          </div>

          <ol class="stops">
            <li
              v-for="(stop, i) in routeStops"
              :key="stop.id"
              class="stop"
              :class="[`stop--${stop.side}`, `stop--align-${stop.align ?? 'center'}`]"
              :style="{ left: `${pos(stop.ft)}%` }"
            >
              <component :is="camHref(stop) ? 'a' : 'div'" :href="camHref(stop)" class="stop-link">
                <!-- Tunnel portal: wing walls splay toward the open-air side -->
                <svg
                  v-if="portalSide(i)"
                  class="portal"
                  :class="`portal--${portalSide(i)}`"
                  viewBox="-12 -26 24 52"
                  aria-hidden="true"
                >
                  <path d="M0 -11 V-19 L-8 -26 M0 11 V19 L-8 26" />
                </svg>
                <span v-else class="stop-dot" aria-hidden="true"></span>
                <span class="stop-text">
                  <span class="stop-label">{{ stop.label }}</span>
                  <span class="stop-sub">{{ stop.sublabel }}</span>
                </span>
              </component>
            </li>
          </ol>

          <ol class="scale" aria-hidden="true">
            <li v-for="tick in mileTicks" :key="tick.label" :style="{ left: `${tick.at}%` }">
              {{ tick.label }}
            </li>
          </ol>
        </div>

        <!-- Vertical line diagram (mobile) -->
        <ol class="vline">
          <template v-for="(stop, i) in routeStops" :key="stop.id">
            <li
              class="vstop"
              :class="[stop.id === 'river' && 'vstop--river', portalSide(i) && `vstop--portal-${portalSide(i)}`]"
            >
              <component :is="camHref(stop) ? 'a' : 'div'" :href="camHref(stop)" class="vstop-link">
                <svg
                  v-if="portalSide(i)"
                  class="vportal"
                  :class="`vportal--${portalSide(i)}`"
                  viewBox="-20 -12 40 24"
                  aria-hidden="true"
                >
                  <path d="M-8 0 H-13 L-19 -7 M8 0 H13 L19 -7" />
                </svg>
                <span v-else class="vstop-dot" aria-hidden="true"></span>
                <span class="vstop-text">
                  <span class="stop-label">{{ stop.label }}</span>
                  <span class="stop-sub">{{ stop.sublabel }}</span>
                </span>
                <span class="vstop-mile tabular">mile {{ miles(stop.ft) }}</span>
              </component>
            </li>
            <!-- The first drive, with machine positions -->
            <li v-if="stop.id === 'portal'" class="vstop vdrive" aria-hidden="true">
              <span
                v-for="m in markers"
                :key="m.tbm.id"
                class="vfill"
                :class="[`vfill--${m.lane}`, `vfill--${m.status}`]"
                :style="{ height: `${m.fraction * 100}%` }"
              ></span>
              <span class="vdrive-text">
                <span v-for="m in markers" :key="m.tbm.id">
                  <strong>{{ m.tbm.label }}</strong> ·
                  {{ m.status === "upcoming" ? "launching soon" : `${formatPct(m.fraction)} of the way (est.)` }}
                </span>
              </span>
            </li>
          </template>
        </ol>

        <!-- Progress table -->
        <div class="progress">
          <h3 class="progress-title">
            Tunnel boring progress <span class="progress-est">estimated</span>
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

.route-note {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.route-card {
  border-radius: var(--radius-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* =========== Horizontal strip =========== */

.strip {
  --track-y: 136px;
  --tube-gap: 7px; /* half the distance between tube centrelines */
  position: relative;
  height: 296px;
  border-bottom: 1px solid var(--color-border);
}

.river-band {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Same coordinate frame as .track (16px inset each side) */
  left: calc(16px + (100% - 32px) * var(--river-from));
  right: calc(16px + (100% - 32px) * (1 - var(--river-to)));
  background: var(--river-waves) 0 0 / 40px 20px, var(--color-river);
}

.zone-labels {
  position: absolute;
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

.zone--river {
  text-align: center;
  color: var(--color-primary);
}

.zone--end {
  right: 0;
}

.track {
  position: absolute;
  left: 16px;
  right: 16px;
  top: var(--track-y);
  height: 0;
}

.tube,
.surface,
.bored {
  position: absolute;
  height: 4px;
  border-radius: 2px;
}

.tube {
  left: 3%; /* = INSET */
  right: 3%;
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

/* Surface track beyond each portal: solid, from the card edge to the portal */
.surface {
  background: var(--color-map-line);
  opacity: 0.75;
}

.surface--west {
  left: 0;
  width: 3%; /* = INSET */
}

.surface--east {
  left: auto;
  right: 0;
  width: 3%;
}

.bored {
  background: var(--color-accent);
  z-index: 1;
  transition: width 600ms ease;
}

.drive {
  position: absolute;
  top: -17px;
  height: 34px;
  border-radius: 17px;
  background: var(--color-accent-muted);
}

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

.tbm-head {
  position: absolute;
  left: -6px;
  top: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-card-bg);
}

.tbm--upcoming .tbm-head {
  background: var(--color-card-bg);
  box-shadow: inset 0 0 0 2px var(--color-accent);
}

.tbm-label {
  position: absolute;
  left: 4px;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-navy);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

/* North label sits above its tube, south label below. */
.tbm--north .tbm-label {
  bottom: 10px;
}

.tbm--south .tbm-label {
  top: 10px;
}

.tbm--upcoming .tbm-label {
  background: var(--color-card-bg);
  color: var(--color-accent-ink);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.stops {
  position: absolute;
  inset: 0 16px;
  list-style: none;
}

.stop {
  position: absolute;
  top: var(--track-y);
  width: 0;
  height: 0;
}

/* The link box is the station capsule (a real hit target); labels hang off it.
   The capsule spans both tubes. */
.stop-link {
  position: absolute;
  left: -11px;
  top: -18px;
  width: 22px;
  height: 36px;
  display: block;
  color: var(--color-text-primary);
}

a.stop-link:hover,
a.stop-link:visited {
  color: var(--color-text-primary);
  text-decoration: none;
}

.stop-dot {
  position: absolute;
  inset: 0;
  border-radius: 11px;
  border: 4px solid var(--color-map-line);
  background: var(--color-card-bg);
  z-index: 3;
  transition: background var(--transition-fast);
}



a.stop-link:hover .stop-dot,
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
  z-index: 3;
  transition: stroke var(--transition-fast);
}

.portal {
  left: -1px;
  top: -8px;
  width: 24px;
  height: 52px;
}

.portal--east {
  transform: scaleX(-1);
}

a.stop-link:hover .portal,
a.vstop-link:hover .vportal {
  stroke: var(--color-primary);
}

.stop-text {
  position: absolute;
  left: 11px;
  width: max-content;
  max-width: 210px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1px;
}

/* Labels sit clear of the tracks so TBM tags can pass underneath them. */
.stop--below .stop-text {
  top: 62px;
}

.stop--above .stop-text {
  bottom: 62px;
  flex-direction: column-reverse;
}

/* Crowded stops hang their labels to one side of the capsule. */
.stop--align-start .stop-text {
  transform: none;
  left: 0;
  align-items: flex-start;
  text-align: left;
}

.stop--align-end .stop-text {
  transform: none;
  left: auto;
  right: 0;
  align-items: flex-end;
  text-align: right;
}

.stop:first-child.stop--below .stop-text {
  top: 64px;
}

.stop-label {
  font-family: var(--font-family-display);
  font-size: 17px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  white-space: nowrap;
}

a.stop-link:hover .stop-label,
a.vstop-link:hover .stop-label {
  color: var(--color-primary);
  text-decoration: underline;
}

.stop-sub {
  font-size: 12px;
  line-height: 1.3;
  color: var(--color-text-secondary);
}


.scale {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 10px;
  height: 16px;
  list-style: none;
}

.scale li {
  position: absolute;
  top: 0;
  padding: 3px 0 0 5px;
  border-left: 1px solid var(--color-text-secondary);
  height: 14px;
  font-size: 10.5px;
  line-height: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* =========== Vertical line (mobile) =========== */

.vline {
  display: none;
  list-style: none;
  padding: var(--spacing-sm) 0;
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

.vportal--east {
  transform: scaleY(-1);
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

.vdrive {
  min-height: 96px;
  display: flex;
  align-items: center;
  background: var(--color-accent-muted);
}

.vfill {
  position: absolute;
  top: -10px;
  width: 3px;
  max-height: calc(100% + 10px);
  background: var(--color-accent);
  z-index: 1;
}

.vfill::after {
  content: "";
  position: absolute;
  left: -4px;
  bottom: -5px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-card-bg);
}

.vfill--upcoming::after {
  background: var(--color-card-bg);
  box-shadow: inset 0 0 0 2px var(--color-accent);
}

.vfill--north {
  left: 22px;
}

.vfill--south {
  left: 31px;
}

.vdrive-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--color-accent-ink);
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

@media (max-width: 960px) {
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
