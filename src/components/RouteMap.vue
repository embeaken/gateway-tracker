<script setup lang="ts">
import { routeStops, PALISADES_DRIVE_FT } from "../assets/data";

// Schematic, not to scale. Zones are percentages of the route width.
const RIVER_FROM = 44;
const RIVER_TO = 64;

const portal = routeStops[0]!;
const hcShaft = routeStops.find((s) => s.id === "hudson-county-shaft")!;

const camHref = (stop: (typeof routeStops)[number]) =>
  stop.cams.length ? `#cam-${stop.cams[0]}` : undefined;

const camLabel = (n: number) => (n === 1 ? "1 cam" : `${n} cams`);
</script>

<template>
  <section class="route" aria-labelledby="route-title">
    <div class="container">
      <div class="route-head">
        <h2 id="route-title" class="route-title">The route</h2>
        <p class="kicker">West → east · schematic, not to scale · tap a stop to jump to its camera</p>
      </div>

      <!-- Horizontal strip map (tablet / desktop) -->
      <div class="strip" :style="{ '--river-from': `${RIVER_FROM}%`, '--river-to': `${RIVER_TO}%` }">
        <div class="zone-labels" aria-hidden="true">
          <span class="zone" :style="{ left: '0%' }">New Jersey</span>
          <span class="zone zone--river" :style="{ left: `${RIVER_FROM}%`, width: `${RIVER_TO - RIVER_FROM}%` }">
            Hudson River
          </span>
          <span class="zone" :style="{ left: `${RIVER_TO + 1}%` }">Manhattan</span>
        </div>

        <div class="river-band" aria-hidden="true"></div>

        <!-- Drive 1 bracket -->
        <div
          class="drive"
          :style="{ left: `${portal.at}%`, width: `${hcShaft.at - portal.at}%` }"
          aria-hidden="true"
        >
          <span class="drive-label">
            Drive 1 · {{ PALISADES_DRIVE_FT.toLocaleString("en-US") }} ft through the Palisades
          </span>
        </div>

        <div class="track" aria-hidden="true">
          <div class="track-line"></div>
          <div class="tbm" :style="{ left: `${portal.at}%` }">
            <span class="tbm-head"></span>
            <span class="tbm-label">TBM 1 →</span>
          </div>
        </div>

        <ol class="stops">
          <li
            v-for="(stop, i) in routeStops"
            :key="stop.id"
            class="stop"
            :class="[`stop--${stop.state}`, i % 2 ? 'stop--above' : 'stop--below']"
            :style="{ left: `${stop.at}%` }"
          >
            <component
              :is="camHref(stop) ? 'a' : 'div'"
              :href="camHref(stop)"
              class="stop-link"
            >
              <span class="stop-dot" aria-hidden="true"></span>
              <span class="stop-text">
                <span class="stop-label">{{ stop.label }}</span>
                <span class="stop-sub">{{ stop.sublabel }}</span>
                <span v-if="stop.cams.length" class="stop-cams">
                  <span class="live-dot" aria-hidden="true"></span>{{ camLabel(stop.cams.length) }}
                </span>
              </span>
            </component>
          </li>
        </ol>
      </div>

      <!-- Vertical line diagram (mobile) -->
      <ol class="vline">
        <li
          v-for="stop in routeStops"
          :key="stop.id"
          class="vstop"
          :class="[`vstop--${stop.state}`, stop.id === 'river' && 'vstop--river']"
        >
          <component :is="camHref(stop) ? 'a' : 'div'" :href="camHref(stop)" class="vstop-link">
            <span class="vstop-dot" aria-hidden="true"></span>
            <span class="vstop-text">
              <span class="stop-label">{{ stop.label }}</span>
              <span class="stop-sub">{{ stop.sublabel }}</span>
            </span>
            <span v-if="stop.cams.length" class="stop-cams">
              <span class="live-dot" aria-hidden="true"></span>{{ camLabel(stop.cams.length) }}
            </span>
          </component>
          <p v-if="stop.id === 'portal'" class="vstop-note">
            TBM 1 is mining east toward the Hudson County shaft
          </p>
        </li>
      </ol>
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
  line-height: 1;
}

/* =========== Horizontal strip =========== */

.strip {
  --track-y: 118px;
  position: relative;
  height: 236px;
  border-radius: var(--radius-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.river-band {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--river-from);
  right: calc(100% - var(--river-to));
  background:
    repeating-linear-gradient(
      0deg,
      transparent 0 9px,
      color-mix(in srgb, var(--color-primary), transparent 88%) 9px 10px
    ),
    var(--color-river);
}

.zone-labels {
  position: absolute;
  inset: 12px 16px auto 16px;
  height: 14px;
}

.zone {
  position: absolute;
  top: 0;
  font-family: var(--font-family-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.zone--river {
  text-align: center;
  color: var(--color-primary);
}

.track {
  position: absolute;
  left: 16px;
  right: 16px;
  top: var(--track-y);
  height: 0;
}

.track-line {
  position: absolute;
  left: 3%;
  right: 3%;
  top: -3px;
  height: 6px;
  border-radius: 3px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-text-primary) 0 14px,
    transparent 14px 22px
  );
  opacity: 0.85;
}

.drive {
  position: absolute;
  top: calc(var(--track-y) - 14px);
  height: 28px;
  margin-left: 16px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-accent), transparent 82%);
}

.drive-label {
  position: absolute;
  left: 50%;
  top: 36px;
  transform: translateX(-50%);
  font-family: var(--font-family-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-ink);
  white-space: nowrap;
}

.tbm {
  position: absolute;
  top: 0;
  transform: translate(10px, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

.tbm-head {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow:
    0 0 0 3px var(--color-card-bg),
    0 0 0 5px var(--color-accent);
}

.tbm-label {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: white;
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  white-space: nowrap;
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

/* The link box is the dot itself (a real hit target); labels hang off it. */
.stop-link {
  position: absolute;
  left: -11px;
  top: -11px;
  width: 22px;
  height: 22px;
  display: block;
  color: var(--color-text-primary);
  border-bottom: 0;
}

a.stop-link:hover,
a.stop-link:visited {
  color: var(--color-text-primary);
  border-bottom: 0;
}

.stop-dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 4px solid var(--color-text-primary);
  background: var(--color-card-bg);
  z-index: 3;
  transition: transform var(--transition-base), background var(--transition-base);
}

.stop--endpoint .stop-dot {
  background: var(--color-text-primary);
}

a.stop-link:hover .stop-dot {
  transform: scale(1.2);
  background: var(--color-accent);
}

/* Leader line from dot to label */
.stop-text {
  position: absolute;
  left: 11px;
  width: 150px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1px;
}

.stop--below .stop-text {
  top: 33px;
}

.stop--above .stop-text {
  bottom: 33px;
  flex-direction: column-reverse;
}

/* Endpoints hug the edges so labels don't clip */
.stop:first-child .stop-text {
  transform: none;
  left: 0;
  align-items: flex-start;
  text-align: left;
}

.stop:last-child .stop-text {
  transform: none;
  left: auto;
  right: 0;
  align-items: flex-end;
  text-align: right;
}

.stop:first-child.stop--below .stop-text {
  top: 65px; /* clear the drive label */
}

.stop-label {
  font-family: var(--font-family-display);
  font-size: 19px;
  font-weight: var(--font-weight-bold);
  line-height: 1.05;
}

a.stop-link:hover .stop-label {
  color: var(--color-accent-ink);
}

.stop-sub {
  font-size: 12px;
  line-height: 1.3;
  color: var(--color-text-secondary);
}

.stop-cams {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
  font-family: var(--font-family-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.stop-cams .live-dot {
  width: 6px;
  height: 6px;
  animation: none;
}

/* =========== Vertical line (mobile) =========== */

.vline {
  display: none;
  list-style: none;
  padding: var(--spacing-sm) 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
}

.vstop {
  position: relative;
  padding: 0 var(--spacing-sm) 0 48px;
}

/* the line */
.vstop::before {
  content: "";
  position: absolute;
  left: 26px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: repeating-linear-gradient(
    180deg,
    var(--color-text-primary) 0 10px,
    transparent 10px 16px
  );
}

.vstop:first-child::before {
  top: 22px;
}

.vstop:last-child::before {
  bottom: calc(100% - 22px);
}

.vstop--river {
  background: var(--color-river);
}

.vstop-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: var(--color-text-primary);
  border-bottom: 0;
}

a.vstop-link:hover,
a.vstop-link:visited {
  color: var(--color-text-primary);
  border-bottom: 0;
}

.vstop-dot {
  position: absolute;
  left: 18px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid var(--color-text-primary);
  background: var(--color-card-bg);
}

.vstop--endpoint .vstop-dot {
  background: var(--color-text-primary);
}

.vstop-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.vstop .stop-label {
  font-size: 18px;
}

.vstop-note {
  margin: -4px 0 10px;
  padding: 6px 10px;
  border-left: 3px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-accent), transparent 88%);
  color: var(--color-accent-ink);
  font-family: var(--font-family-mono);
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.02em;
}

@media (max-width: 820px) {
  .strip {
    display: none;
  }

  .vline {
    display: block;
  }

  .route-title {
    font-size: 26px;
  }
}
</style>
