<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { images } from "../assets/activityData";
import { formatShortDate, parseDate } from "../dates";
import { cdnFullImage, cdnImage, cdnSrcset } from "../imageCdn";

// Latest GDC photos, auto-rotating. The bottom `overlap` px are left clear for
// the map card that overlaps the photo from below.
withDefaults(defineProps<{ overlap?: number }>(), { overlap: 0 });

const WIDTHS = [640, 960, 1280, 1920, 2560];

const heroPhotos = [...images]
  .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
  .slice(0, 5);

const activeIndex = ref(0);
const activePhoto = computed(() => heroPhotos[activeIndex.value]);
const paused = ref(false);

// Mount slides lazily (current + next) so all five aren't fetched up front;
// they stay mounted so the crossfade has something to fade from.
const mounted = ref(new Set([0, 1]));
watch(activeIndex, (i) => {
  mounted.value = new Set([...mounted.value, i, (i + 1) % heroPhotos.length]);
});

// Keep each photo hidden until loaded, so the first load fades in over navy.
const loaded = ref(new Set<number>());
const onLoad = (i: number) => {
  loaded.value = new Set([...loaded.value, i]);
};

const count = heroPhotos.length;
const wrap = (i: number) => (i + count) % count;

let timer: number | undefined;
let autoRotate = false;
const startTimer = () => {
  window.clearInterval(timer);
  if (!autoRotate) return;
  timer = window.setInterval(() => {
    if (!paused.value) activeIndex.value = wrap(activeIndex.value + 1);
  }, 8000);
};
onMounted(() => {
  autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && count > 1;
  startTimer();
});
onUnmounted(() => window.clearInterval(timer));

// Manual navigation restarts the rotation clock so a fresh pick isn't skipped.
const goTo = (i: number) => {
  activeIndex.value = wrap(i);
  startTimer();
};

// Horizontal swipe on touch devices. Vertical drags fall through to page
// scroll (touch-action: pan-y).
const SWIPE_MIN = 40;
let touchStart: { x: number; y: number } | null = null;
const onTouchStart = (e: TouchEvent) => {
  if (count <= 1 || e.touches.length !== 1) return;
  const t = e.touches[0]!;
  touchStart = { x: t.clientX, y: t.clientY };
  // Warm up both neighbours so the swiped-to photo is ready to fade in.
  const i = activeIndex.value;
  mounted.value = new Set([...mounted.value, wrap(i - 1), wrap(i + 1)]);
};
const onTouchCancel = () => {
  touchStart = null;
};
const onTouchEnd = (e: TouchEvent) => {
  if (!touchStart) return;
  const t = e.changedTouches[0]!;
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  goTo(activeIndex.value + (dx < 0 ? 1 : -1));
};
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
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
      @touchcancel.passive="onTouchCancel"
    >
      <a class="feature-photo-link" :href="cdnFullImage(activePhoto.url)" target="_blank" rel="noopener" tabindex="-1">
        <template v-for="(photo, index) in heroPhotos" :key="photo.url">
          <img
            v-if="mounted.has(index)"
            :src="cdnImage(photo.url, 1920)"
            :srcset="cdnSrcset(photo.url, WIDTHS)"
            sizes="100vw"
            :alt="index === activeIndex ? photo.caption : ''"
            :aria-hidden="index !== activeIndex"
            :fetchpriority="index === 0 ? 'high' : 'low'"
            class="carousel-photo"
            :class="{ 'carousel-photo--active': index === activeIndex && loaded.has(index) }"
            @load="onLoad(index)"
          />
        </template>
      </a>

      <div class="overlay container">
        <div class="photo-meta">
          <p class="photo-caption">
            <span class="photo-date tabular">{{ formatShortDate(parseDate(activePhoto.date)) }}</span>
            <a :href="cdnFullImage(activePhoto.url)" target="_blank" rel="noopener">{{ activePhoto.caption }}</a>
          </p>
          <div class="photo-dots" role="group" aria-label="Choose photo">
            <button
              v-for="(_photo, index) in heroPhotos"
              :key="index"
              type="button"
              class="photo-dot"
              :class="{ 'photo-dot--active': index === activeIndex }"
              :aria-label="`Photo ${index + 1} of ${heroPhotos.length}`"
              :aria-current="index === activeIndex"
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
  touch-action: pan-y;
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

/* A .container, so it lines up with the page content below */
.overlay {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  padding-bottom: calc(var(--overlap) + var(--spacing-lg));
  pointer-events: none;
}

.photo-meta {
  display: flex;
  flex: 0 1 340px;
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
  .photo-meta {
    flex: 1;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--spacing-md);
    text-align: left;
  }
}
</style>
