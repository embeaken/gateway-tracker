<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { images } from '../assets/activityData'
import { formatShortDate, parseDate } from '../dates'
import { cdnImage } from '../imageCdn'
import type { LightboxPhoto } from '../types'
import PhotoLightbox from './PhotoLightbox.vue'

// Every GDC photo, newest first, in a grid that scrolls inside the card; the
// newest is big. Each opens in the lightbox, which can step through the whole set.

const photos = computed<LightboxPhoto[]>(() =>
  [...images]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((img) => ({ url: img.url, caption: img.caption, dateDisplay: formatShortDate(parseDate(img.date)) })),
)

const openAt = ref<number | null>(null)

// Thumbnails load as they scroll into the grid. Native loading="lazy" doesn't
// help inside a scroll container (Chrome fetches all 100 at once), so watch
// the grid itself and only set `src` once a tile is near its visible area.
const grid = ref<HTMLElement | null>(null)
const loaded = ref(new Set<number>())
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!grid.value) return
  observer = new IntersectionObserver(
    (entries) => {
      const next = new Set(loaded.value)
      for (const e of entries) {
        if (!e.isIntersecting) continue
        next.add(Number((e.target as HTMLElement).dataset.index))
        observer?.unobserve(e.target)
      }
      loaded.value = next
    },
    { root: grid.value, rootMargin: '300px 0px' },
  )
  grid.value.querySelectorAll('li').forEach((li) => observer!.observe(li))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <ul ref="grid" class="gallery" tabindex="0" aria-label="Photos, newest first">
    <li v-for="(photo, i) in photos" :key="photo.url" :data-index="i" :class="i === 0 && 'gallery-lead'">
      <button type="button" class="gallery-tile img-hover" :aria-label="`Open photo: ${photo.caption}`" @click="openAt = i">
        <img v-if="loaded.has(i)" :src="cdnImage(photo.url, i === 0 ? 720 : 320)" :alt="photo.caption" />
      </button>
    </li>
  </ul>

  <PhotoLightbox v-if="openAt !== null" :photos="photos" :start-index="openAt" @close="openAt = null" />
</template>

<style scoped>
.gallery {
  max-height: 540px;
  overflow-y: auto;
  overscroll-behavior: contain;
  margin-right: -10px;
  padding-right: 10px;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  grid-auto-rows: 84px;
  grid-auto-flow: dense;
  gap: 6px;
}

.gallery-lead {
  grid-column: span 2;
  grid-row: span 2;
}

.gallery-tile {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-line);
  cursor: pointer;
}

.gallery-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-tile:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: -3px;
}

.gallery:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

</style>
