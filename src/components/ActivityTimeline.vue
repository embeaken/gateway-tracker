<script setup lang="ts">
import { ref, computed } from 'vue'
import { images, blueskyPosts, pressReleases, constructionNotices, youtubeVideos } from '../assets/activityData'

type TimelineItemType = 'photo' | 'bluesky' | 'press' | 'construction' | 'video'

type TimelineItem = {
  type: TimelineItemType
  date: Date
  dateDisplay: string
  title: string
  content: string
  imageUrl?: string
  link?: string
  videoId?: string
}

const parseDate = (dateStr: string): Date => new Date(dateStr)

const formatDate = (date: Date, includeTime = false): string => {
  const d = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100}`
  if (!includeTime) return d
  const h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${d} ${h % 12 || 12}:${m}${h >= 12 ? 'pm' : 'am'}`
}

const formatTime = (date: Date): string => {
  const h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h % 12 || 12}:${m}${h >= 12 ? 'pm' : 'am'}`
}

const timelineItems = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = []

  images.forEach(image => {
    items.push({
      type: 'photo',
      date: parseDate(image.date),
      dateDisplay: formatDate(parseDate(image.date)),
      title: image.caption,
      content: image.caption,
      imageUrl: image.url
    })
  })

  blueskyPosts.forEach(post => {
    items.push({
      type: 'bluesky',
      date: parseDate(post.date),
      dateDisplay: formatDate(parseDate(post.date), true),
      title: post.text.substring(0, 60) + (post.text.length > 60 ? '...' : ''),
      content: post.text,
      link: post.link,
      imageUrl: post.imageUrl
    })
  })

  pressReleases.forEach(press => {
    items.push({
      type: 'press',
      date: parseDate(press.date),
      dateDisplay: formatDate(parseDate(press.date)),
      title: press.title,
      content: '',
      link: press.link
    })
  })

  constructionNotices.forEach(notice => {
    items.push({
      type: 'construction',
      date: parseDate(notice.date),
      dateDisplay: formatDate(parseDate(notice.date)),
      title: notice.title,
      content: '',
      link: notice.link
    })
  })

  youtubeVideos.forEach(video => {
    items.push({
      type: 'video',
      date: parseDate(video.date),
      dateDisplay: formatDate(parseDate(video.date)),
      title: video.title,
      content: video.description || '',
      videoId: video.videoId
    })
  })

  return items.sort((a, b) => b.date.getTime() - a.date.getTime())
})

// --- Filtering ---

type FilterValue = 'all' | TimelineItemType

const activeFilter = ref<FilterValue>('all')

const filterTabs: { value: FilterValue; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'photo',        label: 'Photos' },
  { value: 'press',        label: 'Press' },
  { value: 'construction', label: 'Notices' },
  { value: 'bluesky',      label: 'Bluesky' },
  { value: 'video',        label: 'Video' },
]

const filteredItems = computed(() =>
  activeFilter.value === 'all'
    ? timelineItems.value
    : timelineItems.value.filter(item => item.type === activeFilter.value)
)

// --- Date grouping ---

type DateGroup = { dateKey: string; dateLabel: string; items: TimelineItem[] }

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const formatGroupDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
// Note: groupedItems passes `key + 'T12:00:00'` (local noon) to formatGroupDate
// to prevent UTC midnight being parsed as the prior day in western timezones

const groupedItems = computed<DateGroup[]>(() => {
  const map = new Map<string, TimelineItem[]>()
  for (const item of filteredItems.value) {
    const key = getDateKey(item.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    dateKey: key,
    dateLabel: formatGroupDate(new Date(key + 'T12:00:00')),
    items,
  }))
})

// --- Layout mode helpers ---

// Mode A: compact text strip — no image, just header + title + link
const isCompact = (item: TimelineItem) =>
  item.type === 'press' ||
  item.type === 'construction' ||
  (item.type === 'bluesky' && !item.imageUrl)

// Mode B: full-width gallery photo
const isPhotoFull = (item: TimelineItem) => item.type === 'photo'

// Mode C: side-thumbnail — bluesky with image
const isThumb = (item: TimelineItem) => item.type === 'bluesky' && !!item.imageUrl

// Mode D: full-width video embed (everything else)

const badgeLabel = (type: TimelineItemType): string => ({
  photo: 'Photo', bluesky: 'Bluesky',
  press: 'Press', construction: 'Notice', video: 'Video',
} satisfies Record<TimelineItemType, string>)[type]

// --- Image handling ---

const transformImage = (url: string, width: number) => {
  const params = new URLSearchParams({ url, w: width.toString(), fit: 'contain', format: 'webp' })
  return `/.netlify/images?${params.toString()}`
}

const selectedImage = ref<TimelineItem | null>(null)

const openImage = (item: TimelineItem) => {
  if (item.type === 'photo' && item.imageUrl) selectedImage.value = item
}

const closeImage = () => { selectedImage.value = null }
</script>

<template>
  <div class="activity-timeline">

    <!-- Header: title + live count -->
    <div class="timeline-header">
      <h3 class="timeline-title">
        Updates from the <span class="tooltip" title="Gateway Development Commission">GDC</span>
      </h3>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs" role="tablist">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ 'filter-tab--active': activeFilter === tab.value }"
        role="tab"
        :aria-selected="activeFilter === tab.value"
        @click="activeFilter = tab.value"
      >{{ tab.label }}</button>
    </div>

    <!-- Timeline feed grouped by date -->
    <div class="timeline">
      <section v-for="group in groupedItems" :key="group.dateKey" class="date-group">

        <h4 class="date-header">{{ group.dateLabel }}</h4>

        <div class="date-group-items">
          <article
            v-for="(item, index) in group.items"
            :key="index"
            class="timeline-item"
            :class="[
              `timeline-item-${item.type}`,
              isCompact(item)   && 'timeline-item--compact',
              isPhotoFull(item) && 'timeline-item--photo-full',
              isThumb(item)     && 'timeline-item--thumb',
              item.type === 'video' && 'timeline-item--video-card',
            ]"
          >

            <!-- Mode A: compact text strip (press, construction, bluesky w/o image) -->
            <template v-if="isCompact(item)">
              <div class="compact-header">
                <span class="item-badge" :class="`badge-${item.type}`">{{ badgeLabel(item.type) }}</span>
                <time v-if="item.type === 'bluesky'" class="item-time">{{ formatTime(item.date) }}</time>
              </div>
              <p class="compact-title">{{ item.type === 'bluesky' ? item.content : item.title }}</p>
              <a v-if="item.link" :href="item.link" target="_blank" class="item-link">
                {{ item.type === 'bluesky' ? 'View on Bluesky →' : 'View →' }}
              </a>
            </template>

            <!-- Mode B: full-width gallery photo -->
            <template v-else-if="isPhotoFull(item)">
              <div class="photo-full" @click="openImage(item)">
                <img :src="transformImage(item.imageUrl!, 800)" :alt="item.title" loading="lazy" />
              </div>
              <p v-if="item.content" class="photo-caption">{{ item.content }}</p>
            </template>

            <!-- Mode C: bluesky with image (side thumbnail) -->
            <template v-else-if="isThumb(item)">
              <div class="thumb-layout">
                <a :href="item.link" target="_blank" class="thumb-image">
                  <img :src="item.imageUrl" :alt="item.title" loading="lazy" />
                </a>
                <div class="thumb-content">
                  <div class="compact-header">
                    <span class="item-badge badge-bluesky">Bluesky</span>
                    <time class="item-time">{{ formatTime(item.date) }}</time>
                  </div>
                  <p class="compact-caption">{{ item.content }}</p>
                  <a v-if="item.link" :href="item.link" target="_blank" class="item-link">View →</a>
                </div>
              </div>
            </template>

            <!-- Mode D: full-width video embed -->
            <template v-else>
              <div class="item-video">
                <iframe
                  :src="`https://www.youtube.com/embed/${item.videoId}`"
                  :title="item.title"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
              <div class="video-footer">
                <p class="compact-title">{{ item.title }}</p>
                <a :href="`https://www.youtube.com/watch?v=${item.videoId}`" target="_blank" class="item-link">
                  Watch on YouTube →
                </a>
              </div>
            </template>

          </article>
        </div>

      </section>
    </div>

    <!-- Lightbox -->
    <div v-if="selectedImage" class="lightbox" @click="closeImage">
      <div class="lightbox-content" @click.stop>
        <button class="close-button" @click="closeImage">×</button>
        <img :src="selectedImage.imageUrl" :alt="selectedImage.title" />
        <div class="lightbox-caption">
          <p class="caption-date">{{ selectedImage.dateDisplay }}</p>
          <p class="caption-text">{{ selectedImage.content }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* =============================================
   Container
   ============================================= */

.activity-timeline {
  width: 100%;
}

/* =============================================
   Header
   ============================================= */

.timeline-header {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-bottom: 10px;
}

.timeline-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.timeline-title .tooltip {
  text-decoration: underline dotted;
  cursor: help;
}

/* =============================================
   Filter tabs
   ============================================= */

.filter-tabs {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.filter-tab {
  font-family: inherit;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 3px 8px;
  line-height: 1.6;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-muted);
}

.filter-tab--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.filter-tab--active:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: white;
}

/* =============================================
   Timeline list
   ============================================= */

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-group {
  display: flex;
  flex-direction: column;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--color-text-secondary);
  margin: 0 0 8px 0;
}

.date-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.date-group-items {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

/* Base item: all items share these; type classes set left border color */
.timeline-item {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-left-width: 3px;
  border-radius: var(--radius-md);
  transition: box-shadow var(--transition-base), background var(--transition-base);
}

.timeline-item-photo        { border-left-color: var(--color-primary); }
.timeline-item-bluesky      { border-left-color: #0085ff; }
.timeline-item-press        { border-left-color: #b8900a; }
.timeline-item-construction { border-left-color: #ea580c; }
.timeline-item-video        { border-left-color: #cc0000; }

/* =============================================
   Mode A — compact text strip
   (press, construction, bluesky w/o image)
   ============================================= */

.timeline-item--compact {
  padding: 11px 13px;
  background: transparent;
  /* only keep left border */
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: none;
}

.timeline-item--compact:hover {
  background: var(--color-primary-muted);
  box-shadow: none;
}

/* =============================================
   Mode B — full-width gallery photo
   ============================================= */

.timeline-item--photo-full {
  background: transparent;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-radius: 0;
  padding: 0 0 0 8px;
  box-shadow: none;
  overflow: hidden;
}

.timeline-item--photo-full:hover {
  box-shadow: none;
}


.photo-full {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  cursor: pointer;
}

.photo-full img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity var(--transition-base);
}

.photo-full:hover img {
  opacity: 0.88;
}

.photo-caption {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0;
  padding: 7px 13px 11px;
}

/* =============================================
   Mode C — side-thumbnail (bluesky with image)
   ============================================= */

.timeline-item--thumb {
  padding: 11px 13px;
  background: transparent;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-radius: 0;
  box-shadow: none;
}

.timeline-item--thumb:hover {
  background: var(--color-primary-muted);
  box-shadow: none;
}

.thumb-layout {
  display: flex;
  gap: 10px;
  align-items: center;
}

.thumb-image {
  width: 96px;
  height: 72px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  display: block;
}

.thumb-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity var(--transition-base);
}

.thumb-image:hover img {
  opacity: 0.82;
}

.thumb-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* =============================================
   Mode C — video card (full embed)
   ============================================= */

.timeline-item--video-card {
  padding: 11px 13px;
  background: transparent;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: none;
}

.timeline-item--video-card:hover {
  background: var(--color-primary-muted);
  box-shadow: none;
}

.item-video {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #000;
}

.item-video iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
}

.video-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* =============================================
   Shared content elements
   ============================================= */

.compact-header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.item-badge {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  flex-shrink: 0;
  line-height: 1.5;
}

.badge-bluesky      { color: #0085ff; }
.badge-press        { color: var(--color-badge-press); }
.badge-construction { color: #ea580c; }


.item-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.compact-title {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.compact-caption {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-link {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  align-self: flex-start;
  flex-shrink: 0;
}

/* =============================================
   Lightbox
   ============================================= */

.lightbox {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--color-lightbox-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--color-lightbox-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: default;
}

.lightbox-content img {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

.close-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 40px;
  height: 40px;
  background: var(--color-lightbox-close-bg);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-base);
  z-index: 1001;
}

.close-button:hover {
  background: var(--color-lightbox-close-hover-bg);
}

.lightbox-caption {
  padding: var(--spacing-md);
  background: var(--color-lightbox-bg);
}

.caption-date {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
}

.caption-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* =============================================
   Mobile
   ============================================= */

@media (max-width: 768px) {
  .timeline-title {
    font-size: var(--font-size-base);
  }

  .thumb-image {
    width: 72px;
    height: 54px;
  }
}
</style>
