<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { cdnImage, cdnSrcset } from '../imageCdn'
import type { LightboxPhoto } from '../types'
import { useModal } from '../useModal'

// Full-size photo viewer that steps through the set it was opened from.

const props = defineProps<{ photos: LightboxPhoto[]; startIndex: number }>()
const emit = defineEmits<{ close: [] }>()

const index = ref(props.startIndex)
watch(
  () => [props.photos, props.startIndex] as const,
  ([, start]) => (index.value = start),
)
const photo = computed(() => props.photos[index.value] ?? null)

// The full photo can take a few seconds. Until then the stage takes the
// photo's shape from the small (usually cached) gallery thumbnail and shows
// it blurred, so the modal opens at its final size.
const thumb = (url: string) => cdnImage(url, 320)
const aspect = ref(3 / 2)
const loaded = ref(false)
watch(
  () => photo.value?.url,
  (url) => {
    loaded.value = false
    if (!url) return
    const img = new Image()
    img.onload = () => {
      if (photo.value?.url === url && img.naturalWidth) aspect.value = img.naturalWidth / img.naturalHeight
    }
    img.src = thumb(url)
  },
  { immediate: true },
)
const onLoad = (url: string) => {
  if (photo.value?.url === url) loaded.value = true
}

const close = () => emit('close')
const step = (delta: number) => {
  const n = props.photos.length
  if (n > 1) index.value = (index.value + delta + n) % n
}

const closeBtn = ref<HTMLButtonElement | null>(null)
useModal(() => !!photo.value, closeBtn, close)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="photo" class="modal-overlay" @click="close">
      <div class="lightbox-content" role="dialog" aria-modal="true" aria-label="Photo" @click.stop>
        <button ref="closeBtn" type="button" class="close-button" aria-label="Close" @click="close"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg></button>
        <div class="stage" :style="{ '--aspect': aspect }">
          <img class="placeholder" :class="{ loaded }" :src="thumb(photo.url)" alt="" aria-hidden="true" />
          <a class="full-link" :href="cdnImage(photo.url, 3840)" target="_blank" rel="noopener" aria-label="Open a larger version in a new tab">
            <img
              :key="photo.url"
              class="full"
              :class="{ loaded }"
              :src="cdnImage(photo.url, 1920)"
              :srcset="cdnSrcset(photo.url, [960, 1440, 1920, 2560])"
              sizes="90vw"
              :alt="photo.caption"
              @load="onLoad(photo.url)"
            />
          </a>
          <span v-if="!loaded" class="spinner" aria-hidden="true"></span>
          <template v-if="photos.length > 1">
            <button type="button" class="nav-button nav-prev" aria-label="Previous photo" @click="step(-1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg></button>
            <button type="button" class="nav-button nav-next" aria-label="Next photo" @click="step(1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg></button>
          </template>
        </div>
        <div class="lightbox-caption">
          <p class="caption-date">
            {{ photo.dateDisplay }}
            <span v-if="photos.length > 1"> · {{ index + 1 }} / {{ photos.length }}</span>
          </p>
          <p class="caption-text">{{ photo.caption }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-content {
  position: relative;
  /* The photo sets the width; the caption wraps to it */
  width: min-content;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--color-lightbox-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: default;
}

/* As wide as the photo is at 70vh tall, up to 90vw, so there are no side bars */
.stage {
  position: relative;
  width: min(90vw, 70vh * var(--aspect));
  aspect-ratio: var(--aspect);
  overflow: hidden;
}

.stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.full-link {
  position: absolute;
  inset: 0;
  cursor: zoom-in;
}

.placeholder {
  filter: blur(12px);
}

/* The blur spills past the photo's edges, so hide it once the photo has faded in */
.placeholder.loaded {
  opacity: 0;
  transition: opacity 0s 0.25s;
}

.full {
  opacity: 0;
  transition: opacity 0.25s ease;
}

.full.loaded {
  opacity: 1;
}

/* Shown only if loading takes a moment, so cached photos don't flicker */
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  animation:
    spin 0.7s linear infinite,
    appear 0.15s ease 0.15s forwards;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes appear {
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .full {
    transition: none;
  }
  .spinner {
    animation:
      spin 2s linear infinite,
      appear 0.15s ease 0.15s forwards;
  }
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
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--color-lightbox-close-bg);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.close-button svg,
.nav-button svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
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
</style>
