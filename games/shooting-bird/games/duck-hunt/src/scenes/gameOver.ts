import {
  createKidButton,
  drawHomeIcon,
  drawPanel,
  drawReplayIcon,
  drawStarIcon,
  drawText,
  pressButtonAt,
  type KidButton,
  type Scene,
} from '@kgf/core'
import type { GameContext } from '../context'
import { drawCrosshair } from '../crosshair'
import { drawBackground, drawForeground, W } from '../scenery'
import { RoundScene } from './round'

const GAME_OVER_KEYS: Record<string, number | undefined> = { enter: 0, space: 0, r: 0, h: 1 }

export class GameOverScene implements Scene {
  private readonly buttons: KidButton[]

  constructor(
    private readonly g: GameContext,
    private readonly score: number,
  ) {
    this.buttons = [
      createKidButton({
        x: 390,
        y: 360,
        size: 140,
        color: '#43a047',
        icon: drawReplayIcon,
        onPress: () => {
          g.rt.audio.play('click')
          g.rt.scenes.go(new RoundScene(g, 1, 0))
        },
      }),
      createKidButton({
        x: 570,
        y: 360,
        size: 140,
        color: '#546e7a',
        icon: drawHomeIcon,
        onPress: () => g.onHome(),
      }),
    ]
  }

  update(): void {}

  onClick(x: number, y: number): void {
    pressButtonAt(this.buttons, x, y)
  }

  onKey(key: string): boolean {
    const index = GAME_OVER_KEYS[key]
    if (index === undefined) return false
    this.buttons[index].press()
    return true
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawBackground(ctx)
    drawForeground(ctx)

    drawPanel(ctx, W / 2 - 240, 90, 480, 130, 'rgba(0, 0, 0, 0.55)', 28)
    ctx.fillStyle = '#ffd54f'
    drawStarIcon(ctx, W / 2 - 150, 155, 36)
    drawText(ctx, String(this.score), W / 2 + 30, 155, { size: 80, align: 'center', color: '#ffffff' })

    for (const b of this.buttons) b.draw(ctx, this.g.rt.input.pointer)
    drawCrosshair(ctx, this.g.rt.input.pointer)
  }
}
