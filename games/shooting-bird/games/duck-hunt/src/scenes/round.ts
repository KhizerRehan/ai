import {
  drawIconRow,
  drawPanel,
  drawPauseIcon,
  drawStarIcon,
  drawText,
  iconRowWidth,
  type Scene,
} from '@kgf/core'
import type { GameContext } from '../context'
import { drawCrosshair } from '../crosshair'
import { Dog, DOG_INTRO_SECONDS, DOG_REACT_SECONDS } from '../dog'
import { Duck, drawDuckIcon } from '../duck'
import { Effects } from '../effects'
import { duckSpeed, pointsFor, resolveConfig, type DuckResult, type RoundConfig } from '../rules'
import { readOverrides } from '../settings'
import { drawBackground, drawForeground, H, W } from '../scenery'
import { RoundEndScene } from './roundEnd'

type Phase = 'intro' | 'duck' | 'hit' | 'escape' | 'react'

const TALLY_MAX_ICON = 32
const TALLY_MAX_WIDTH = 560
const TALLY_GAP = 8
const PAUSE_X = W / 2
const PAUSE_Y = 46
const PAUSE_RADIUS = 30
const SHOOT_KEYS = ['space', 'enter']

export class RoundScene implements Scene {
  private phase: Phase = 'intro'
  private timer = 0
  private duck: Duck | null = null
  private readonly dog = new Dog()
  private readonly effects = new Effects()
  private readonly cfg: RoundConfig
  private readonly results: DuckResult[]
  private hits = 0
  private duckIndex = 0
  private shotsLeft: number
  private flash = 0

  constructor(
    private readonly g: GameContext,
    private readonly round: number,
    private score: number,
  ) {
    this.cfg = resolveConfig(g.difficulty, readOverrides(g.settings))
    this.results = new Array<DuckResult>(this.cfg.ducksPerRound).fill(null)
    this.shotsLeft = this.cfg.shotsPerDuck
  }

  enter(): void {
    this.dog.startIntro()
    this.phase = 'intro'
    this.timer = 0
  }

  update(dt: number): void {
    this.timer += dt
    this.flash = Math.max(0, this.flash - dt * 6)
    this.effects.update(dt)
    this.dog.update(dt)

    switch (this.phase) {
      case 'intro':
        if (this.timer >= DOG_INTRO_SECONDS) this.spawnDuck()
        break
      case 'duck':
        if (!this.duck) break
        this.duck.update(dt)
        if (this.duck.state === 'escaping') this.markEscape()
        break
      case 'hit':
        if (!this.duck) break
        this.duck.update(dt)
        if (this.duck.state === 'landed') {
          this.g.rt.audio.play('thud')
          this.dog.hold()
          this.phase = 'react'
          this.timer = 0
        }
        break
      case 'escape':
        if (!this.duck) break
        this.duck.update(dt)
        if (this.duck.state === 'gone') {
          this.g.rt.audio.play('laugh')
          this.dog.laugh()
          this.phase = 'react'
          this.timer = 0
        }
        break
      case 'react':
        if (this.timer >= DOG_REACT_SECONDS) this.nextDuck()
        break
    }
  }

  onKey(key: string): boolean {
    if (!SHOOT_KEYS.includes(key)) return false
    const pointer = this.g.rt.input.pointer
    if (pointer.inside) this.onClick(pointer.x, pointer.y)
    return true
  }

  onClick(x: number, y: number): void {
    if (Math.hypot(x - PAUSE_X, y - PAUSE_Y) <= PAUSE_RADIUS + 6) {
      this.g.rt.loop.pause()
      return
    }
    if (this.phase !== 'duck' || !this.duck || this.shotsLeft <= 0) return
    this.shotsLeft--
    this.flash = 1
    this.g.rt.audio.play('shot')

    const zone = this.duck.hitTest(x, y)
    if (zone === 'miss') {
      if (this.shotsLeft === 0) {
        this.duck.escape()
        this.markEscape()
      }
      return
    }

    const points = pointsFor(zone)
    this.score += points
    this.hits++
    this.results[this.duckIndex] = 'hit'
    this.duck.hit()
    this.phase = 'hit'
    this.timer = 0
    this.g.rt.audio.play('hit')
    this.g.rt.audio.play('fall')
    if (zone === 'head') {
      this.g.rt.audio.play('headshot')
      this.effects.burst(x, y)
      this.effects.popup(this.duck.x, this.duck.y - 50, `+${points}`, '#ffd54f')
    } else {
      this.effects.popup(this.duck.x, this.duck.y - 50, `+${points}`, '#ffffff')
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    drawBackground(ctx)
    this.duck?.draw(ctx)
    this.dog.draw(ctx)
    drawForeground(ctx)
    this.effects.draw(ctx)
    this.drawHud(ctx)

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flash * 0.5})`
      ctx.fillRect(0, 0, W, H)
    }

    drawCrosshair(ctx, this.g.rt.input.pointer)
  }

  private spawnDuck(): void {
    this.duck = new Duck({
      scale: this.cfg.duckScale,
      speed: duckSpeed(this.round, this.cfg),
      flightSeconds: this.cfg.flightSeconds,
    })
    this.shotsLeft = this.cfg.shotsPerDuck
    this.phase = 'duck'
    this.timer = 0
    this.g.rt.audio.play('quack')
  }

  private markEscape(): void {
    this.results[this.duckIndex] = 'miss'
    this.phase = 'escape'
    this.timer = 0
    this.g.rt.audio.play('escape')
  }

  private nextDuck(): void {
    this.duckIndex++
    this.duck = null
    if (this.duckIndex >= this.cfg.ducksPerRound) {
      this.g.rt.scenes.go(new RoundEndScene(this.g, this.round, this.score, this.hits, this.results, this.cfg))
      return
    }
    this.spawnDuck()
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    drawPanel(ctx, 20, 16, 150, 60)
    ctx.fillStyle = '#ffd54f'
    drawStarIcon(ctx, 52, 46, 16)
    drawText(ctx, String(this.round), 80, 46, { size: 36 })

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.beginPath()
    ctx.arc(PAUSE_X, PAUSE_Y, PAUSE_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    drawPauseIcon(ctx, PAUSE_X, PAUSE_Y, 18)

    drawPanel(ctx, W - 240, 16, 220, 60)
    drawText(ctx, String(this.score), W - 40, 46, { size: 36, align: 'right' })

    const shotW = iconRowWidth(this.cfg.shotsPerDuck, 18, 10)
    drawPanel(ctx, 20, H - 76, shotW + 36, 60)
    drawIconRow(ctx, {
      x: 38,
      y: H - 46,
      count: this.cfg.shotsPerDuck,
      size: 18,
      gap: 10,
      drawIcon: (c, i, cx, cy) => {
        c.fillStyle = i < this.shotsLeft ? '#ffd54f' : 'rgba(255, 255, 255, 0.25)'
        c.beginPath()
        c.roundRect(cx - 7, cy - 16, 14, 32, 7)
        c.fill()
      },
    })

    const count = this.cfg.ducksPerRound
    const tallyIcon = Math.min(TALLY_MAX_ICON, Math.floor(TALLY_MAX_WIDTH / count) - TALLY_GAP)
    const tallyW = iconRowWidth(count, tallyIcon, TALLY_GAP)
    const tallyX = W / 2 - tallyW / 2
    drawPanel(ctx, tallyX - 18, H - 76, tallyW + 36, 60)
    drawIconRow(ctx, {
      x: tallyX,
      y: H - 46,
      count,
      size: tallyIcon,
      gap: TALLY_GAP,
      drawIcon: (c, i, cx, cy, size) => {
        const r = this.results[i]
        if (r === 'hit') drawDuckIcon(c, cx, cy, size, '#e53935')
        else if (r === 'miss') drawDuckIcon(c, cx, cy, size, 'rgba(255, 255, 255, 0.3)')
        else drawDuckIcon(c, cx, cy, size, '#ffffff', true)
      },
    })

    const markX = tallyX + this.cfg.passLine * (tallyIcon + TALLY_GAP) - TALLY_GAP / 2
    ctx.strokeStyle = '#69f0ae'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(markX, H - 70)
    ctx.lineTo(markX, H - 22)
    ctx.stroke()
  }
}
