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
        <button ref="closeBtn" type="button" class="close-button" aria-label="Close" @click="close">×</button>
        <img
          :src="cdnImage(photo.url, 1920)"
          :srcset="cdnSrcset(photo.url, [960, 1440, 1920, 2560])"
          sizes="90vw"
          :alt="photo.caption"
        />
        <template v-if="photos.length > 1">
          <button type="button" class="nav-button nav-prev" aria-label="Previous photo" @click="step(-1)">‹</button>
          <button type="button" class="nav-button nav-next" aria-label="Next photo" @click="step(1)">›</button>
        </template>
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
</style>
