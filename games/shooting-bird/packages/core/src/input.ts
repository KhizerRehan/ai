import type { FixedCanvas } from './canvas'

export interface Pointer {
  x: number
  y: number
  inside: boolean
}

export type ClickHandler = (x: number, y: number) => void

export interface MouseInput {
  readonly pointer: Pointer
  onClick(handler: ClickHandler): () => void
  destroy(): void
}

export function createMouseInput(fixed: FixedCanvas): MouseInput {
  const pointer: Pointer = { x: -100, y: -100, inside: false }
  const handlers = new Set<ClickHandler>()
  const el = fixed.canvas

  const track = (e: MouseEvent): void => {
    const p = fixed.toLogical(e.clientX, e.clientY)
    pointer.x = p.x
    pointer.y = p.y
    pointer.inside = true
  }
  const leave = (): void => {
    pointer.inside = false
  }
  const down = (e: MouseEvent): void => {
    if (e.button !== 0) return
    e.preventDefault()
    track(e)
    for (const h of handlers) h(pointer.x, pointer.y)
  }
  const block = (e: Event): void => e.preventDefault()

  el.addEventListener('mousemove', track)
  el.addEventListener('mouseenter', track)
  el.addEventListener('mouseleave', leave)
  el.addEventListener('mousedown', down)
  el.addEventListener('contextmenu', block)

  return {
    pointer,
    onClick(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
    destroy() {
      handlers.clear()
      el.removeEventListener('mousemove', track)
      el.removeEventListener('mouseenter', track)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('mousedown', down)
      el.removeEventListener('contextmenu', block)
    },
  }
}
