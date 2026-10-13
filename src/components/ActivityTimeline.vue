<script setup lang="ts">
import { ref, computed } from "vue";
import {
  blueskyPosts,
  pressReleases,
  constructionNotices,
  youtubeVideos,
} from "../assets/activityData";
import { formatShortDate, parseDate } from "../dates";

type TimelineItemType = "bluesky" | "press" | "construction" | "video";

type TimelineItem = {
  id: string;
  type: TimelineItemType;
  date: Date;
  title: string;
  content: string;
  imageUrl?: string;
  link?: string;
  videoId?: string;
};

const FEED_LIMIT = 100;
// Below the sidebar breakpoint the feed sits under the cameras, so start short.
const INITIAL_VISIBLE_ITEMS = window.matchMedia("(max-width: 1199px)").matches ? 10 : 30;
const PAGE_SIZE = 20;

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m}${h >= 12 ? "pm" : "am"}`;
};

const timelineItems = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = [];

  blueskyPosts.forEach((post) => {
    items.push({
      id: post.link,
      type: "bluesky",
      date: parseDate(post.date),
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

type DateGroup = { dateKey: string; dateLabel: string; items: TimelineItem[] };

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const groupedItems = computed<DateGroup[]>(() => {
  const map = new Map<string, TimelineItem[]>();
  for (const item of visibleItems.value) {
    const key = getDateKey(item.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    dateKey: key,
    dateLabel: formatShortDate(parseDate(key)),
    items,
  }));
});

// --- Layout mode helpers ---

// Mode A: compact text strip — no image, just header + title + link
const isCompact = (item: TimelineItem) =>
  item.type === "press" ||
  item.type === "construction" ||
  (item.type === "bluesky" && !item.imageUrl);

// Mode B: side-thumbnail — bluesky with image
const isThumb = (item: TimelineItem) => item.type === "bluesky" && !!item.imageUrl;

const badgeLabel = (type: TimelineItemType): string =>
  (
    ({
      bluesky: "Bluesky",
      press: "Press release",
      construction: "Construction notice",
      video: "Video",
    }) satisfies Record<TimelineItemType, string>
  )[type];

</script>

<template>
  <div class="activity-timeline">

    <!-- Timeline feed grouped by date -->
    <div class="timeline">
      <section v-for="group in groupedItems" :key="group.dateKey" class="date-group">
        <h4 class="date-header">{{ group.dateLabel }}</h4>

        <div class="date-group-items">
          <template v-for="item in group.items" :key="item.id">
          <article
            class="timeline-item"
            :class="[
              `timeline-item-${item.type}`,
              isCompact(item) && 'timeline-item--compact',
              isThumb(item) && 'timeline-item--thumb',
              item.type === 'video' && 'timeline-item--video-card',
            ]"
          >
            <!-- Mode A: compact text strip (press, construction, bluesky w/o image) -->
            <template v-if="isCompact(item)">
              <div class="compact-header">
                <span class="item-badge" :class="`badge-${item.type}`">{{
                  badgeLabel(item.type)
                }}</span>
                <time v-if="item.type === 'bluesky'" class="item-time">{{
                  formatTime(item.date)
                }}</time>
              </div>
              <p class="compact-title">{{ item.type === "bluesky" ? item.content : item.title }}</p>
              <a v-if="item.link" :href="item.link" target="_blank" class="item-link">
                {{ item.type === "bluesky" ? "View on Bluesky →" : "Read the PDF →" }}
              </a>
            </template>

            <!-- Mode B: bluesky with image (side thumbnail) -->
            <template v-else-if="isThumb(item)">
              <div class="thumb-layout">
                <div class="thumb-image">
                  <img :src="item.imageUrl" :alt="item.title" loading="lazy" />
                </div>
                <div class="thumb-content">
                  <div class="compact-header">
                    <span class="item-badge badge-bluesky">Bluesky</span>
                    <time class="item-time">{{ formatTime(item.date) }}</time>
                  </div>
                  <p class="compact-caption">{{ item.content }}</p>
                  <a v-if="item.link" :href="item.link" target="_blank" class="item-link">View on Bluesky →</a>
                </div>
              </div>
            </template>

            <!-- Mode C: full-width video embed -->
            <template v-else>
              <div class="item-video">
                <iframe
                  :src="`https://www.youtube.com/embed/${item.videoId}`"
                  :title="item.title"
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
                <p class="compact-title">{{ item.title }}</p>
                <a
                  :href="`https://www.youtube.com/watch?v=${item.videoId}`"
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
      <button type="button" class="show-more" @click="showMoreItems">
        Show more updates
      </button>
    </div>

  </div>
</template>

<style scoped>
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
  transition: background var(--transition-fast);
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

/* Whole-row links: the row's link stretches over the whole row */
.timeline-item--compact,
.timeline-item--thumb {
  position: relative;
}

.timeline-item--compact .item-link::after,
.timeline-item--thumb .item-link::after {
  content: "";
  position: absolute;
  inset: 0;
}

.timeline-item--compact:has(.item-link):hover,
.timeline-item--thumb:hover {
  background: var(--color-primary-muted);
}

.timeline-item--compact:hover .item-link,
.timeline-item--thumb:hover .item-link {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.timeline-item--thumb:hover .thumb-image img {
  filter: brightness(0.88);
}

/* =============================================
   Mode B — side-thumbnail (bluesky with image)
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
  display: block;
}

.thumb-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter var(--transition-base);
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

/* =============================================
   Mobile
   ============================================= */

@media (max-width: 768px) {
  .thumb-image {
    width: 72px;
    height: 54px;
  }
}
</style>
