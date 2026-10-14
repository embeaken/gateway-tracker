import { onMounted, onUnmounted, ref } from 'vue'
import type { CamsResponse } from './earthcam'

const REFRESH_MS = 5 * 60_000

/** The latest stills from /api/cams (see src/earthcam.ts), refreshed every few minutes. */
export function useCams() {
  const data = ref<CamsResponse | null>(null)
  const failed = ref(false)

  async function load() {
    try {
      const res = await fetch('/api/cams')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data.value = (await res.json()) as CamsResponse
      failed.value = false
    } catch {
      // Keep showing the last good stills if a refresh fails
      if (!data.value) failed.value = true
    }
  }

  let timer: number | undefined
  onMounted(() => {
    load()
    timer = window.setInterval(load, REFRESH_MS)
  })
  onUnmounted(() => window.clearInterval(timer))

  return { data, failed }
}
