import { onMounted, onUnmounted, ref, computed } from 'vue'
import { MINING_START } from './assets/data'

/** Today's date in New York (YYYY-MM-DD). */
const nyDateKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

/** "Day N of tunnel boring", counted in New York time. Re-checks every minute. */
export function useSiteClock() {
  const now = ref(new Date())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => (now.value = new Date()), 60_000)
  })
  onUnmounted(() => window.clearInterval(timer))

  const miningDay = computed(() => {
    const start = Date.parse(`${MINING_START}T00:00:00Z`)
    const today = Date.parse(`${nyDateKey(now.value)}T00:00:00Z`)
    return Math.floor((today - start) / 86_400_000) + 1
  })

  return { miningDay }
}
