<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { images } from "../assets/activityData";

const activePhotoIndex = ref(0);
let carouselTimer: number | undefined;

const parseDate = (date: string) => new Date(date);

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
            :src="transformImage(photo.url, 1200)"
            :alt="index === activePhotoIndex ? photo.caption : ''"
            :aria-hidden="index !== activePhotoIndex"
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
}

.overview-grid {
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.95fr) minmax(440px, 1.05fr);
  gap: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
  padding-top: calc(var(--spacing-xl) + 18px);
  padding-bottom: var(--spacing-xl);
}

.overview-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 620px;
  min-width: 0;
}

.overview h2 {
  max-width: 740px;
  margin: 0;
  color: var(--color-text-primary);
  font-size: 54px;
  line-height: 1;
  letter-spacing: 0;
}

.lede {
  max-width: 58ch;
  margin: var(--spacing-md) 0 0;
  color: var(--color-text-secondary);
  font-size: 19px;
  line-height: 1.65;
  text-wrap: pretty;
}

.proof-panel {
  min-width: 0;
}

.feature-photo {
  position: relative;
  display: block;
  height: clamp(330px, 24vw, 400px);
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
    font-size: 44px;
  }
}

@media (max-width: 820px) {
  .overview-grid {
    gap: var(--spacing-md);
    padding-top: calc(var(--spacing-lg) + 16px);
  }

  .overview h2 {
    font-size: 38px;
    line-height: 1;
  }

  .lede {
    font-size: 16px;
  }

}

@media (max-width: 560px) {
  .overview h2 {
    font-size: 32px;
  }

  .feature-photo {
    min-height: 300px;
  }
}
</style>
