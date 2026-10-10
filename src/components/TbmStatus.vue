<script setup lang="ts">
import { computed } from "vue";
import { tbms } from "../assets/data";

// The line over the hero photo: what's happening, in plain words. Built from
// facts in data.ts only; the estimated TBM position lives on the route map,
// next to its "estimates" note.
withDefaults(defineProps<{ tone?: "light" | "dark" }>(), { tone: "light" });

const formatDay = (yyyyMmDd: string) =>
  new Date(`${yyyyMmDd}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const [first, second] = tbms;

const headline = computed(() =>
  first?.launched ? `Tunnel boring started ${formatDay(first.launched)}.` : "Tunnel boring starts soon.",
);

const detail = computed(() => {
  const sentences: string[] = [];
  if (first?.launched) {
    sentences.push("The first machine is digging east under the Palisades, toward the Hudson County shaft.");
  }
  if (second) {
    sentences.push(
      second.launched
        ? `The second, in the parallel tube, started ${formatDay(second.launched)}.`
        : `The second, in the parallel tube, is ${(second.expected ?? "launching soon").toLowerCase()}.`,
    );
  }
  return sentences.join(" ");
});
</script>

<template>
  <div class="tbm-status" :class="`tbm-status--${tone}`">
    <h2 class="headline">{{ headline }}</h2>
    <p v-if="detail" class="detail">{{ detail }}</p>
  </div>
</template>

<style scoped>
.tbm-status {
  min-width: 0;
}

.headline {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.detail {
  max-width: 52ch;
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 17px;
  line-height: 1.45;
  text-wrap: pretty;
}

/* On top of a photo */
.tbm-status--dark .headline {
  color: white;
}

.tbm-status--dark .detail {
  color: rgba(255, 255, 255, 0.88);
}

@media (max-width: 820px) {
  .detail {
    font-size: 15px;
  }
}
</style>
