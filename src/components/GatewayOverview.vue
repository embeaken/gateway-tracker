<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { images } from "../assets/activityData";
import { PALISADES_DRIVE_FT } from "../assets/data";
import { useSiteClock } from "../useSiteClock";

defineProps<{ explainerOpen: boolean }>();
const emit = defineEmits<{ (e: "toggle-explainer"): void }>();

const { miningDay } = useSiteClock();

const activePhotoIndex = ref(0);
const paused = ref(false);
let carouselTimer: number | undefined;

// Date-only strings ("2026-10-01") parse as UTC midnight, which renders as the
// previous day in US timezones. Anchor them to local noon instead.
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const parseDate = (date: string) =>
  DATE_ONLY_RE.test(date) ? new Date(`${date}T12:00:00`) : new Date(date);

const formatDate = (date: string) =>
  parseDate(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const transformImage = (url: string, width: number) => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return url;
  }

  const params = new URLSearchParams({
    url,
    w: width.toString(),
    fm: "webp",
  });
  return `/.netlify/images?${params.toString()}`;
};

const heroPhotos = computed(() =>
  [...images].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).slice(0, 5),
);

const activePhoto = computed(() => heroPhotos.value[activePhotoIndex.value]);

const stats = [
  { value: "1910", label: "year the tunnels it replaces opened" },
  { value: "2", label: "new rail tubes under the Hudson" },
  { value: PALISADES_DRIVE_FT.toLocaleString("en-US") + " ft", label: "first drive, portal to Hudson County shaft" },
  { value: "~30 ft", label: "of tunnel per day, planned pace" },
];

const goTo = (index: number) => {
  activePhotoIndex.value = index;
};

onMounted(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || heroPhotos.value.length <= 1) return;

  carouselTimer = window.setInterval(() => {
    if (paused.value) return;
    activePhotoIndex.value = (activePhotoIndex.value + 1) % heroPhotos.value.length;
  }, 8000);
});

onUnmounted(() => {
  if (carouselTimer) window.clearInterval(carouselTimer);
});
</script>

<template>
  <section class="overview">
    <div class="container overview-grid">
      <div class="overview-copy">
        <p class="status-line">
          <span class="live-dot" aria-hidden="true"></span>
          <span>Tunnel boring is underway</span>
          <span class="status-day">Day {{ miningDay }}</span>
        </p>

        <h1>America is building a big new infrastructure project. <em>Yes, really.</em></h1>

        <p class="lede">
          A tunnel boring machine is chewing through the New Jersey Palisades right now, cutting the
          first stretch of two new passenger rail tubes between New York and New Jersey. It's the
          busiest rail corridor in the US, thousands of people have jobs on it, and it might even
          prove that not everything is terrible.
        </p>

        <div class="cta-row">
          <a href="#cameras" class="cta cta-primary">
            <span class="live-dot live-dot--light" aria-hidden="true"></span>
            Watch the live cams
          </a>
          <button
            type="button"
            class="cta cta-secondary"
            :aria-expanded="explainerOpen"
            aria-controls="overview-explainer"
            @click="emit('toggle-explainer')"
          >
            {{ explainerOpen ? "Hide the backstory" : "What's going on?" }}
            <svg class="cta-chevron" :class="{ open: explainerOpen }" viewBox="0 0 10 6" aria-hidden="true">
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <figure
        v-if="activePhoto"
        class="feature-photo"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
        @focusin="paused = true"
        @focusout="paused = false"
      >
        <a class="feature-photo-link" :href="activePhoto.url" target="_blank" rel="noopener">
          <img
            v-for="(photo, index) in heroPhotos"
            :key="photo.url"
            :src="transformImage(photo.url, 1200)"
            :alt="index === activePhotoIndex ? photo.caption : ''"
            :aria-hidden="index !== activePhotoIndex"
            :loading="index === 0 ? 'eager' : 'lazy'"
            class="carousel-photo"
            :class="{ 'carousel-photo--active': index === activePhotoIndex }"
          />
        </a>
        <figcaption class="photo-caption">
          <span class="photo-date">{{ formatDate(activePhoto.date) }}</span>
          {{ activePhoto.caption }}
        </figcaption>
        <div class="photo-dots" role="group" aria-label="Choose photo">
          <button
            v-for="(_photo, index) in heroPhotos"
            :key="index"
            type="button"
            class="photo-dot"
            :class="{ 'photo-dot--active': index === activePhotoIndex }"
            :aria-label="`Photo ${index + 1} of ${heroPhotos.length}`"
            :aria-current="index === activePhotoIndex"
            @click="goTo(index)"
          ></button>
        </div>
      </figure>
    </div>

    <div class="container">
      <dl class="stats">
        <div v-for="stat in stats" :key="stat.label" class="stat">
          <dt class="stat-value">{{ stat.value }}</dt>
          <dd class="stat-label">{{ stat.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.overview {
  padding-bottom: var(--spacing-lg);
}

.overview-grid {
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 1fr) minmax(440px, 1fr);
  gap: clamp(var(--spacing-lg), 4vw, var(--spacing-3xl));
  padding-top: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
}

.overview-copy {
  min-width: 0;
  max-width: 660px;
}

.status-line {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 var(--spacing-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.status-day {
  padding: 4px 7px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: white;
}

.overview h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(44px, 5.4vw, 76px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.overview h1 em {
  font-style: normal;
  color: var(--color-accent);
}

.lede {
  max-width: 56ch;
  margin: var(--spacing-md) 0 0;
  color: var(--color-text-secondary);
  font-size: 18px;
  line-height: 1.6;
  text-wrap: pretty;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--spacing-lg);
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition:
    background var(--transition-base),
    border-color var(--transition-base),
    transform var(--transition-base);
}

/* Inverts with the theme: ink-on-concrete in light, white-on-ink in dark. */
.cta-primary,
.cta-primary:visited {
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-background);
}

.cta-primary:hover {
  color: var(--color-background);
  border-bottom-color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-text-primary), var(--color-background) 18%);
}

.cta-secondary {
  border: 1px solid color-mix(in srgb, var(--color-text-primary), transparent 75%);
  background: transparent;
  color: var(--color-text-primary);
}

.cta-secondary:hover {
  border-color: var(--color-text-primary);
}

.cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.live-dot--light {
  background: #ff5a4f;
}

.cta-chevron {
  width: 10px;
  height: 6px;
  transition: transform var(--transition-base);
}

.cta-chevron.open {
  transform: rotate(180deg);
}

/* --- Photo --- */

.feature-photo {
  position: relative;
  min-width: 0;
  aspect-ratio: 4 / 3;
  max-height: 520px;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-ink);
  color: white;
}

.feature-photo-link {
  position: absolute;
  inset: 0;
  border: 0;
}

.carousel-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 1200ms ease;
}

.carousel-photo--active {
  opacity: 1;
}

.feature-photo::after {
  content: "";
  position: absolute;
  inset: 45% 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.8));
  pointer-events: none;
}

.photo-caption {
  position: absolute;
  z-index: 1;
  left: 18px;
  right: 110px;
  bottom: 16px;
  color: white;
  font-size: 15px;
  line-height: 1.35;
  pointer-events: none;
  text-wrap: pretty;
}

.photo-date {
  display: block;
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.75);
  font-family: var(--font-family-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.photo-dots {
  position: absolute;
  z-index: 2;
  display: flex;
  right: 12px;
  bottom: 12px;
  gap: 2px;
}

.photo-dot {
  width: 20px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.photo-dot::before {
  content: "";
  display: block;
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.4);
  transition: background var(--transition-base);
}

.photo-dot--active::before,
.photo-dot:hover::before {
  background: white;
}

/* --- Stats --- */

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 2px solid var(--color-text-primary);
}

.stat {
  padding: 14px var(--spacing-md) 0 0;
}

.stat + .stat {
  padding-left: var(--spacing-md);
  border-left: 1px solid var(--color-border);
}

.stat-value {
  font-family: var(--font-family-display);
  font-size: 40px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  color: var(--color-text-primary);
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

@media (max-width: 1100px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-copy {
    max-width: 760px;
  }

  .feature-photo {
    aspect-ratio: 16 / 9;
  }
}

@media (max-width: 820px) {
  .overview-grid {
    padding-top: var(--spacing-lg);
    gap: var(--spacing-lg);
  }

  .lede {
    font-size: 16px;
  }

  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: var(--spacing-md);
  }

  .stat:nth-child(3) {
    padding-left: 0;
    border-left: 0;
  }

  .stat-value {
    font-size: 32px;
  }
}

@media (max-width: 560px) {
  .feature-photo {
    aspect-ratio: 4 / 3;
  }

  .photo-caption {
    right: 18px;
    bottom: 40px;
  }
}
</style>
