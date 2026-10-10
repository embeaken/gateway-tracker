<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { images } from "../assets/activityData";
import { cdnFullImage, cdnImage, cdnSrcset } from "../imageCdn";

// Latest GDC construction photos, auto-rotating, full-bleed across the top of
// the page. The default slot is laid over the bottom-left; the bottom `overlap`
// px are left clear for whatever overlaps the photo from below.
withDefaults(defineProps<{ overlap?: number }>(), { overlap: 0 });

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

const heroPhotos = computed(() =>
  [...images].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).slice(0, 5),
);

const activePhoto = computed(() => heroPhotos.value[activePhotoIndex.value]);

// Full-bleed, so size to the viewport (up to a 2x desktop screen).
const WIDTHS = [640, 960, 1280, 1920, 2560];

// Only put a slide in the DOM once it's showing or up next, so the page
// doesn't fetch all five photos up front. Slides stay mounted afterwards so
// the crossfade has something to fade from.
const mounted = ref(new Set([0, 1]));

// Hide each photo until it has loaded, so the slow first load shows the navy
// background (not alt text), then fades in.
const loaded = ref(new Set<number>());
const onLoad = (index: number) => {
  loaded.value = new Set([...loaded.value, index]);
};

const goTo = (index: number) => {
  activePhotoIndex.value = index;
};

watch(activePhotoIndex, (i) => {
  mounted.value = new Set([...mounted.value, i, (i + 1) % heroPhotos.value.length]);
});

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
  <section
    v-if="activePhoto"
    class="hero-photos"
    :style="{ '--overlap': `${overlap}px` }"
    aria-label="Latest construction photos"
  >
    <figure
      class="feature-photo"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
    >
      <a class="feature-photo-link" :href="cdnFullImage(activePhoto.url)" target="_blank" rel="noopener" tabindex="-1">
        <template v-for="(photo, index) in heroPhotos" :key="photo.url">
          <img
            v-if="mounted.has(index)"
            :src="cdnImage(photo.url, 1920)"
            :srcset="cdnSrcset(photo.url, WIDTHS)"
            sizes="100vw"
            :alt="index === activePhotoIndex ? photo.caption : ''"
            :aria-hidden="index !== activePhotoIndex"
            :fetchpriority="index === 0 ? 'high' : 'low'"
            class="carousel-photo"
            :class="{ 'carousel-photo--active': index === activePhotoIndex && loaded.has(index) }"
            @load="onLoad(index)"
          />
        </template>
      </a>

      <div class="overlay container">
        <div v-if="$slots.default" class="overlay-slot">
          <slot />
        </div>
        <div class="photo-meta">
          <p class="photo-caption">
            <span class="photo-date tabular">{{ formatDate(activePhoto.date) }}</span>
            <a :href="cdnFullImage(activePhoto.url)" target="_blank" rel="noopener">{{ activePhoto.caption }}</a>
          </p>
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
        </div>
      </div>
    </figure>
  </section>
</template>

<style scoped>
.feature-photo {
  position: relative;
  height: clamp(380px, 56vh, 560px);
  margin: 0;
  overflow: hidden;
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
  inset: 25% 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55) 45%, rgba(0, 0, 0, 0.85));
  pointer-events: none;
}

/* Also a .container (max-width + side padding, centred by the auto margins),
   so the overlay lines up with the page content below. Clears the overlap. */
.overlay {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding-bottom: calc(var(--overlap) + var(--spacing-lg));
  pointer-events: none;
}

.overlay-slot {
  flex: 1 1 auto;
  max-width: 760px;
}

.photo-meta {
  display: flex;
  flex: 0 1 340px;
  margin-left: auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 0;
  text-align: right;
}

.photo-caption {
  min-width: 0;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  line-height: 1.35;
  text-wrap: pretty;
}

.photo-caption a {
  color: inherit;
  pointer-events: auto;
}

.photo-caption a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
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
  display: flex;
  flex: none;
  gap: 2px;
  margin-bottom: -4px;
  pointer-events: auto;
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

@media (max-width: 820px) {
  .overlay {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .photo-meta {
    flex: none;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--spacing-md);
    text-align: left;
  }
}
</style>
