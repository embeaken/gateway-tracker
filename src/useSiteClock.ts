import { onMounted, onUnmounted, ref, computed } from 'vue'
import { MINING_START } from './assets/data'

const TZ = 'America/New_York'

/** Today's date at the job site (YYYY-MM-DD in New York). */
const nyDateKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ })

/**
 * Wall clock at the construction sites, plus derived "night shift" and
 * "day N of tunnel boring" values. Ticks once a minute.
 */
export function useSiteClock() {
  const now = ref(new Date())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => (now.value = new Date()), 30_000)
  })
  onUnmounted(() => window.clearInterval(timer))

  const time = computed(() =>
    now.value.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }),
  )

  const hour = computed(() =>
    Number(now.value.toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false })),
  )

  const isNight = computed(() => hour.value >= 19 || hour.value < 6)

  const miningDay = computed(() => {
    const start = Date.parse(`${MINING_START}T00:00:00Z`)
    const today = Date.parse(`${nyDateKey(now.value)}T00:00:00Z`)
    return Math.floor((today - start) / 86_400_000) + 1
  })

  return { time, isNight, miningDay }
}
