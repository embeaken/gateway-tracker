<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { addDays, daysBetween, formatLongDate, formatNyDate, formatNyTime, nyDate, nyMinutes, parseDate } from '../dates'
import type { CamFrame, CamFramesResponse, CamView } from '../earthcam'
import { cdnSiteImage } from '../imageCdn'
import type { Project } from '../types'

// One site's archive: pick a view and scrub through its days and times on one
// slider, or pick a panorama (dated, not timed). Nothing is fetched until the
// card is near the screen, since the page has a card for every site.

const props = defineProps<{
  project: Project
  views: CamView[]
  /** Cameras with a panorama series */
  panoramas: string[]
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

// --- View or panorama, and day ---
const viewIndex = ref(props.project.featuredView ?? 0)
const view = computed(() => props.views[viewIndex.value] ?? props.views[0])
/** The chosen panorama's camera, or null for a view */
const pano = ref<string | null>(null)
const first = computed(() => (view.value ? nyDate(new Date(view.value.since)) : props.today))
const date = ref(props.today)
const dayCount = computed(() => daysBetween(first.value, props.today))
const dayIndex = computed(() => daysBetween(first.value, date.value))
// Another view may start later than the day being shown
watch(first, (f) => {
  if (date.value < f) date.value = f
})

const setDate = (d: string) => {
  if (d >= first.value && d <= props.today) date.value = d
}
const pickView = (i: number) => {
  pano.value = null
  viewIndex.value = i
  date.value = props.today
  targetMin.value = null
  resetZoom()
}
const pickPano = (camera: string) => {
  pano.value = camera
  resetZoom()
}

// --- Frames: the chosen view's day, or every capture of the panorama ---
// Keyed by URL, so the 5-minute refresh of /api/cams (new objects, same view)
// doesn't reload the day or move the slider.
const sourceUrl = computed(() => {
  const v = view.value
  if (!near.value) return ''
  if (pano.value) return `/api/cam-panoramas/${props.project.id}/${pano.value}`
  return v ? `/api/cam-archive/${props.project.id}/${v.camera}?${new URLSearchParams({ ref: v.ref, date: date.value })}` : ''
})
const cache = new Map<string, CamFrame[]>()
const frames = ref<CamFrame[]>([])
const loading = ref(false)
const error = ref(false)
const isPanoUrl = (url?: string) => !!url?.startsWith('/api/cam-panoramas/')

watch(
  sourceUrl,
  async (url, prev) => {
    if (!url) return
    // Don't show a still as a panorama (or the reverse) while the other loads
    if (prev && isPanoUrl(url) !== isPanoUrl(prev)) frames.value = []
    error.value = false
    const hit = cache.get(url)
    loading.value = !hit
    if (hit) {
      frames.value = hit
      return
    }
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const list = ((await res.json()) as CamFramesResponse).frames
      // Ignore a slow response for something the visitor has already left
      if (sourceUrl.value !== url) return
      // Today's photos keep coming, so its list isn't kept
      if (pano.value || date.value !== props.today) cache.set(url, list)
      frames.value = list
    } catch {
      if (sourceUrl.value === url) {
        frames.value = []
        error.value = true
      }
    } finally {
      if (sourceUrl.value === url) loading.value = false
    }
  },
  { immediate: true },
)

// --- Time within the day (or which capture of a panorama) ---
const index = ref(0)
const frame = computed(() => frames.value[index.value])
const lastIndex = computed(() => Math.max(0, frames.value.length - 1))
const minutes = computed(() => frames.value.map((f) => nyMinutes(f.takenAt)))
/**
 * The time of day (minutes) to show on every day: it stays put as the day
 * changes, so the same moment can be compared across days. Null means "the
 * latest photo of the day".
 */
const targetMin = ref<number | null>(null)
/** Set by stepping past the end of a day: which photo to land on in the next one */
let landOn: 'first' | 'last' | null = null

const nearest = (min: number) =>
  minutes.value.reduce((best, m, i, all) => (Math.abs(m - min) < Math.abs(all[best]! - min) ? i : best), 0)

watch(frames, (list) => {
  if (pano.value || !list.length) index.value = lastIndex.value
  else if (landOn) index.value = landOn === 'first' ? 0 : lastIndex.value
  else index.value = targetMin.value === null ? lastIndex.value : nearest(targetMin.value)
  if (landOn && list.length) targetMin.value = minutes.value[index.value]!
  landOn = null
})

// --- Crossfade ---
// A new photo is fetched in the background and only shown once it has loaded,
// fading in over the old one, so scrubbing never flashes or shows a blank. It's
// fetched at the size the current zoom will display, or the visible image would
// still have to load after the swap.
// Zoomed in, larger originals are fetched. EarthCam serves stills at 1440
// (medium), 1920 (half) and 3840 (full, the original: there is nothing above
// it), so the size steps up as the photo is enlarged past what each can fill.
// Panoramas are far wider: their "half" size is ~11,000px.
// Full screen always uses the best there is: the original still, and the
// panorama at its full width. `maxQuality` follows `isFull` once that quality
// has loaded (see below), so entering full screen doesn't blank the photo.
const maxQuality = ref(false)
const src = (f: CamFrame, zoomLevel: number, isPano: boolean) => {
  if (maxQuality.value) return isPano ? cdnSiteImage(`${f.frame}?size=half`, 11000) : cdnSiteImage(`${f.frame}?size=full`, 3840)
  if (isPano) return cdnSiteImage(`${f.frame}?size=half`, zoomLevel > 1 || photo.value.w > 2400 ? 6000 : 2560)
  if (zoomLevel <= 1) return cdnSiteImage(f.frame, 1440)
  return photo.value.w * zoomLevel <= 1920 ? cdnSiteImage(`${f.frame}?size=half`, 1920) : cdnSiteImage(`${f.frame}?size=full`, 3840)
}
/** What's on screen. `pano` is kept so it still renders right while a switch to the other kind fades in. */
const shown = ref<{ f: CamFrame; pano: boolean } | null>(null)
/** The photo's shape: 16:9 for stills, its own for panoramas. The stage matches it, except on phones (see .stage). */
const aspect = ref(16 / 9)
/** The photo for the current frame is still downloading (it shows once decoded) */
const imgLoading = ref(false)

watch(frame, async (f) => {
  if (!f) {
    shown.value = null
    imgLoading.value = false
    return
  }
  imgLoading.value = true
  const isPano = !!pano.value
  const img = new Image()
  img.src = src(f, zoom.value, isPano)
  try {
    await img.decode()
  } catch {
    // Show it anyway: the <img> will surface a broken image rather than hang
  }
  // A newer frame is loading: leave the spinner to it
  if (frame.value !== f) return
  imgLoading.value = false
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
const stageSize = ref({ w: 0, h: 0 })
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const dragging = ref(false)
/** Set once the visitor has dragged, to drop the "drag to look around" hint */
const dragged = ref(false)

let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  resizeObserver = new ResizeObserver(([e]) => {
    if (!e) return
    const { width: w, height: h } = e.contentRect
    // Only a real change: a new object would recentre the photo
    if (w !== stageSize.value.w || h !== stageSize.value.h) stageSize.value = { w, h }
  })
  if (stage.value) resizeObserver.observe(stage.value)
})
onBeforeUnmount(() => resizeObserver?.disconnect())

/**
 * The photo's size at 100%: just covering the stage. That's the whole stage
 * when their shapes match; on a phone's taller stage it's wider than the stage
 * and can be dragged sideways.
 */
const photo = computed(() => {
  const { w, h } = stageSize.value
  return w / h > aspect.value ? { w, h: w / aspect.value } : { w: h * aspect.value, h }
})
/** At 100%, the photo is wider (or taller) than the stage */
const croppedAtFit = computed(() => photo.value.w > stageSize.value.w + 1 || photo.value.h > stageSize.value.h + 1)
const canPan = computed(() => zoom.value > 1 || croppedAtFit.value)

/** Keep the photo covering the stage */
const clampPan = (x: number, y: number) => {
  const { w, h } = stageSize.value
  return {
    x: Math.min(0, Math.max(w - photo.value.w * zoom.value, x)),
    y: Math.min(0, Math.max(h - photo.value.h * zoom.value, y)),
  }
}
const centre = () => ({ x: (stageSize.value.w - photo.value.w) / 2, y: (stageSize.value.h - photo.value.h) / 2 })
// A new stage or photo shape: recentre at 100%. Zoomed in, keep the same spot
// of the photo in the middle of the stage (e.g. going full screen), in bounds.
watch([photo, stageSize], ([p, s], [oldP, oldS]) => {
  if (zoom.value <= 1 || !oldP?.w || !oldP.h) return (pan.value = centre())
  const fx = (oldS.w / 2 - pan.value.x) / (oldP.w * zoom.value)
  const fy = (oldS.h / 2 - pan.value.y) / (oldP.h * zoom.value)
  pan.value = clampPan(s.w / 2 - fx * p.w * zoom.value, s.h / 2 - fy * p.h * zoom.value)
})

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
  pan.value = centre()
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
/** Where a one-finger drag started, until it has moved far enough to count (not a tap) */
let dragStart: { x: number; y: number } | null = null

const pinchDistance = () => {
  const [a, b] = [...pointers.values()]
  return Math.hypot(a!.x - b!.x, a!.y - b!.y)
}

function onPointerDown(e: PointerEvent) {
  stage.value?.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) pinchStart = { dist: pinchDistance(), zoom: zoom.value }
  dragging.value = pointers.size === 1 && canPan.value
  dragStart = dragged.value ? null : { x: e.clientX, y: e.clientY }
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
  } else if (pointers.size === 1 && canPan.value) {
    pan.value = clampPan(pan.value.x + cur.x - prev.x, pan.value.y + cur.y - prev.y)
    if (dragStart && Math.hypot(cur.x - dragStart.x, cur.y - dragStart.y) > 5) dragged.value = true
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

// --- Full screen ---
// The whole card goes full screen, so the controls come along. Where the
// Fullscreen API isn't available for elements (iPhone Safari), the card is
// pinned over the page instead.
const fullscreen = ref(false)
const pinned = ref(false)
const isFull = computed(() => fullscreen.value || pinned.value)

watch(isFull, async (full) => {
  const f = shown.value
  if (!full || !f) {
    maxQuality.value = full
    return
  }
  maxQuality.value = true
  const best = src(f.f, zoom.value, f.pano)
  maxQuality.value = false
  try {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = best
    })
  } catch {
    // Not available: keep what's on screen
    return
  }
  if (isFull.value) maxQuality.value = true
})

const onFullscreenChange = () => (fullscreen.value = !!root.value && document.fullscreenElement === root.value)
const onKeydown = (e: KeyboardEvent) => e.key === 'Escape' && pinned.value && (pinned.value = false)
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('keydown', onKeydown)
  if (fullscreen.value) void document.exitFullscreen().catch(() => {})
  document.documentElement.classList.remove('cam-pinned')
})
// No page scrolling behind the pinned card
watch(pinned, (on) => document.documentElement.classList.toggle('cam-pinned', on))

async function toggleFullscreen() {
  if (pinned.value) return (pinned.value = false)
  if (fullscreen.value) return void document.exitFullscreen().catch(() => {})
  if (root.value?.requestFullscreen && document.fullscreenEnabled) {
    try {
      await root.value.requestFullscreen()
      return
    } catch {
      // Fall through to pinning
    }
  }
  pinned.value = true
}

const dateLabel = computed(() => formatLongDate(parseDate(date.value)))
const timeLabel = (f?: CamFrame) => (f ? formatNyTime(f.takenAt) : '')
/** A panorama capture is a date only */
const captureLabel = (f?: CamFrame) => (f ? formatNyDate(f.takenAt) : '')
const shownLabel = computed(() =>
  shown.value ? (shown.value.pano ? captureLabel(shown.value.f) : `${dateLabel.value}, ${timeLabel(shown.value.f)}`) : '',
)

// --- One slider for days and times ---
// Each day is divided into 10-minute slots, so the slider position is
// day * 144 + slot. Dragging within a day snaps to the nearest photo at once;
// dragging across days waits a moment before loading the new day.
const SLOTS = 144
const sliderMax = computed(() => dayCount.value * SLOTS + SLOTS - 1)
const slotOf = (min: number) => Math.min(SLOTS - 1, Math.round(min / 10))
const sliderValue = computed(() => {
  const min = targetMin.value ?? minutes.value[index.value] ?? 24 * 60
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
    if (frames.value.length) index.value = nearest(min)
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
    targetMin.value = minutes.value[i]!
  } else if (n < 0 ? date.value > first.value : date.value < props.today) {
    landOn = n < 0 ? 'last' : 'first'
    setDate(addDays(date.value, n))
  }
}
const atStart = computed(() => date.value <= first.value && index.value <= 0)
const atEnd = computed(() => date.value >= props.today && index.value >= lastIndex.value)
</script>

<template>
  <section :id="project.id" ref="root" class="viewer-card" :class="{ wide: !!pano, full: isFull, pinned }" :aria-label="`${project.name} archive`">
    <header class="viewer-head">
      <h2 class="viewer-name">{{ project.name }}</h2>
      <p class="viewer-loc">{{ project.location }}</p>
    </header>

    <div v-if="views.length > 1 || panoramas.length" class="view-tabs" role="group" aria-label="Camera view">
      <button
        v-for="(_, i) in views"
        :key="i"
        type="button"
        class="view-tab"
        :class="{ active: !pano && i === viewIndex }"
        :aria-pressed="!pano && i === viewIndex"
        @click="pickView(i)"
      >
        {{ views.length > 1 ? `View ${i + 1}` : 'Camera' }}
      </button>
      <button
        v-for="(camera, i) in panoramas"
        :key="camera"
        type="button"
        class="view-tab"
        :class="{ active: pano === camera }"
        :aria-pressed="pano === camera"
        @click="pickPano(camera)"
      >
        {{ panoramas.length > 1 ? `Panorama ${i + 1}` : 'Panorama' }}
      </button>
    </div>

    <div class="stage-wrap">
      <div
        ref="stage"
        class="stage"
        :class="{ zoomed: zoom > 1, pannable: canPan, dragging }"
        :style="{ '--aspect': aspect }"
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
          :style="{ width: `${photo.w}px`, height: `${photo.h}px`, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }"
        >
          <img
            v-if="shown"
            :key="shown.f.frame"
            :src="src(shown.f, zoom, shown.pano)"
            :alt="`${project.name}, ${shownLabel}`"
            draggable="false"
          />
        </TransitionGroup>
        <button
          type="button"
          class="fs-btn"
          :aria-label="isFull ? 'Exit full screen' : 'Full screen'"
          :title="isFull ? 'Exit full screen' : 'Full screen'"
          @pointerdown.stop
          @pointerup.stop
          @pointercancel.stop
          @dblclick.stop
          @click="toggleFullscreen"
        >
          <svg v-if="isFull" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" /></svg>
          <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" /></svg>
        </button>
        <p v-if="zoom > 1" class="zoom-badge">{{ zoom.toFixed(1) }}× · {{ resetHint }} to reset</p>
        <p v-else-if="shown && croppedAtFit && !dragged" class="pan-hint" aria-hidden="true">← Drag to look around →</p>
        <p v-if="shown" class="sr-only" aria-live="polite">{{ shownLabel }}</p>
        <p v-else-if="failed || error" class="stage-msg stage-msg--error">Couldn't load this camera right now.</p>
        <p v-else-if="loading || !view || !near || frames.length" class="stage-msg">Loading…</p>
        <p v-else class="stage-msg">{{ pano ? 'No panoramas yet.' : 'No photos for this day.' }}</p>
      </div>
    </div>

    <div v-if="pano && frames.length" class="controls">
      <div class="control-row">
        <input :id="`${project.id}-capture`" v-model.number="index" type="range" min="0" :max="lastIndex" :aria-valuetext="captureLabel(frame)" />
        <span class="range-ends">
          <button type="button" class="end" @click="index = 0">{{ captureLabel(frames[0]) }}</button>
          <button type="button" class="end" @click="index = lastIndex">Latest</button>
        </span>
        <div class="control-nav">
          <button type="button" class="step" aria-label="Earlier panorama" :disabled="index <= 0" @click="index--">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <label class="control-label control-label--pano" :for="`${project.id}-capture`">
            <b>{{ captureLabel(frame) }}</b>
            <span v-if="loading || imgLoading" class="spinner" aria-hidden="true"></span>
          </label>
          <button type="button" class="step" aria-label="Later panorama" :disabled="index >= lastIndex" @click="index++">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="view && !pano" class="controls">
      <div class="control-row">
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
        <div class="control-nav">
          <button type="button" class="step step--day" aria-label="Previous day" :disabled="date <= first" @click="stepDay(-1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.5 3 4 8l4.5 5M12.5 3 8 8l4.5 5" /></svg></button>
          <button type="button" class="step" aria-label="Earlier photo" :disabled="atStart" @click="stepPhoto(-1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg></button>
          <label class="control-label" :for="`${project.id}-scrub`">
            <b>{{ dateLabel }}<template v-if="frames.length"> · {{ timeLabel(frame) }}</template></b>
            <span v-if="loading || imgLoading" class="spinner" aria-hidden="true"></span>
          </label>
          <button type="button" class="step" aria-label="Later photo" :disabled="atEnd" @click="stepPhoto(1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg></button>
          <button type="button" class="step step--day" aria-label="Next day" :disabled="date >= today" @click="stepDay(1)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7.5 3 12 8l-4.5 5M3.5 3 8 8l-4.5 5" /></svg></button>
        </div>
      </div>
    </div>

    <p class="note">Source: <a :href="project.earthcam" target="_blank" rel="noopener">EarthCam ↗</a></p>
  </section>
</template>

<style scoped>
.viewer-card {
  --pad: 16px;
  /* Wide enough to be big, narrow enough that the controls still fit */
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
  transition: max-width 0.25s ease;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px var(--pad) var(--pad);
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

/* Full screen: the photo takes all the room the header and controls leave */
.viewer-card.full {
  display: flex;
  flex-direction: column;
  max-width: none;
  border: 0;
  border-radius: 0;
  transition: none;
}

.viewer-card.pinned {
  position: fixed;
  inset: 0;
  z-index: 1000;
  height: 100dvh;
  overflow: auto;
}

:global(html.cam-pinned) {
  overflow: hidden;
}

.full .stage-wrap {
  flex: 1;
  /* On a short screen the card scrolls (pinned) or clips rather than squashing the photo to nothing */
  min-height: min(50dvh, 240px);
  display: grid;
  place-items: center;
  container-type: size;
}

/* Fill the whole stage area. The photo covers it at 100% (see `photo`), so a
   photo that doesn't match the screen's shape is cropped and can be dragged. */
.viewer-card.full .stage {
  width: 100cqw;
  height: 100cqh;
  aspect-ratio: auto;
  max-height: none;
  margin-inline: 0;
  border-radius: 0;
}

.full .note {
  display: none;
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
  touch-action: manipulation;
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
  aspect-ratio: var(--aspect, 16 / 9);
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-chrome);
  /* One finger scrolls the page until zoomed in; two fingers pinch */
  touch-action: pan-y;
  user-select: none;
}

.stage.pannable {
  cursor: grab;
}

.stage.zoomed {
  touch-action: none;
}

.stage.dragging {
  cursor: grabbing;
}

.pan {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.fs-btn {
  touch-action: manipulation;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
}

.fs-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.fs-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.zoom-badge,
.pan-hint {
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
  color: var(--color-alert-soft);
}

.controls {
  /* Fast taps on the step buttons must not double-tap zoom the page */
  touch-action: manipulation;
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

/* The date and step buttons sit centred above the slider, the date between
   the earlier and later buttons, so the eye stays in one place. The
   slider's end labels go underneath. */
.control-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'top'
    'slider'
    'ends';
  align-items: center;
  gap: 2px;
}

.control-row input[type='range'] {
  grid-area: slider;
}

.control-row .range-ends {
  grid-area: ends;
}

.control-nav {
  grid-area: top;
  justify-self: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}


/* Wide enough for the longest date ("September 30, 2025 · 12:50 PM"), so
   the buttons beside it don't move as it changes. The spinner sits in the
   padding for the same reason. */
.control-label {
  position: relative;
  display: flex;
  justify-content: center;
  min-width: calc(30ch + 40px);
  padding-inline: 20px;
  font-family: var(--font-family-mono);
  font-size: 14px;
  white-space: nowrap;
}

.control-label--pano {
  min-width: calc(19ch + 40px);
}

.control-label .spinner {
  position: absolute;
  top: calc(50% - 6px);
  right: 2px;
}

.control-label b {
  font-family: var(--font-family-mono);
  font-weight: 600;
}

/* Shown only if loading takes a moment, so quick steps don't flicker */
.spinner {
  align-self: center;
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  opacity: 0;
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
  .spinner {
    animation:
      spin 2s linear infinite,
      appear 0.15s ease 0.15s forwards;
  }
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

/* Phones: the date gets its own line above the step buttons */
@media (max-width: 768px) {
  .viewer-card {
    --pad: 12px;
    padding-top: var(--pad);
  }

  .viewer-name {
    font-size: 20px;
  }

  .control-label {
    order: -1;
    flex-basis: 100%;
    min-width: 0;
  }

  .step {
    width: 44px;
    height: 44px;
  }
}

/* Held upright, a 16:9 strip is cramped: the stage is taller, running to the
   card's edges, and the photo fills it (drag sideways for the rest). Only
   upright, because a wide, short stage would crop the top and bottom, which
   can't be dragged to (a vertical swipe scrolls the page). The width is set so
   the height cap can't shrink it (as it would with aspect-ratio alone). */
@media (max-width: 768px) and (orientation: portrait) {
  .stage {
    width: calc(100% + 2 * var(--pad));
    aspect-ratio: 4 / 5;
    max-height: 70svh;
    margin-inline: calc(-1 * var(--pad));
    border-radius: 0;
  }
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
