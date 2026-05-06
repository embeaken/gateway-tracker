<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { images } from "../assets/activityData";

const emit = defineEmits<{ openContext: [] }>();
const activePhotoIndex = ref(0);
let carouselTimer: number | undefined;

const parseDate = (date: string) => new Date(date);

const formatDate = (date: string) =>
  parseDate(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const transformImage = (url: string, width: number) => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return url;
  }

  const params = new URLSearchParams({ url, w: width.toString(), fit: "cover", format: "webp" });
  return `/.netlify/images?${params.toString()}`;
};

const heroPhotos = computed(() =>
  [...images].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).slice(0, 5),
);

const activePhoto = computed(() => heroPhotos.value[activePhotoIndex.value]);

const activityHref = computed(() => {
  if (typeof window === "undefined") return "#activity";
  return window.matchMedia("(min-width: 1200px)").matches ? "#desktop-activity" : "#activity";
});

onMounted(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || heroPhotos.value.length <= 1) return;

  carouselTimer = window.setInterval(() => {
    activePhotoIndex.value = (activePhotoIndex.value + 1) % heroPhotos.value.length;
  }, 10000);
});

onUnmounted(() => {
  if (carouselTimer) window.clearInterval(carouselTimer);
});
</script>

<template>
  <section class="overview">
    <div class="container overview-grid">
      <div class="overview-copy">
        <h2>America is building a big new infrastructure project. Yes, really.</h2>
        <p class="lede">
          A new passenger rail tunnel is under construction between New York and New Jersey. This
          work will strengthen the busiest rail corridor in the US, create thousands of jobs, and
          maybe prove that not everything is terrible.
        </p>

        <div class="overview-actions" aria-label="Primary page sections">
          <button class="primary-link" @click="emit('openContext')">What's going on?</button>
          <a :href="activityHref" class="secondary-link">Browse latest updates</a>
        </div>

        <div class="metric-grid" aria-label="Project summary">
          <div class="metric">
            <span class="metric-value">5</span>
            <span class="metric-label">active construction sites</span>
          </div>
          <div class="metric">
            <span class="metric-value">95k</span>
            <span class="metric-label">construction jobs</span>
          </div>
          <div class="metric">
            <span class="metric-value">$19.6B</span>
            <span class="metric-label">economic activity</span>
          </div>
          <div class="metric">
            <span class="metric-value">2</span>
            <span class="metric-label">new rail tubes</span>
          </div>
        </div>
      </div>

      <div class="proof-panel">
        <a
          v-if="activePhoto"
          class="feature-photo"
          :href="activePhoto.url"
          target="_blank"
          rel="noopener"
        >
          <img
            v-for="(photo, index) in heroPhotos"
            :key="photo.url"
            :src="transformImage(photo.url, 980)"
            :alt="photo.caption"
            :loading="index === 0 ? 'eager' : 'lazy'"
            class="carousel-photo"
            :class="{ 'carousel-photo--active': index === activePhotoIndex }"
          />
          <span class="photo-caption">
            <strong>{{ formatDate(activePhoto.date) }}</strong>
            {{ activePhoto.caption }}
          </span>
          <span class="photo-dots" aria-hidden="true">
            <span
              v-for="(_photo, index) in heroPhotos"
              :key="index"
              class="photo-dot"
              :class="{ 'photo-dot--active': index === activePhotoIndex }"
            ></span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview {
  background:
    linear-gradient(180deg, rgba(0, 94, 113, 0.08), rgba(0, 94, 113, 0)), var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.overview-grid {
  display: grid;
  align-items: end;
  grid-template-columns: minmax(0, 0.95fr) minmax(440px, 1.05fr);
  gap: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
}

.overview-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.overview h2 {
  max-width: 740px;
  margin: 0;
  color: var(--color-text-primary);
  font-size: 58px;
  line-height: 1;
  letter-spacing: 0;
}

.lede {
  max-width: 680px;
  margin: var(--spacing-md) 0 0;
  color: var(--color-text-secondary);
  font-size: 18px;
  line-height: 1.55;
}

.overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--spacing-md);
}

.primary-link,
.secondary-link {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  font-family: inherit;
}

.primary-link {
  background: var(--color-primary);
  color: white;
  cursor: pointer;
}

.primary-link:visited {
  color: white;
}

.primary-link:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: white;
}

.secondary-link {
  background: var(--color-card-bg);
  color: var(--color-primary);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: var(--spacing-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-border);
}

.metric {
  min-width: 0;
  padding: 14px;
  background: var(--color-card-bg);
}

.metric-value,
.metric-label {
  display: block;
}

.metric-value {
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.metric-label {
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.25;
}

.proof-panel {
  min-width: 0;
}

.feature-photo {
  position: relative;
  display: block;
  height: clamp(390px, 29vw, 460px);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #000;
  color: white;
  box-shadow: var(--shadow-lg);
}

.carousel-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 2400ms ease;
}

.carousel-photo--active {
  opacity: 1;
}

.feature-photo::after {
  content: "";
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.76));
}

.photo-caption,
.photo-dots {
  position: absolute;
  z-index: 1;
}

.photo-caption {
  left: 14px;
  right: 14px;
  bottom: 14px;
  color: white;
  font-size: 15px;
  line-height: 1.35;
}

.photo-caption strong {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.photo-dots {
  display: flex;
  right: 14px;
  bottom: 16px;
  gap: 5px;
}

.photo-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
}

.photo-dot--active {
  background: white;
}

@media (max-width: 1349px) {
  .overview-grid {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .overview-copy {
    justify-content: center;
  }

  .feature-photo {
    aspect-ratio: auto;
    min-height: 380px;
  }

  .overview h2 {
    font-size: 48px;
  }
}

@media (max-width: 820px) {
  .overview-grid {
    gap: var(--spacing-md);
    padding-top: var(--spacing-lg);
  }

  .overview h2 {
    font-size: 40px;
    line-height: 1;
  }

  .lede {
    font-size: 16px;
  }

  .metric-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .overview h2 {
    font-size: 34px;
  }

  .overview-actions {
    flex-direction: column;
  }

  .primary-link,
  .secondary-link {
    justify-content: center;
    width: 100%;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .feature-photo {
    min-height: 300px;
  }
}
</style>
