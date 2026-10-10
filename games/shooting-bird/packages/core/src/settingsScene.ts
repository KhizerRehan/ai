import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './canvas'
import { drawPanel, drawText } from './hud'
import { drawCheckIcon, drawGearIcon } from './icons'
import type { Pointer } from './input'
import type { Runtime } from './runtime'
import type { Scene } from './scene'
import type { SettingsStore } from './settings'
import { createKidButton, pressButtonAt } from './ui'

export interface SettingsSceneOptions {
  rt: Runtime
  store: SettingsStore
  onBack(): void
  background?: (ctx: CanvasRenderingContext2D) => void
  cursor?: (ctx: CanvasRenderingContext2D, pointer: Pointer) => void
  clickSound?: string
}

const ROW_TOP = 170
const ROW_GAP = 84
const ROW_HEIGHT = 68
const ROW_LEFT = 90
const ROW_WIDTH = LOGICAL_WIDTH - ROW_LEFT * 2
const ARROW_LEFT_X = 590
const ARROW_RIGHT_X = 836
const ARROW_RADIUS = 28
const ARROW_HIT_RADIUS = 36
const VALUE_X = (ARROW_LEFT_X + ARROW_RIGHT_X) / 2

function within(pointer: { x: number; y: number }, cx: number, cy: number, r: number): boolean {
  const dx = pointer.x - cx
  const dy = pointer.y - cy
  return dx * dx + dy * dy <= r * r
}

function drawArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, direction: 1 | -1, hovered: boolean): void {
  ctx.save()
  ctx.fillStyle = hovered ? '#ffd54f' : '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, cy, ARROW_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#263238'
  ctx.beginPath()
  ctx.moveTo(cx + direction * 11, cy)
  ctx.lineTo(cx - direction * 7, cy - 12)
  ctx.lineTo(cx - direction * 7, cy + 12)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function createSettingsScene(o: SettingsSceneOptions): Scene {
  const { rt, store } = o
  const click = (): void => {
    if (o.clickSound) rt.audio.play(o.clickSound)
  }
  const rowY = (index: number): number => ROW_TOP + index * ROW_GAP

  const buttons = [
    createKidButton({
      x: 80,
      y: 76,
      size: 96,
      color: '#43a047',
      icon: drawCheckIcon,
      onPress: () => {
        click()
        o.onBack()
      },
    }),
  ]

  return {
    update() {},
    onKey(key) {
      if (key !== 'escape' && key !== 'enter') return false
      click()
      o.onBack()
      return true
    },
    onClick(x, y) {
      if (pressButtonAt(buttons, x, y)) return
      store.defs.forEach((def, i) => {
        const cy = rowY(i)
        if (within({ x, y }, ARROW_LEFT_X, cy, ARROW_HIT_RADIUS)) {
          store.step(def.key, -1)
          click()
        } else if (within({ x, y }, ARROW_RIGHT_X, cy, ARROW_HIT_RADIUS)) {
          store.step(def.key, 1)
          click()
        }
      })
    },
    draw(ctx) {
      const pointer = rt.input.pointer
      o.background?.(ctx)
      drawPanel(ctx, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT, 'rgba(0, 0, 0, 0.6)', 0)

      ctx.fillStyle = '#ffffff'
      drawGearIcon(ctx, LOGICAL_WIDTH / 2 - 120, 76, 24)
      drawText(ctx, 'Settings', LOGICAL_WIDTH / 2 + 20, 76, { size: 48, align: 'center' })

      store.defs.forEach((def, i) => {
        const cy = rowY(i)
        drawPanel(ctx, ROW_LEFT, cy - ROW_HEIGHT / 2, ROW_WIDTH, ROW_HEIGHT, 'rgba(255, 255, 255, 0.14)', 18)
        drawText(ctx, def.label, ROW_LEFT + 28, cy, { size: 28 })
        const overLeft = pointer.inside && within(pointer, ARROW_LEFT_X, cy, ARROW_HIT_RADIUS)
        const overRight = pointer.inside && within(pointer, ARROW_RIGHT_X, cy, ARROW_HIT_RADIUS)
        drawArrow(ctx, ARROW_LEFT_X, cy, -1, overLeft)
        drawArrow(ctx, ARROW_RIGHT_X, cy, 1, overRight)
        drawText(ctx, store.optionLabel(def.key), VALUE_X, cy, { size: 30, align: 'center', color: '#ffd54f' })
      })

      for (const b of buttons) b.draw(ctx, pointer)
      o.cursor?.(ctx, pointer)
    },
  }
}
