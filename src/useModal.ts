import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

/**
 * Modal behaviour for a dialog teleported to <body>: while open, the page
 * behind it is inert (so Tab stays in the dialog) and doesn't scroll, Escape
 * closes it, and focus moves in on open and back on close. Also works for
 * dialogs that are mounted already open (`v-if` on the component itself).
 */
export function useModal(isOpen: () => boolean, initialFocus: Ref<HTMLElement | null>, close: () => void) {
  let returnFocusTo: HTMLElement | null = null
  /** Whether this dialog made the page inert. Only then may it undo that:
   *  a closed dialog mounting while another is open must leave it alone. */
  let holding = false
  const app = () => document.getElementById('app')

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }

  const release = () => {
    if (!holding) return
    holding = false
    const el = app()
    if (el) el.inert = false
    document.documentElement.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }

  watch(isOpen, async (open) => {
    if (open) {
      holding = true
      returnFocusTo = document.activeElement as HTMLElement | null
      const el = app()
      if (el) el.inert = true
      document.documentElement.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      initialFocus.value?.focus()
    } else if (holding) {
      release()
      returnFocusTo?.focus()
    }
  }, { immediate: true })

  onBeforeUnmount(release)
}
