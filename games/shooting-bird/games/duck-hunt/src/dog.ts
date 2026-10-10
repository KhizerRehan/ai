import { easeOutCubic } from '@kgf/core'
import { drawDuckBody } from './duck'
import { GROUND_Y } from './scenery'

export type DogState = 'hidden' | 'sniff' | 'jump' | 'laugh' | 'hold' | 'cheer'

const SNIFF_SECONDS = 2.4
const JUMP_SECONDS = 0.8
export const DOG_INTRO_SECONDS = SNIFF_SECONDS + JUMP_SECONDS
export const DOG_REACT_SECONDS = 1.8
const RISE_SECONDS = 0.35
const RISE_DISTANCE = 130
const RISE_OVERSHOOT = 24
const CENTER_X = 480

const FUR = '#a0622d'
const FUR_DARK = '#7a4518'
const SNOUT = '#d9a066'

interface DogPose {
  mouthOpen?: boolean
  armUp?: boolean
  holding?: boolean
  headDown?: boolean
}

export class Dog {
  state: DogState = 'hidden'
  private t = 0
  private duration = 0
  private x = CENTER_X

  startIntro(): void {
    this.state = 'sniff'
    this.t = 0
    this.x = 60
  }

  laugh(duration = DOG_REACT_SECONDS): void {
    this.react('laugh', duration)
  }

  hold(duration = DOG_REACT_SECONDS): void {
    this.react('hold', duration)
  }

  cheer(duration = DOG_REACT_SECONDS): void {
    this.react('cheer', duration)
  }

  hide(): void {
    this.state = 'hidden'
  }

  update(dt: number): void {
    if (this.state === 'hidden') return
    this.t += dt
    switch (this.state) {
      case 'sniff':
        this.x = 60 + (this.t / SNIFF_SECONDS) * 360
        if (this.t >= SNIFF_SECONDS) {
          this.state = 'jump'
          this.t = 0
        }
        break
      case 'jump':
        this.x = 420 + (this.t / JUMP_SECONDS) * 60
        if (this.t >= JUMP_SECONDS) this.state = 'hidden'
        break
      default:
        if (this.t >= this.duration) this.state = 'hidden'
        break
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    switch (this.state) {
      case 'hidden':
        return
      case 'sniff': {
        const bob = Math.abs(Math.sin(this.t * 10)) * 4
        this.drawAt(ctx, this.x, GROUND_Y - bob, { headDown: true })
        return
      }
      case 'jump': {
        const p = this.t / JUMP_SECONDS
        this.drawAt(ctx, this.x, GROUND_Y - Math.sin(Math.PI * p) * 150, {})
        return
      }
      case 'laugh': {
        const bounce = Math.abs(Math.sin(this.t * 12)) * 8
        this.drawAt(ctx, CENTER_X, this.risenY() - bounce, { mouthOpen: true })
        return
      }
      case 'hold':
        this.drawAt(ctx, CENTER_X, this.risenY(), { armUp: true, holding: true })
        return
      case 'cheer': {
        const bounce = Math.abs(Math.sin(this.t * 9)) * 14
        this.drawAt(ctx, CENTER_X, this.risenY() - bounce, { armUp: true, mouthOpen: true })
        return
      }
    }
  }

  private react(state: DogState, duration: number): void {
    this.state = state
    this.t = 0
    this.duration = duration
    this.x = CENTER_X
  }

  private risenY(): number {
    const rise = easeOutCubic(Math.min(this.t / RISE_SECONDS, 1))
    return GROUND_Y + RISE_DISTANCE - rise * (RISE_DISTANCE + RISE_OVERSHOOT)
  }

  private drawAt(ctx: CanvasRenderingContext2D, x: number, feetY: number, pose: DogPose): void {
    ctx.save()
    ctx.translate(x, feetY)

    ctx.fillStyle = FUR_DARK
    ctx.fillRect(-26, -26, 11, 26)
    ctx.fillRect(14, -26, 11, 26)

    ctx.strokeStyle = FUR
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-30, -46)
    ctx.lineTo(-48, -70)
    ctx.stroke()

    ctx.fillStyle = FUR
    ctx.beginPath()
    ctx.ellipse(0, -38, 34, 22, 0, 0, Math.PI * 2)
    ctx.fill()

    if (pose.armUp) {
      ctx.strokeStyle = FUR
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(18, -44)
      ctx.lineTo(26, -104)
      ctx.stroke()
      ctx.fillStyle = FUR_DARK
      ctx.beginPath()
      ctx.arc(26, -106, 7, 0, Math.PI * 2)
      ctx.fill()
      if (pose.holding) {
        ctx.save()
        ctx.translate(26, -132)
        ctx.scale(0.75, 0.75)
        drawDuckBody(ctx, 'fall', 0)
        ctx.restore()
      }
    }

    ctx.save()
    if (pose.headDown) {
      ctx.translate(28, -56)
      ctx.rotate(0.45)
      ctx.translate(-28, 56)
    }

    ctx.fillStyle = FUR
    ctx.beginPath()
    ctx.arc(28, -62, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = FUR_DARK
    ctx.beginPath()
    ctx.ellipse(14, -62, 8, 17, 0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = SNOUT
    ctx.beginPath()
    ctx.ellipse(42, -58, 13, 9, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#222222'
    ctx.beginPath()
    ctx.arc(52, -60, 4.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(32, -68, 5.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#111111'
    ctx.beginPath()
    ctx.arc(33.5, -68, 2.6, 0, Math.PI * 2)
    ctx.fill()

    if (pose.mouthOpen) {
      ctx.fillStyle = '#4a1a1a'
      ctx.beginPath()
      ctx.ellipse(42, -49, 8, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e57373'
      ctx.beginPath()
      ctx.ellipse(42, -46, 4, 3, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    ctx.restore()
  }
}
