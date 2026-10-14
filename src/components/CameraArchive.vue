<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { addDays, daysBetween, formatLongDate, formatNyTime, nyDate, nyMinutes, parseDate } from '../dates'
import type { CamArchiveResponse, CamFrame, CamPano, CamPanoramasResponse, CamView } from '../earthcam'
import { cdnSiteImage } from '../imageCdn'
import type { Project } from '../types'

// One site's archive: pick a view, then scrub through its days and the times
// within them on a single slider, or pick one
// of its panoramas (dated, not timed). Frames come from /api/cam-archive and
// /api/cam-panoramas (see src/earthcam.ts). Nothing is fetched until
// the card is near the screen, since the page has a card for every site.

const props = defineProps<{
  project: Project
  views: CamView[]
  panoramas: CamPano[]
  /** New York "today" (YYYY-MM-DD) */
  today: string
  /** /api/cams failed, so there are no views to show */
  failed: boolean
}>()

const root = ref<HTMLElement | null>(null)
const near = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting) return
      near.value = true
      observer?.disconnect()
    },
    { rootMargin: '600px 0px' },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

// --- View and day ---
const viewNo = ref((props.project.featuredView ?? 0) + 1)
const view = computed(() => props.views[viewNo.value - 1] ?? props.views[0])
const first = computed(() => (view.value ? nyDate(new Date(view.value.since)) : props.today))
const date = ref(props.today)
const dayCount = computed(() => daysBetween(first.value, props.today))
const dayIndex = computed(() => daysBetween(first.value, date.value))

const setDate = (d: string) => {
  if (d >= first.value && d <= props.today) date.value = d
}
const pickView = (n: number) => {
  panoKey.value = null
  viewNo.value = n
  date.value = props.today
  targetMin.value = null
  resetZoom()
}

// --- Panoramas ---
const panoKey = ref<string | null>(null)
const keyOf = (p: CamPano) => p.camera
const pano = computed(() => props.panoramas.find((p) => keyOf(p) === panoKey.value))
const panoTabs = computed(() =>
  props.panoramas.map((p, i) => ({ key: keyOf(p), label: props.panoramas.length > 1 ? `Panorama ${i + 1}` : 'Panorama' })),
)
const pickPano = (key: string) => {
  panoKey.value = key
  resetZoom()
}
// Another view may start later than the day being shown
watch(first, (f) => date.value < f && (date.value = f))

// --- Frames for the chosen day ---
const cache = new Map<string, CamFrame[]>()
const frames = ref<CamFrame[]>([])
const loading = ref(false)
const error = ref(false)

// The day to show, as a string, so the 5-minute refresh of /api/cams (new
// objects, same view) doesn't reload the day or move the time slider.
const dayKey = computed(() =>
  near.value && view.value && !pano.value ? `${view.value.camera}/${view.value.ref}/${date.value}` : '',
)

watch(
  dayKey,
  async (key) => {
    const v = view.value
    if (!key || !v) return
    const hit = cache.get(key)
    if (hit) {
      frames.value = hit
      error.value = false
      return
    }
    loading.value = true
    try {
      const url = `/api/cam-archive/${props.project.id}/${v.camera}?${new URLSearchParams({ ref: v.ref, kind: 'day', date: date.value })}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const list = ((await res.json()) as CamArchiveResponse).frames
      // Ignore a slow response for a day the visitor has already left
      if (dayKey.value !== key) return
      // Today's list keeps growing, so it isn't kept
      if (date.value !== props.today) cache.set(key, list)
      frames.value = list
      error.value = false
    } catch {
      if (dayKey.value === key) {
        frames.value = []
        error.value = true
      }
    } finally {
      if (dayKey.value === key) loading.value = false
    }
  },
  { immediate: true },
)

// Every capture of the chosen panorama, oldest first. A series is fetched once.
const panoCache = new Map<string, CamFrame[]>()
const panoLoadKey = computed(() => (near.value && pano.value ? keyOf(pano.value) : ''))

watch(
  panoLoadKey,
  async (key) => {
    const p = pano.value
    if (!key || !p) return
    const hit = panoCache.get(key)
    if (hit) {
      frames.value = hit
      error.value = false
      return
    }
    loading.value = true
    try {
      const q = new URLSearchParams({ since: nyDate(new Date(p.since)) })
      const res = await fetch(`/api/cam-panoramas/${props.project.id}/${p.camera}?${q}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const list = ((await res.json()) as CamPanoramasResponse).captures
      panoCache.set(key, list)
      if (panoLoadKey.value !== key) return
      frames.value = list
      error.value = false
    } catch {
      if (panoLoadKey.value === key) {
        frames.value = []
        error.value = true
      }
    } finally {
      if (panoLoadKey.value === key) loading.value = false
    }
  },
)

// --- Time within the day (or which capture of a panorama) ---
const index = ref(0)
const frame = computed(() => frames.value[index.value])
/**
 * The time of day (minutes) to show on every day: it stays put as the day
 * changes, so the same moment can be compared across days. Null means "the
 * latest photo of the day".
 */
const targetMin = ref<number | null>(null)
/** Set by stepping past the end of a day: which photo to land on in the next one */
let landOn: 'first' | 'last' | null = null

const nearest = (list: CamFrame[], min: number) =>
  list.reduce((best, f, i) => (Math.abs(nyMinutes(f.takenAt) - min) < Math.abs(nyMinutes(list[best]!.takenAt) - min) ? i : best), 0)

watch(frames, (list) => {
  const last = Math.max(0, list.length - 1)
  if (pano.value || !list.length) index.value = last
  else if (landOn) index.value = landOn === 'first' ? 0 : last
  else index.value = targetMin.value === null ? last : nearest(list, targetMin.value)
  if (landOn && list.length) targetMin.value = nyMinutes(list[index.value]!.takenAt)
  landOn = null
})

// --- Crossfade ---
// A new photo is fetched in the background and only shown once it has loaded,
// fading in over the old one, so scrubbing never flashes or shows a blank. It's
// fetched at the size the current zoom will display, or the visible image would
// still have to load after the swap.
const WIDTH = window.matchMedia('(max-width: 768px)').matches ? 960 : 1440
// Zoomed in, larger originals are fetched. EarthCam serves stills at 1440
// (medium), 1920 (half) and 3840 (full, the original: there is nothing above
// it), so the size steps up as the photo is enlarged past what each can fill.
// Panoramas are far wider: their "half" size is ~11,000px.
const src = (f: CamFrame, zoomLevel: number, isPano: boolean) => {
  if (isPano) return cdnSiteImage(`${f.frame}?size=half`, zoomLevel > 1 ? 6000 : 2560)
  if (zoomLevel <= 1) return cdnSiteImage(f.frame, WIDTH)
  const onScreen = (stage.value?.clientWidth ?? 0) * zoomLevel
  return onScreen <= 1920 ? cdnSiteImage(`${f.frame}?size=half`, 1920) : cdnSiteImage(`${f.frame}?size=full`, 3840)
}
/** What's on screen. `pano` is kept so it still renders right while a switch to the other kind fades in. */
const shown = ref<{ f: CamFrame; pano: boolean } | null>(null)
/** The stage's shape: 16:9 for stills, the photo's own for panoramas */
const aspect = ref(16 / 9)

watch(frame, async (f) => {
  if (!f) {
    shown.value = null
    return
  }
  const isPano = !!pano.value
  const img = new Image()
  img.src = src(f, zoom.value, isPano)
  try {
    await img.decode()
  } catch {
    // Show it anyway: the <img> will surface a broken image rather than hang
  }
  if (frame.value !== f) return
  aspect.value = isPano && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 16 / 9
  shown.value = { f, pano: isPano }
  // Warm the neighbours so stepping either way is instant
  for (const n of [frames.value[index.value + 1], frames.value[index.value - 1]]) {
    if (n) new Image().src = src(n, zoom.value, isPano)
  }
})

// --- Zoom and pan ---
// Wheel / trackpad scroll / pinch zoom around the pointer, drag pans, and a
// double click or double tap resets. The zoom stays while scrubbing, so two
// moments can be compared at the same spot.
const maxZoom = () => (shown.value?.pano ? 12 : 6)
const resetHint = window.matchMedia('(pointer: coarse)').matches ? 'double-tap' : 'double-click'
const stage = ref<HTMLElement | null>(null)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const dragging = ref(false)

/** Keep the photo covering the stage */
const clampPan = (x: number, y: number) => {
  const w = stage.value?.clientWidth ?? 0
  const h = stage.value?.clientHeight ?? 0
  return { x: Math.min(0, Math.max(w * (1 - zoom.value), x)), y: Math.min(0, Math.max(h * (1 - zoom.value), y)) }
}

/** Zoom by `factor`, keeping the point (cx, cy) in the stage where it is */
function zoomAt(factor: number, cx: number, cy: number) {
  const next = Math.min(maxZoom(), Math.max(1, zoom.value * factor))
  const ratio = next / zoom.value
  const x = cx - (cx - pan.value.x) * ratio
  const y = cy - (cy - pan.value.y) * ratio
  zoom.value = next
  pan.value = clampPan(x, y)
}

function resetZoom() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

/** Zoomed out: nudge in, so people see zoom is there. Zoomed in: back to 100%. */
function toggleZoom(point: { clientX: number; clientY: number }) {
  if (zoom.value > 1) return resetZoom()
  const { x, y } = stagePoint(point)
  zoomAt(1.4, x, y)
}
// A double tap is already handled in onPointerUp; some browsers also send dblclick for it
const onDoubleClick = (e: MouseEvent) => e.timeStamp - lastTouch > 500 && toggleZoom(e)

const stagePoint = (e: { clientX: number; clientY: number }) => {
  const r = stage.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function onWheel(e: WheelEvent) {
  // Pinch on a trackpad arrives as a wheel event with ctrlKey and small deltas
  const { x, y } = stagePoint(e)
  zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)), x, y)
}

const pointers = new Map<number, { x: number; y: number }>()
let pinchStart: { dist: number; zoom: number } | null = null
let lastTap = 0
let lastTouch = -Infinity

const pinchDistance = () => {
  const [a, b] = [...pointers.values()]
  return Math.hypot(a!.x - b!.x, a!.y - b!.y)
}

function onPointerDown(e: PointerEvent) {
  stage.value?.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) pinchStart = { dist: pinchDistance(), zoom: zoom.value }
  dragging.value = pointers.size === 1 && zoom.value > 1
}

function onPointerMove(e: PointerEvent) {
  const prev = pointers.get(e.pointerId)
  if (!prev) return
  const cur = { x: e.clientX, y: e.clientY }
  pointers.set(e.pointerId, cur)
  if (pointers.size === 2 && pinchStart) {
    const [a, b] = [...pointers.values()]
    const mid = stagePoint({ clientX: (a!.x + b!.x) / 2, clientY: (a!.y + b!.y) / 2 })
    zoomAt((pinchStart.zoom * pinchDistance()) / pinchStart.dist / zoom.value, mid.x, mid.y)
  } else if (pointers.size === 1 && zoom.value > 1) {
    pan.value = clampPan(pan.value.x + cur.x - prev.x, pan.value.y + cur.y - prev.y)
  }
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  pinchStart = null
  dragging.value = false
  // Browsers don't send dblclick for touch when pinch-zoom is ours, so spot a double tap
  if (e.pointerType === 'touch') lastTouch = e.timeStamp
  if (e.pointerType === 'touch' && pointers.size === 0) {
    if (e.timeStamp - lastTap < 300) toggleZoom(e)
    lastTap = e.timeStamp
  }
}

const dateLabel = computed(() => formatLongDate(parseDate(date.value)))
const timeLabel = (f?: CamFrame) => (f ? formatNyTime(f.takenAt) : '')
/** A panorama capture is a date only */
const captureLabel = (f?: CamFrame) => (f ? formatLongDate(parseDate(nyDate(new Date(f.takenAt)))) : '')
const shownLabel = computed(() =>
  shown.value ? (shown.value.pano ? captureLabel(shown.value.f) : `${dateLabel.value}, ${timeLabel(shown.value.f)}`) : '',
)
const lastIndex = computed(() => Math.max(0, frames.value.length - 1))

// --- One slider for days and times ---
// Each day is divided into 10-minute slots, so the slider position is
// day * 144 + slot. Dragging within a day snaps to the nearest photo at once;
// dragging across days waits a moment before loading the new day.
const SLOTS = 144
const sliderMax = computed(() => dayCount.value * SLOTS + SLOTS - 1)
const slotOf = (min: number) => Math.min(SLOTS - 1, Math.round(min / 10))
const sliderValue = computed(() => {
  const min = targetMin.value ?? (frame.value ? nyMinutes(frame.value.takenAt) : 24 * 60)
  return dayIndex.value * SLOTS + slotOf(min)
})
/** Where the thumb is while a drag across days is still settling */
const scrubPos = ref<number | null>(null)
let settle: number | undefined

function onScrub(value: number) {
  const day = addDays(first.value, Math.floor(value / SLOTS))
  const min = (value % SLOTS) * 10
  window.clearTimeout(settle)
  targetMin.value = min
  if (day === date.value) {
    scrubPos.value = null
    if (frames.value.length) index.value = nearest(frames.value, min)
    return
  }
  scrubPos.value = value
  settle = window.setTimeout(() => {
    scrubPos.value = null
    setDate(day)
  }, 100)
}
onBeforeUnmount(() => window.clearTimeout(settle))

/** The day buttons keep the time of day */
const stepDay = (n: number) => setDate(addDays(date.value, n))

/** The latest photo of today */
function goToToday() {
  targetMin.value = null
  if (date.value === props.today) index.value = lastIndex.value
  else setDate(props.today)
}

/** The photo buttons cross into the next or previous day at the ends of a day */
function stepPhoto(n: number) {
  const i = index.value + n
  if (frames.value[i]) {
    index.value = i
    targetMin.value = nyMinutes(frames.value[i]!.takenAt)
  } else if (n < 0 ? date.value > first.value : date.value < props.today) {
    landOn = n < 0 ? 'last' : 'first'
    setDate(addDays(date.value, n))
  }
}
const atStart = computed(() => date.value <= first.value && index.value <= 0)
const atEnd = computed(() => date.value >= props.today && index.value >= lastIndex.value)
</script>

<template>
  <section :id="project.id" ref="root" class="viewer-card" :class="{ wide: !!pano }" :aria-label="`${project.name} archive`">
    <header class="viewer-head">
      <h2 class="viewer-name">{{ project.name }}</h2>
      <p class="viewer-loc">{{ project.location }}</p>
    </header>

    <div v-if="views.length > 1 || panoTabs.length" class="view-tabs" role="group" aria-label="Camera view">
      <button
        v-for="(_, i) in views.length > 1 || panoTabs.length ? views : []"
        :key="i"
        type="button"
        class="view-tab"
        :class="{ active: !panoKey && i + 1 === viewNo }"
        :aria-pressed="!panoKey && i + 1 === viewNo"
        @click="pickView(i + 1)"
      >
        {{ views.length > 1 ? `View ${i + 1}` : 'Camera' }}
      </button>
      <button
        v-for="t in panoTabs"
        :key="t.key"
        type="button"
        class="view-tab"
        :class="{ active: panoKey === t.key }"
        :aria-pressed="panoKey === t.key"
        @click="pickPano(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <div
      ref="stage"
      class="stage"
      :class="{ zoomed: zoom > 1, dragging }"
      :style="{ aspectRatio: aspect }"
      :aria-busy="loading"
      @wheel.prevent="onWheel"
      @dblclick="onDoubleClick"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <TransitionGroup
        name="fade"
        tag="div"
        class="pan"
        :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }"
      >
        <img
          v-if="shown"
          :key="shown.f.frame"
          :src="src(shown.f, zoom, shown.pano)"
          :alt="`${project.name}, ${shownLabel}`"
          draggable="false"
        />
      </TransitionGroup>
      <p v-if="zoom > 1" class="zoom-badge">{{ zoom.toFixed(1) }}× · {{ resetHint }} to reset</p>
      <p v-if="shown" class="sr-only" aria-live="polite">{{ shownLabel }}</p>
      <p v-else-if="failed || error" class="stage-msg stage-msg--error">Couldn't load this camera right now.</p>
      <p v-else-if="loading || !view || !near || frames.length" class="stage-msg">Loading…</p>
      <p v-else class="stage-msg">{{ pano ? 'No panoramas yet.' : 'No photos for this day.' }}</p>
    </div>

    <div v-if="pano && frames.length" class="controls">
      <div class="control-row">
        <button type="button" class="step" aria-label="Earlier panorama" :disabled="index <= 0" @click="index--">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
        </button>
        <div class="control-main">
          <label class="control-label" :for="`${project.id}-capture`">
            <b>{{ captureLabel(frame) }}</b>
          </label>
          <input :id="`${project.id}-capture`" v-model.number="index" type="range" min="0" :max="lastIndex" :aria-valuetext="captureLabel(frame)" />
          <span class="range-ends">
            <button type="button" class="end" @click="index = 0">{{ captureLabel(frames[0]) }}</button>
            <button type="button" class="end" @click="index = lastIndex">Latest</button>
          </span>
        </div>
        <button type="button" class="step" aria-label="Later panorama" :disabled="index >= lastIndex" @click="index++">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
        </button>
      </div>
    </div>

    <div v-else-if="view && !pano" class="controls">
      <div class="control-row">
        <button type="button" class="step step--day" aria-label="Previous day" :disabled="date <= first" @click="stepDay(-1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.5 3 4 8l4.5 5M12.5 3 8 8l4.5 5" /></svg></button>
        <button type="button" class="step" aria-label="Earlier photo" :disabled="atStart" @click="stepPhoto(-1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg></button>
        <div class="control-main">
          <label class="control-label" :for="`${project.id}-scrub`">
            <b>{{ dateLabel }}<template v-if="frames.length"> · {{ timeLabel(frame) }}</template></b>
          </label>
          <input
            :id="`${project.id}-scrub`"
            type="range"
            min="0"
            :max="sliderMax"
            :value="scrubPos ?? sliderValue"
            :aria-valuetext="`${dateLabel}${frames.length ? `, ${timeLabel(frame)}` : ''}`"
            @input="onScrub(Number(($event.target as HTMLInputElement).value))"
          />
          <span class="range-ends">
            <button type="button" class="end" @click="setDate(first)">{{ formatLongDate(parseDate(first)) }}</button>
            <button type="button" class="end" @click="goToToday">Today</button>
          </span>
        </div>
        <button type="button" class="step" aria-label="Later photo" :disabled="atEnd" @click="stepPhoto(1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg></button>
        <button type="button" class="step step--day" aria-label="Next day" :disabled="date >= today" @click="stepDay(1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7.5 3 12 8l-4.5 5M3.5 3 8 8l-4.5 5" /></svg></button>
      </div>
    </div>

    <p class="note">Source: <a :href="project.earthcam" target="_blank" rel="noopener">EarthCam ↗</a></p>
  </section>
</template>

<style scoped>
.viewer-card {
  /* Wide enough to be big, narrow enough that the controls still fit */
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
  transition: max-width 0.25s ease;
  scroll-margin-top: 64px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 16px 16px;
}

/* Panoramas are wide and short, so they can use the room (a 16:9 photo this wide wouldn't fit on screen) */
.viewer-card.wide {
  max-width: 2200px;
}

@media (prefers-reduced-motion: reduce) {
  .viewer-card {
    transition: none;
  }
}

.viewer-head {
  margin-bottom: 10px;
}

.viewer-name {
  font-size: 22px;
  line-height: 1.2;
}

.viewer-loc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.view-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.view-tab {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.view-tab.active {
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
  color: var(--color-primary);
}

.stage {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-navy);
}

/* One finger scrolls the page until zoomed in; two fingers pinch */
.stage {
  touch-action: pan-y;
  user-select: none;
}

.stage.zoomed {
  touch-action: none;
  cursor: grab;
}

.stage.dragging {
  cursor: grabbing;
}

.pan {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.zoom-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 1;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  pointer-events: none;
}

.stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* The new photo fades in on top; the old one is kept until it's covered */
.fade-enter-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-active {
  transition: opacity 0.01s linear 0.4s;
}

.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

.stage-msg {
  padding: var(--spacing-md);
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  text-align: center;
}

.stage-msg--error {
  color: #ffc7b8;
}

.controls {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 480px) {
  .control-row {
    gap: 4px;
  }

  .control-label b {
    font-size: 12px;
  }

  .step {
    width: 32px;
    height: 32px;
  }
}

.control-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.control-label {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 10px;
  font-size: 14px;
}

.control-label b {
  font-family: var(--font-family-mono);
  font-weight: 600;
}


.range-ends {
  display: flex;
  justify-content: space-between;
}

/* The ends of a scrubber jump to it, like EarthCam's player */
.end {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-tertiary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.end:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.step {
  flex: none;
  display: grid;
  place-items: center;
  padding: 0;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}

.step svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.step:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
}

.step:disabled {
  opacity: 0.35;
  cursor: default;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--color-primary);
}

.note {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}
</style>
