import {
  createKidButton,
  createSettingsScene,
  drawGearIcon,
  drawHomeIcon,
  drawPlayIcon,
  drawText,
  pressButtonAt,
  type KidButton,
  type Scene,
} from '@kgf/core'
import type { GameContext } from '../context'
import { drawCrosshair } from '../crosshair'
import { drawDuckBody, drawDuckIcon } from '../duck'
import { drawBackground, drawForeground, W } from '../scenery'
import { RoundScene } from './round'

const TITLE_KEYS: Record<string, number | undefined> = { enter: 0, space: 0, '1': 1, '2': 2, s: 4 }

export class TitleScene implements Scene {
  private readonly buttons: KidButton[]
  private t = 0

  constructor(private readonly g: GameContext) {
    this.buttons = [
      createKidButton({
        x: 480,
        y: 265,
        size: 150,
        color: '#e53935',
        icon: drawPlayIcon,
        onPress: () => {
          g.rt.audio.play('click')
          g.rt.scenes.go(new RoundScene(g, 1, 0))
        },
      }),
      createKidButton({
        x: 370,
        y: 430,
        size: 110,
        color: '#43a047',
        icon: (ctx, cx, cy, r) => drawDuckIcon(ctx, cx - r * 0.15, cy, r * 2.3, '#ffffff'),
        selected: () => g.difficulty === 'easy',
        onPress: () => {
          g.difficulty = 'easy'
          g.rt.audio.play('click')
        },
      }),
      createKidButton({
        x: 590,
        y: 430,
        size: 110,
        color: '#fb8c00',
        icon: (ctx, cx, cy, r) => drawDuckIcon(ctx, cx - r * 0.1, cy, r * 1.3, '#ffffff'),
        selected: () => g.difficulty === 'normal',
        onPress: () => {
          g.difficulty = 'normal'
          g.rt.audio.play('click')
        },
      }),
      createKidButton({
        x: 80,
        y: 80,
        size: 96,
        color: '#546e7a',
        icon: drawHomeIcon,
        onPress: () => g.onHome(),
      }),
      createKidButton({
        x: 880,
        y: 80,
        size: 96,
        color: '#546e7a',
        icon: drawGearIcon,
        onPress: () => {
          g.rt.audio.play('click')
          g.rt.scenes.go(
            createSettingsScene({
              rt: g.rt,
              store: g.settings,
              clickSound: 'click',
              cursor: drawCrosshair,
              background: (ctx) => {
                drawBackground(ctx)
                drawForeground(ctx)
              },
              onBack: () => g.rt.scenes.go(new TitleScene(g)),
            }),
          )
        },
      }),
    ]
  }

  update(dt: number): void {
    this.t += dt
  }

  onClick(x: number, y: number): void {
    pressButtonAt(this.buttons, x, y)
  }

  onKey(key: string): boolean {
    const index = TITLE_KEYS[key]
    if (index === undefined) return false
    this.buttons[index].press()
    return true
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawBackground(ctx)

    const duckX = ((this.t * 140) % (W + 240)) - 120
    const duckY = 150 + Math.sin(this.t * 2.2) * 30
    ctx.save()
    ctx.translate(duckX, duckY)
    ctx.scale(1.3, 1.3)
    drawDuckBody(ctx, 'fly', [0, 1, 2, 1][Math.floor(this.t * 12) % 4])
    ctx.restore()

    drawForeground(ctx)

    drawText(ctx, 'DUCK HUNT', 480, 110, { size: 84, color: '#ffeb3b', stroke: '#5d4037', align: 'center' })

    for (const b of this.buttons) b.draw(ctx, this.g.rt.input.pointer)
    drawCrosshair(ctx, this.g.rt.input.pointer)
  }
}
