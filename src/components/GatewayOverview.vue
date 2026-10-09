<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  images,
  blueskyPosts,
  pressReleases,
  constructionNotices,
  youtubeVideos,
} from "../assets/activityData";

defineProps<{ explainerOpen: boolean }>();
const emit = defineEmits<{ (e: "toggle-explainer"): void }>();


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

// Most recent item across every source: a "last updated" trust signal.
const lastUpdated = formatDate(
  [...images, ...blueskyPosts, ...pressReleases, ...constructionNotices, ...youtubeVideos]
    .map((item) => item.date)
    .reduce((latest, d) => (parseDate(d) > parseDate(latest) ? d : latest)),
);

const heroPhotos = computed(() =>
  [...images].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).slice(0, 5),
);

const activePhoto = computed(() => heroPhotos.value[activePhotoIndex.value]);

// Scale of the machines (GDC press release, Oct 8 2026).
const stats = [
  { value: "28′ 8″", label: "cutterhead diameter of each tunnel boring machine" },
  { value: "1,680+ tons", label: "weight of each machine and its trailing gear" },
  { value: "~500 ft", label: "from cutterhead to the end of the trailing gantries" },
  { value: "1910", label: "year the tunnels being replaced opened" },
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
        <p class="kicker eyebrow">
          Hudson Tunnel Project <span aria-hidden="true">·</span> Updated {{ lastUpdated }}
        </p>

        <h1>America is building a big new infrastructure project. <em>Yes, really.</em></h1>

        <p class="lede">
          Two new passenger rail tubes are under construction beneath the Hudson River, and on
          October 8, 2026 the first tunnel boring machine started digging. This work will strengthen
          the busiest rail corridor in the US, create thousands of jobs, and maybe prove that not
          everything is terrible.
        </p>

        <div class="cta-row">
          <a href="#cameras" class="cta cta-primary">Watch the live cameras</a>
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
          <span class="photo-date tabular">{{ formatDate(activePhoto.date) }}</span>
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
          <dt class="stat-value tabular">{{ stat.value }}</dt>
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

.eyebrow {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-accent-ink);
}

.overview h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(40px, 4.6vw, 64px);
  font-weight: var(--font-weight-semibold);
  line-height: 1.04;
  letter-spacing: -0.015em;
  text-wrap: pretty;
}

.overview h1 em {
  font-style: italic;
  font-weight: 400;
  color: var(--color-primary);
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
  min-height: 46px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition:
    background var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base);
}

/* Inverts with the theme: ink-on-concrete in light, white-on-ink in dark. */
.cta-primary,
.cta-primary:visited {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.cta-primary:hover {
  color: white;
  text-decoration: none;
  border-color: var(--color-primary-dark);
  background: var(--color-primary-dark);
}

/* Dark: the light-blue primary needs dark text. */
[data-theme="dark"] .cta-primary,
[data-theme="dark"] .cta-primary:hover {
  color: var(--color-navy);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .cta-primary,
  :root:not([data-theme="light"]) .cta-primary:hover {
    color: var(--color-navy);
  }
}

.cta-secondary {
  border: 1px solid color-mix(in srgb, var(--color-text-primary), transparent 75%);
  background: transparent;
  color: var(--color-text-primary);
}

.cta-secondary:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
}

.cta:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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
  background: var(--color-navy);
  color: white;
}

.feature-photo-link {
  position: absolute;
  inset: 0;
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
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
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
  border-top: 3px solid var(--color-accent);
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
  font-size: 44px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-navy);
  line-height: 1;
}

[data-theme="dark"] .stat-value {
  color: var(--color-text-primary);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .stat-value {
    color: var(--color-text-primary);
  }
}

.stat-label {
  margin-top: 6px;
  font-size: 14px;
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
