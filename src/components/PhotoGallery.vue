<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { images } from '../assets/activityData'
import { formatShortDate, parseDate } from '../dates'
import { cdnImage } from '../imageCdn'
import type { LightboxPhoto } from '../types'
import PhotoLightbox from './PhotoLightbox.vue'

// Every GDC photo, newest first; the newest is big. Each opens in the
// lightbox, which can step through the whole set.

const photos = computed<LightboxPhoto[]>(() =>
  [...images]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((img) => ({ url: img.url, caption: img.caption, dateDisplay: formatShortDate(parseDate(img.date)) })),
)

const openAt = ref<number | null>(null)

// Wide screens: every photo, in a grid that scrolls inside the card. Narrower,
// where the page is one column, a scroll box inside the scrolling page traps
// touch scrolling, so the grid grows with the page and pages with a button.
const NARROW = '(max-width: 1199px)'
const INITIAL = 15
const PAGE_SIZE = 24

const narrowQuery = window.matchMedia(NARROW)
const narrow = ref(narrowQuery.matches)
const onNarrowChange = (e: MediaQueryListEvent) => (narrow.value = e.matches)
const count = ref(INITIAL)
const visible = computed(() => (narrow.value ? photos.value.slice(0, count.value) : photos.value))

// Thumbnails load as they come near view. Native loading="lazy" doesn't help
// inside a scroll container (Chrome fetches all 100 at once), so watch tiles
// with an IntersectionObserver: rooted on the grid when it scrolls, on the
// viewport when it doesn't.
const grid = ref<HTMLElement | null>(null)
const loaded = ref(new Set<number>())
/** Thumbnails that have finished downloading: they fade in over the grey tile */
const ready = ref(new Set<string>())
const onReady = (url: string) => (ready.value = new Set(ready.value).add(url))
let observer: IntersectionObserver | undefined

const makeObserver = () => {
  observer?.disconnect()
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
    { root: narrow.value ? null : grid.value, rootMargin: '300px 0px' },
  )
  grid.value?.querySelectorAll('li').forEach((li) => {
    if (!loaded.value.has(Number(li.dataset.index))) observer!.observe(li)
  })
}

/** Function ref: observe tiles as they render (including after "Show more"). */
const observe = (el: unknown) => {
  if (el instanceof HTMLElement && !loaded.value.has(Number(el.dataset.index))) observer?.observe(el)
}

onMounted(() => {
  makeObserver()
  narrowQuery.addEventListener('change', onNarrowChange)
})
watch(narrow, () => nextTick(makeObserver))
onBeforeUnmount(() => {
  observer?.disconnect()
  narrowQuery.removeEventListener('change', onNarrowChange)
})
</script>

<template>
  <ul ref="grid" class="gallery" :tabindex="narrow ? undefined : 0" aria-label="Photos, newest first">
    <li
      v-for="(photo, i) in visible"
      :key="photo.url"
      :ref="observe"
      :data-index="i"
      :class="i === 0 && 'gallery-lead'"
    >
      <button type="button" class="gallery-tile img-hover" :aria-label="`Open photo: ${photo.caption}`" @click="openAt = i">
        <img
          v-if="loaded.has(i)"
          :class="{ ready: ready.has(photo.url) }"
          :src="cdnImage(photo.url, i === 0 ? 720 : 320)"
          :alt="photo.caption"
          @load="onReady(photo.url)"
          @error="onReady(photo.url)"
        />
      </button>
    </li>
  </ul>
  <button v-if="visible.length < photos.length" type="button" class="show-more gallery-more" @click="count += PAGE_SIZE">
    Show more photos
  </button>

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

@media (max-width: 1199px) {
  .gallery {
    max-height: none;
    overflow-y: visible;
    margin-right: 0;
    padding-right: 0;
  }
}

.gallery-more {
  margin-top: 12px;
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
  /* Hidden until loaded, so the alt text doesn't flash in the empty tile */
  opacity: 0;
  transition: opacity 0.5s ease;
}

.gallery-tile img.ready {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .gallery-tile img {
    transition: none;
  }
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
