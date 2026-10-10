export type KeyHandler = (key: string) => boolean

export interface KeyboardInput {
  onKey(handler: KeyHandler): () => void
  destroy(): void
}

export function normalizeKey(e: KeyboardEvent): string {
  if (e.key === ' ' || e.code === 'Space') return 'space'
  return e.key.toLowerCase()
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function createKeyboardInput(): KeyboardInput {
  const handlers = new Set<KeyHandler>()

  const down = (e: KeyboardEvent): void => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
    const key = normalizeKey(e)
    let handled = false
    for (const h of handlers) handled = h(key) || handled
    if (handled) e.preventDefault()
  }

  window.addEventListener('keydown', down)

  return {
    onKey(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    destroy() {
      handlers.clear()
      window.removeEventListener('keydown', down)
    },
  }
}
