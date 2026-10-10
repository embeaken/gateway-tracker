<script setup lang="ts">
import { computed } from "vue";
import { PALISADES_DRIVE, tbms } from "../assets/data";
import { useTbmProgress, formatFt, formatPct, formatMonth } from "../useTbmProgress";

// The live headline for the top of the page: where the lead TBM is right now.
withDefaults(defineProps<{ tone?: "light" | "dark"; headingId?: string }>(), { tone: "light" });

const { lead } = useTbmProgress();

const status = computed(() => {
  const m = lead.value;
  if (m.status === "mining") {
    return {
      kicker: `Tunnel boring · day ${m.day}`,
      headline: `${m.tbm.label} is ~${formatFt(m.ft)} into the Palisades`,
      sub: [
        `${formatPct(m.fraction)} of the ${formatFt(PALISADES_DRIVE.lengthFt)} drive to the Hudson County shaft`,
        m.arrival && `due ~${formatMonth(m.arrival)}`,
      ]
        .filter(Boolean)
        .join(" · "),
    };
  }
  if (m.status === "arrived") {
    return {
      kicker: "Tunnel boring",
      headline: `${m.tbm.label} has reached the Hudson County shaft`,
      sub: `The ${formatFt(PALISADES_DRIVE.lengthFt)} Palisades drive is complete (est.)`,
    };
  }
  return {
    kicker: "Tunnel boring",
    headline: "Tunnel boring is about to begin",
    sub: tbms[0]?.expected ?? "",
  };
});
</script>

<template>
  <div class="tbm-status" :class="`tbm-status--${tone}`">
    <p class="kicker">
      <span class="live-dot" aria-hidden="true"></span>
      {{ status.kicker }}
    </p>
    <h2 :id="headingId" class="headline">{{ status.headline }}</h2>
    <p class="sub tabular">{{ status.sub }}</p>
  </div>
</template>

<style scoped>
.tbm-status {
  min-width: 0;
}

.kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  color: var(--color-accent-ink);
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 0 var(--color-accent);
  animation: pulse 2.4s ease-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(184, 134, 43, 0.55);
  }
  70%,
  100% {
    box-shadow: 0 0 0 7px rgba(184, 134, 43, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .live-dot {
    animation: none;
  }
}

.headline {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.sub {
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.45;
  text-wrap: pretty;
}

/* On top of a photo */
.tbm-status--dark .kicker {
  color: var(--color-accent);
}

.tbm-status--dark .headline {
  color: white;
}

.tbm-status--dark .sub {
  color: rgba(255, 255, 255, 0.85);
}

@media (max-width: 820px) {
  .sub {
    font-size: 15px;
  }
}
</style>
