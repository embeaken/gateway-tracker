<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  images,
  blueskyPosts,
  pressReleases,
  constructionNotices,
  youtubeVideos,
} from "../assets/activityData";

type TimelineItemType = "photo" | "bluesky" | "press" | "construction" | "video";

type TimelineItem = {
  id: string;
  type: TimelineItemType;
  date: Date;
  dateDisplay: string;
  title: string;
  content: string;
  imageUrl?: string;
  link?: string;
  videoId?: string;
};

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (dateStr: string): Date =>
  DATE_ONLY_RE.test(dateStr) ? new Date(`${dateStr}T12:00:00`) : new Date(dateStr);

const FEED_LIMIT = 100;
// Below the sidebar breakpoint the feed sits under the cameras, so keep it short.
const INITIAL_VISIBLE_ITEMS =
  typeof window !== "undefined" && window.matchMedia("(max-width: 1199px)").matches ? 10 : 30;
const PAGE_SIZE = 20;

const formatDate = (date: Date, includeTime = false): string => {
  const d = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100}`;
  if (!includeTime) return d;
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${h % 12 || 12}:${m}${h >= 12 ? "pm" : "am"}`;
};

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m}${h >= 12 ? "pm" : "am"}`;
};

const timelineItems = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = [];

  images.forEach((image) => {
    items.push({
      id: image.url,
      type: "photo",
      date: parseDate(image.date),
      dateDisplay: formatDate(parseDate(image.date)),
      title: image.caption,
      content: image.caption,
      imageUrl: image.url,
    });
  });

  blueskyPosts.forEach((post) => {
    items.push({
      id: post.link,
      type: "bluesky",
      date: parseDate(post.date),
      dateDisplay: formatDate(parseDate(post.date), true),
      title: post.text.substring(0, 60) + (post.text.length > 60 ? "..." : ""),
      content: post.text,
      link: post.link,
      imageUrl: post.imageUrl,
    });
  });

  pressReleases.forEach((press) => {
    items.push({
      id: press.link,
      type: "press",
      date: parseDate(press.date),
      dateDisplay: formatDate(parseDate(press.date)),
      title: press.title,
      content: "",
      link: press.link,
    });
  });

  constructionNotices.forEach((notice) => {
    items.push({
      id: notice.link,
      type: "construction",
      date: parseDate(notice.date),
      dateDisplay: formatDate(parseDate(notice.date)),
      title: notice.title,
      content: "",
      link: notice.link,
    });
  });

  youtubeVideos.forEach((video) => {
    items.push({
      id: video.videoId,
      type: "video",
      date: parseDate(video.date),
      dateDisplay: formatDate(parseDate(video.date)),
      title: video.title,
      content: video.description || "",
      videoId: video.videoId,
    });
  });

  return items.sort((a, b) => b.date.getTime() - a.date.getTime());
});

const visibleItemCount = ref(INITIAL_VISIBLE_ITEMS);

const recentItems = computed(() => timelineItems.value.slice(0, FEED_LIMIT));
const visibleItems = computed(() => recentItems.value.slice(0, visibleItemCount.value));
const hasMoreItems = computed(() => visibleItems.value.length < recentItems.value.length);

const showMoreItems = () => {
  visibleItemCount.value = Math.min(visibleItemCount.value + PAGE_SIZE, recentItems.value.length);
};

// --- Date grouping ---

// A block is either a single item or a run of consecutive same-day photos,
// which render as one mosaic instead of a wall of full-width images.
type Block =
  | { kind: "item"; key: string; item: TimelineItem }
  | { kind: "photos"; key: string; photos: TimelineItem[] };

type DateGroup = { dateKey: string; dateLabel: string; blocks: Block[] };

const MOSAIC_MAX = 5;

const toBlocks = (items: TimelineItem[]): Block[] => {
  const blocks: Block[] = [];
  for (const item of items) {
    const last = blocks[blocks.length - 1];
    if (item.type === "photo" && last?.kind === "photos") {
      last.photos.push(item);
    } else if (item.type === "photo" && last?.kind === "item" && last.item.type === "photo") {
      blocks[blocks.length - 1] = { kind: "photos", key: last.key, photos: [last.item, item] };
    } else {
      blocks.push({ kind: "item", key: item.id, item });
    }
  }
  return blocks;
};

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatGroupDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
// Note: groupedItems passes `key + 'T12:00:00'` (local noon) to formatGroupDate
// to prevent UTC midnight being parsed as the prior day in western timezones

const groupedItems = computed<DateGroup[]>(() => {
  const map = new Map<string, TimelineItem[]>();
  for (const item of visibleItems.value) {
    const key = getDateKey(item.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    dateKey: key,
    dateLabel: formatGroupDate(new Date(key + "T12:00:00")),
    blocks: toBlocks(items),
  }));
});

// --- Layout mode helpers ---

// Mode A: compact text strip — no image, just header + title + link
const isCompact = (item: TimelineItem) =>
  item.type === "press" ||
  item.type === "construction" ||
  (item.type === "bluesky" && !item.imageUrl);

// Mode B: full-width gallery photo
const isPhotoFull = (item: TimelineItem) => item.type === "photo";

// Mode C: side-thumbnail — bluesky with image
const isThumb = (item: TimelineItem) => item.type === "bluesky" && !!item.imageUrl;

// Mode D: full-width video embed (everything else)

const badgeLabel = (type: TimelineItemType): string =>
  (
    ({
      photo: "Photo",
      bluesky: "Bluesky",
      press: "Press release",
      construction: "Construction notice",
      video: "Video",
    }) satisfies Record<TimelineItemType, string>
  )[type];

// --- Image handling ---

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

// Lightbox can step through the photo set it was opened from.
const lightboxSet = ref<TimelineItem[]>([]);
const lightboxIndex = ref(0);
const selectedImage = computed(() => lightboxSet.value[lightboxIndex.value] ?? null);

const openImage = (item: TimelineItem, set: TimelineItem[] = [item]) => {
  if (item.type !== "photo" || !item.imageUrl) return;
  lightboxSet.value = set;
  lightboxIndex.value = Math.max(0, set.indexOf(item));
};

const closeImage = () => {
  lightboxSet.value = [];
};

const step = (delta: number) => {
  const n = lightboxSet.value.length;
  if (n > 1) lightboxIndex.value = (lightboxIndex.value + delta + n) % n;
};

const onKeydown = (e: KeyboardEvent) => {
  if (!selectedImage.value) return;
  if (e.key === "Escape") closeImage();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
};

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="activity-timeline">
    <!-- Header -->
    <div class="timeline-header">
      <h2 class="timeline-title">
        Updates from the <abbr class="tooltip" title="Gateway Development Commission">GDC</abbr>
      </h2>
      <p class="kicker">Photos · posts · press · notices</p>
    </div>

    <!-- Timeline feed grouped by date -->
    <div class="timeline">
      <section v-for="group in groupedItems" :key="group.dateKey" class="date-group">
        <h4 class="date-header">{{ group.dateLabel }}</h4>

        <div class="date-group-items">
          <template v-for="block in group.blocks" :key="block.key">
          <!-- Photo set: mosaic -->
          <article v-if="block.kind === 'photos'" class="timeline-item timeline-item-photo mosaic-item">
            <div class="compact-header">
              <span class="item-badge badge-photo">{{ block.photos.length }} photos</span>
            </div>
            <div class="mosaic" :class="`mosaic--${Math.min(block.photos.length, MOSAIC_MAX)}`">
              <button
                v-for="(photo, pi) in block.photos.slice(0, MOSAIC_MAX)"
                :key="photo.id"
                type="button"
                class="mosaic-tile"
                :aria-label="`Open photo: ${photo.title}`"
                @click="openImage(photo, block.photos)"
              >
                <img :src="transformImage(photo.imageUrl!, pi === 0 ? 800 : 400)" :alt="photo.title" loading="lazy" />
                <span
                  v-if="pi === MOSAIC_MAX - 1 && block.photos.length > MOSAIC_MAX"
                  class="mosaic-more"
                >+{{ block.photos.length - MOSAIC_MAX }}</span>
              </button>
            </div>
            <p class="photo-caption">{{ block.photos[0]!.content }}</p>
          </article>

          <article
            v-else
            class="timeline-item"
            :class="[
              `timeline-item-${block.item.type}`,
              isCompact(block.item) && 'timeline-item--compact',
              isPhotoFull(block.item) && 'timeline-item--photo-full',
              isThumb(block.item) && 'timeline-item--thumb',
              block.item.type === 'video' && 'timeline-item--video-card',
            ]"
          >
            <!-- Mode A: compact text strip (press, construction, bluesky w/o image) -->
            <template v-if="isCompact(block.item)">
              <div class="compact-header">
                <span class="item-badge" :class="`badge-${block.item.type}`">{{
                  badgeLabel(block.item.type)
                }}</span>
                <time v-if="block.item.type === 'bluesky'" class="item-time">{{
                  formatTime(block.item.date)
                }}</time>
              </div>
              <p class="compact-title">{{ block.item.type === "bluesky" ? block.item.content : block.item.title }}</p>
              <a v-if="block.item.link" :href="block.item.link" target="_blank" class="item-link">
                {{ block.item.type === "bluesky" ? "View on Bluesky →" : "Read the PDF →" }}
              </a>
            </template>

            <!-- Mode B: full-width gallery photo -->
            <template v-else-if="isPhotoFull(block.item)">
              <div class="photo-full" @click="openImage(block.item)">
                <img :src="transformImage(block.item.imageUrl!, 800)" :alt="block.item.title" loading="lazy" />
              </div>
              <p v-if="block.item.content" class="photo-caption">{{ block.item.content }}</p>
            </template>

            <!-- Mode C: bluesky with image (side thumbnail) -->
            <template v-else-if="isThumb(block.item)">
              <div class="thumb-layout">
                <a :href="block.item.link" target="_blank" class="thumb-image">
                  <img :src="block.item.imageUrl" :alt="block.item.title" loading="lazy" />
                </a>
                <div class="thumb-content">
                  <div class="compact-header">
                    <span class="item-badge badge-bluesky">Bluesky</span>
                    <time class="item-time">{{ formatTime(block.item.date) }}</time>
                  </div>
                  <p class="compact-caption">{{ block.item.content }}</p>
                  <a v-if="block.item.link" :href="block.item.link" target="_blank" class="item-link">View on Bluesky →</a>
                </div>
              </div>
            </template>

            <!-- Mode D: full-width video embed -->
            <template v-else>
              <div class="item-video">
                <iframe
                  :src="`https://www.youtube.com/embed/${block.item.videoId}`"
                  :title="block.item.title"
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                  "
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
              <div class="video-footer">
                <p class="compact-title">{{ block.item.title }}</p>
                <a
                  :href="`https://www.youtube.com/watch?v=${block.item.videoId}`"
                  target="_blank"
                  class="item-link"
                >
                  Watch on YouTube →
                </a>
              </div>
            </template>
          </article>
          </template>
        </div>
      </section>
    </div>

    <div v-if="hasMoreItems" class="timeline-footer">
      <button type="button" class="load-more-button" @click="showMoreItems">
        Show more updates
      </button>
    </div>

    <Teleport to="body">
      <!-- Lightbox -->
      <div v-if="selectedImage" class="lightbox" @click="closeImage">
        <div class="lightbox-content" @click.stop>
          <button type="button" class="close-button" aria-label="Close" @click="closeImage">×</button>
          <img :src="selectedImage.imageUrl" :alt="selectedImage.title" />
          <template v-if="lightboxSet.length > 1">
            <button type="button" class="nav-button nav-prev" aria-label="Previous photo" @click="step(-1)">‹</button>
            <button type="button" class="nav-button nav-next" aria-label="Next photo" @click="step(1)">›</button>
          </template>
          <div class="lightbox-caption">
            <p class="caption-date">
              {{ selectedImage.dateDisplay }}
              <span v-if="lightboxSet.length > 1"> · {{ lightboxIndex + 1 }} / {{ lightboxSet.length }}</span>
            </p>
            <p class="caption-text">{{ selectedImage.content }}</p>
          </div>
        </div>
      </div>
    </Teleport>
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
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: 12px;
}

.timeline-header {
  flex-direction: column;
  gap: 4px;
}

.timeline-title {
  font-size: 26px;
  line-height: 1.1;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.timeline-title .tooltip {
  text-decoration: underline dotted 2px;
  text-underline-offset: 3px;
  cursor: help;
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
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--color-text-secondary);
  margin: 0 0 8px 0;
}

.date-header::after {
  content: "";
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
  content-visibility: auto;
  contain-intrinsic-size: auto 180px;
  transition:
    box-shadow var(--transition-base),
    background var(--transition-base);
}

.timeline-item-photo {
  border-left-color: var(--color-text-secondary);
}
.timeline-item-bluesky {
  border-left-color: #0085ff;
}
.timeline-item-press {
  border-left-color: var(--color-primary);
}
.timeline-item-construction {
  border-left-color: var(--color-accent);
}
.timeline-item-video {
  border-left-color: #B42318;
}

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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  line-height: 1.5;
}

.badge-bluesky {
  color: #0085ff;
}
.badge-press {
  color: var(--color-primary);
}
.badge-construction {
  color: var(--color-accent-ink);
}
.badge-photo {
  color: var(--color-text-secondary);
}

/* =============================================
   Photo mosaic
   ============================================= */

.mosaic-item {
  padding: 11px 0 0 13px;
  background: transparent;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mosaic-item .photo-caption {
  padding: 0 0 4px;
}

.mosaic {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 40px;
  gap: 3px;
}

.mosaic-tile:first-child { grid-column: span 12; grid-row: span 5; }
.mosaic--2 .mosaic-tile { grid-column: span 6; grid-row: span 4; }
.mosaic--3 .mosaic-tile:not(:first-child) { grid-column: span 6; grid-row: span 2; }
.mosaic--4 .mosaic-tile:not(:first-child) { grid-column: span 4; grid-row: span 2; }
.mosaic--5 .mosaic-tile:not(:first-child) { grid-column: span 3; grid-row: span 2; }

.mosaic-tile {
  position: relative;
  padding: 0;
  border: 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-background-alt);
  cursor: zoom-in;
}

.mosaic-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--transition-slow), opacity var(--transition-base);
}

.mosaic-tile:hover img {
  transform: scale(1.04);
}

.mosaic-tile:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.mosaic-more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  font-family: var(--font-family-display);
  font-size: 24px;
  font-weight: var(--font-weight-bold);
}

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

.timeline-footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.load-more-button {
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.load-more-button:hover {
  color: var(--color-primary-dark);
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
}

.load-more-button:focus {
  outline: none;
}

.load-more-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* =============================================
   Lightbox
   ============================================= */

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

.close-button:hover,
.nav-button:hover {
  background: var(--color-lightbox-close-hover-bg);
}

.nav-button {
  position: absolute;
  top: 35vh;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--color-lightbox-close-bg);
  color: white;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  z-index: 1001;
}

.nav-prev { left: var(--spacing-sm); }
.nav-next { right: var(--spacing-sm); }

.lightbox-caption {
  padding: var(--spacing-md);
  background: var(--color-lightbox-bg);
}

.caption-date {
  font-family: var(--font-family-base);
  font-size: 12px;
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
