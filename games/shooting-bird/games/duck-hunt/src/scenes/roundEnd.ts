import { drawCheckIcon, drawCrossIcon, drawIconRow, drawPanel, drawText, iconRowWidth, type Scene } from '@kgf/core'
import type { GameContext } from '../context'
import { drawCrosshair } from '../crosshair'
import { Dog } from '../dog'
import { drawDuckIcon } from '../duck'
import { isPerfect, POINTS, roundPassed, type DuckResult, type RoundConfig } from '../rules'
import { drawBackground, drawForeground, W } from '../scenery'
import { GameOverScene } from './gameOver'
import { RoundScene } from './round'

const SHOW_SECONDS = 3.2

export class RoundEndScene implements Scene {
  private readonly dog = new Dog()
  private readonly passed: boolean
  private readonly perfect: boolean
  private readonly finalScore: number
  private t = 0

  constructor(
    private readonly g: GameContext,
    private readonly round: number,
    score: number,
    private readonly hits: number,
    private readonly results: readonly DuckResult[],
    private readonly cfg: RoundConfig,
  ) {
    this.passed = roundPassed(hits, cfg)
    this.perfect = isPerfect(hits, cfg)
    this.finalScore = score + (this.perfect ? POINTS.perfect : 0)
  }

  enter(): void {
    if (this.passed) {
      this.dog.cheer(SHOW_SECONDS)
      this.g.rt.audio.play(this.perfect ? 'perfect' : 'win')
    } else {
      this.dog.laugh(SHOW_SECONDS)
      this.g.rt.audio.play('lose')
    }
  }

  update(dt: number): void {
    this.t += dt
    this.dog.update(dt)
    if (this.t < SHOW_SECONDS) return
    if (this.passed) this.g.rt.scenes.go(new RoundScene(this.g, this.round + 1, this.finalScore))
    else this.g.rt.scenes.go(new GameOverScene(this.g, this.finalScore))
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawBackground(ctx)
    this.dog.draw(ctx)
    drawForeground(ctx)

    const panelW = 560
    const panelH = this.perfect ? 250 : 190
    const panelX = W / 2 - panelW / 2
    const panelY = 60
    drawPanel(ctx, panelX, panelY, panelW, panelH, 'rgba(0, 0, 0, 0.55)', 28)

    ctx.fillStyle = this.passed ? '#69f0ae' : '#ef5350'
    const icon = this.passed ? drawCheckIcon : drawCrossIcon
    icon(ctx, W / 2 - 110, panelY + 60, 34)
    drawText(ctx, `${this.hits} / ${this.cfg.ducksPerRound}`, W / 2 + 30, panelY + 60, {
      size: 56,
      align: 'center',
      color: '#ffffff',
    })

    const count = this.cfg.ducksPerRound
    const gap = 8
    const size = Math.min(40, Math.floor(520 / count) - gap)
    const rowW = iconRowWidth(count, size, gap)
    drawIconRow(ctx, {
      x: W / 2 - rowW / 2,
      y: panelY + 135,
      count,
      size,
      gap,
      drawIcon: (c, i, cx, cy, s) => {
        const r = this.results[i]
        if (r === 'hit') drawDuckIcon(c, cx, cy, s, '#e53935')
        else drawDuckIcon(c, cx, cy, s, 'rgba(255, 255, 255, 0.3)')
      },
    })

    if (this.perfect) {
      const pulse = 1 + Math.sin(this.t * 6) * 0.06
      ctx.save()
      ctx.translate(W / 2, panelY + 205)
      ctx.scale(pulse, pulse)
      drawText(ctx, `+${POINTS.perfect}`, 0, 0, { size: 52, color: '#ffd54f', stroke: '#5d4037', align: 'center' })
      ctx.restore()
    }

    drawCrosshair(ctx, this.g.rt.input.pointer)
  }
}
