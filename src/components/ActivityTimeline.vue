<script setup lang="ts">
import { ref, computed } from 'vue'
import { images, blueskyPosts, pressReleases } from '../assets/activityData'

type TimelineItemType = 'photo' | 'tweet' | 'bluesky' | 'press'

type TimelineItem = {
  type: TimelineItemType
  date: Date
  dateDisplay: string
  title: string
  content: string
  imageUrl?: string
  link?: string
}

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr)
}

const formatDate = (date: Date, includeTime = false): string => {
  const d = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100}`
  if (!includeTime) return d
  const h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${d} ${h % 12 || 12}:${m}${h >= 12 ? 'pm' : 'am'}`
}

// Create unified timeline from all sources
const timelineItems = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = []

  // Add photos
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

  // Add Bluesky posts
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

  // Add press releases
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

  // Sort by date (most recent first)
  return items.sort((a, b) => b.date.getTime() - a.date.getTime())
})

// Transform image URL using weserv.nl CDN
const transformImage = (url: string, width: number) => {
  const params = new URLSearchParams({
    url: url,
    w: width.toString(),
    fit: 'cover',
    output: 'webp'
  })
  return `https://images.weserv.nl/?${params.toString()}`
}

const selectedImage = ref<TimelineItem | null>(null)

const openImage = (item: TimelineItem) => {
  if (item.type === 'photo' && item.imageUrl) {
    selectedImage.value = item
  }
}

const closeImage = () => {
  selectedImage.value = null
}
</script>

<template>
  <div class="activity-timeline">
    <h3 class="timeline-title">Updates from the <span class="tooltip" title="Gateway Development Commission">GDC</span></h3>

    <div class="timeline">
      <article
        v-for="(item, index) in timelineItems"
        :key="index"
        class="timeline-item"
        :class="`timeline-item-${item.type}`"
      >
        <div class="item-content">
          <!-- Header with type badge and date -->
          <div class="item-header">
            <span class="item-badge" :class="`badge-${item.type}`">
              {{ item.type === 'photo' ? 'Photo' : item.type === 'bluesky' ? 'Bluesky' : item.type === 'tweet' ? 'X Post' : 'Press Release' }}
            </span>
            <time class="item-date">{{ item.dateDisplay }}</time>
          </div>

          <!-- Image thumbnail -->
          <div v-if="item.type === 'photo' && item.imageUrl" class="item-photo" @click="openImage(item)">
            <img :src="transformImage(item.imageUrl, 400)" :alt="item.title" loading="lazy" />
          </div>
          <a v-else-if="item.type === 'bluesky' && item.imageUrl" :href="item.link" target="_blank" class="item-photo">
            <img :src="item.imageUrl" :alt="item.title" loading="lazy" />
          </a>

          <!-- Content based on type -->
          <div v-if="item.type === 'photo'" class="item-body">
            <p class="item-caption">{{ item.content }}</p>
          </div>
          <div v-else-if="item.type === 'bluesky'" class="item-body">
            <p class="item-text">{{ item.content }}</p>
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              class="item-link"
            >
              View on Bluesky →
            </a>
          </div>
          <div v-else-if="item.type === 'tweet'" class="item-body">
            <p class="item-text">{{ item.content }}</p>
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              class="item-link"
            >
              View on X →
            </a>
          </div>
          <div v-else class="item-body">
            <h4 class="item-title">{{ item.title }}</h4>
            <p class="item-text">{{ item.content }}</p>
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              class="item-link"
            >
              View →
            </a>
          </div>
        </div>
      </article>
    </div>

    <!-- Image lightbox -->
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
.activity-timeline {
  width: 100%;
}

.timeline-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 16px 0;

  .tooltip {
    text-decoration: underline dotted;
  }
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.timeline-item {
  padding: var(--spacing-md);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: box-shadow var(--transition-base);
}

.timeline-item:hover {
  box-shadow: var(--shadow-md);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.item-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 3px;
}

.badge-photo {
  background: rgba(0, 94, 113, 0.1);
  color: var(--color-primary);
}

.badge-tweet {
  background: rgba(29, 155, 240, 0.1);
  color: #1d9bf0;
}

.badge-bluesky {
  background: rgba(0, 133, 255, 0.1);
  color: #0085ff;
}

.badge-press {
  background: rgba(255, 215, 0, 0.2);
  color: #b8900a;
}

.item-date {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.item-photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: opacity var(--transition-base);
  margin: var(--spacing-xs) 0;
}

.item-photo:hover {
  opacity: 0.9;
}

.item-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.item-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.item-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin: 0;
}

.item-caption {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
  margin: 0;
}

.item-link {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  align-self: flex-start;
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
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
  background: white;
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
  background: rgba(0, 0, 0, 0.5);
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
  background: rgba(0, 0, 0, 0.8);
}

.lightbox-caption {
  padding: var(--spacing-md);
  background: white;
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

@media (max-width: 768px) {
  .timeline-title {
    font-size: var(--font-size-base);
  }

  .timeline-item {
    padding: var(--spacing-sm);
  }

  .item-badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .item-date {
    font-size: 11px;
  }

  .item-title {
    font-size: 13px;
  }

  .item-text {
    font-size: 14px;
  }
}
</style>
