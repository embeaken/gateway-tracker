import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

/**
 * Modal behaviour for a dialog teleported to <body>: while open, the page
 * behind it is inert (so Tab stays in the dialog) and doesn't scroll, Escape
 * closes it, and focus moves in on open and back on close.
 */
export function useModal(isOpen: () => boolean, initialFocus: Ref<HTMLElement | null>, close: () => void) {
  let returnFocusTo: HTMLElement | null = null
  const app = () => document.getElementById('app')

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }

  const release = () => {
    const el = app()
    if (el) el.inert = false
    document.documentElement.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }

  watch(isOpen, async (open) => {
    if (open) {
      returnFocusTo = document.activeElement as HTMLElement | null
      const el = app()
      if (el) el.inert = true
      document.documentElement.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      initialFocus.value?.focus()
    } else {
      release()
      returnFocusTo?.focus()
    }
  })

  onBeforeUnmount(release)
}
