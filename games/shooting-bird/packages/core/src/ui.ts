import type { IconDrawer } from './icons'
import type { Pointer } from './input'

export const MIN_BUTTON_SIZE = 96

export interface KidButtonOptions {
  x: number
  y: number
  size?: number
  color: string
  icon: IconDrawer
  onPress(): void
  selected?: () => boolean
}

export interface KidButton {
  readonly x: number
  readonly y: number
  readonly size: number
  contains(px: number, py: number): boolean
  draw(ctx: CanvasRenderingContext2D, pointer: Pointer): void
  press(): void
}

export function createKidButton(o: KidButtonOptions): KidButton {
  const size = Math.max(MIN_BUTTON_SIZE, o.size ?? MIN_BUTTON_SIZE)
  const r = size / 2

  const contains = (px: number, py: number): boolean => {
    const dx = px - o.x
    const dy = py - o.y
    return dx * dx + dy * dy <= r * r
  }

  return {
    x: o.x,
    y: o.y,
    size,
    contains,
    press: o.onPress,
    draw(ctx, pointer) {
      const hovered = pointer.inside && contains(pointer.x, pointer.y)
      const selected = o.selected?.() ?? false
      const scale = hovered ? 1.08 : 1
      ctx.save()
      ctx.translate(o.x, o.y)
      ctx.scale(scale, scale)

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.beginPath()
      ctx.arc(0, 6, r, 0, Math.PI * 2)
      ctx.fill()

      if (selected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.arc(0, 0, r + 6, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.fillStyle = o.color
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
      ctx.beginPath()
      ctx.ellipse(0, -r * 0.35, r * 0.7, r * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      o.icon(ctx, 0, 0, r * 0.6)
      ctx.restore()
    },
  }
}

export function pressButtonAt(buttons: readonly KidButton[], x: number, y: number): boolean {
  for (const b of buttons) {
    if (b.contains(x, y)) {
      b.press()
      return true
    }
  }
  return false
}
