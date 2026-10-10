import { chance, frameAt, randRange } from '@kgf/core'
import type { HitZone } from './rules'
import { GROUND_Y, SKY } from './scenery'

export type DuckState = 'flying' | 'hit' | 'falling' | 'landed' | 'escaping' | 'gone'
export type DuckPose = 'fly' | 'hit' | 'fall'

export interface DuckConfig {
  scale: number
  speed: number
  flightSeconds: number
}

const BODY = '#2b2b36'
const BELLY = '#4a4a5c'
const HEAD = '#1e8c4a'
const BEAK = '#f4a62a'
const WING = '#5c5c74'

export const DUCK_BASE_WIDTH = 80
export const DUCK_BASE_HEIGHT = 60
const HIT_PADDING = 0.2
const FALL_GRAVITY = 1100
const HIT_FREEZE_SECONDS = 0.45
const WING_ANGLES = [-0.8, 0, 0.8]
const FLAP_SEQUENCE = [0, 1, 2, 1]

export function drawDuckBody(ctx: CanvasRenderingContext2D, pose: DuckPose, flapFrame: number): void {
  const wingAngle = pose === 'hit' ? -1.3 : WING_ANGLES[flapFrame]
  ctx.save()
  if (pose === 'fall') ctx.rotate(Math.PI)

  ctx.fillStyle = BODY
  ctx.beginPath()
  ctx.moveTo(-26, 4)
  ctx.lineTo(-42, -8)
  ctx.lineTo(-38, 14)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, 8, 28, 17, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = BELLY
  ctx.beginPath()
  ctx.ellipse(2, 14, 20, 9, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(16, -3, 9, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = HEAD
  ctx.beginPath()
  ctx.arc(22, -12, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = BEAK
  ctx.beginPath()
  ctx.moveTo(31, -15)
  ctx.lineTo(46, -11)
  ctx.lineTo(31, -7)
  ctx.closePath()
  ctx.fill()

  if (pose === 'fly') {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(25, -15, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#111111'
    ctx.beginPath()
    ctx.arc(26, -15, 1.8, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(22, -18)
    ctx.lineTo(28, -12)
    ctx.moveTo(28, -18)
    ctx.lineTo(22, -12)
    ctx.stroke()
  }

  ctx.save()
  ctx.translate(-4, 2)
  ctx.rotate(wingAngle)
  ctx.fillStyle = WING
  ctx.beginPath()
  ctx.ellipse(-6, -14, 10, 20, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}

export function drawDuckIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  outline = false,
): void {
  ctx.save()
  ctx.translate(cx, cy)
  const s = size / DUCK_BASE_WIDTH
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.ellipse(0, 8, 28, 17, 0, 0, Math.PI * 2)
  ctx.moveTo(34, -12)
  ctx.arc(22, -12, 12, 0, Math.PI * 2)
  ctx.moveTo(31, -15)
  ctx.lineTo(46, -11)
  ctx.lineTo(31, -7)
  ctx.closePath()
  if (outline) {
    ctx.strokeStyle = color
    ctx.lineWidth = 4 / s
    ctx.stroke()
  } else {
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.restore()
}

export class Duck {
  x: number
  y: number
  vx: number
  vy: number
  facing: 1 | -1 = 1
  state: DuckState = 'flying'
  private age = 0
  private stateTime = 0
  private turnTimer: number

  constructor(private readonly cfg: DuckConfig) {
    this.x = randRange(SKY.left + 160, SKY.right - 160)
    this.y = GROUND_Y - 30
    this.vx = (chance(0.5) ? 1 : -1) * cfg.speed * 0.45
    this.vy = -cfg.speed
    this.facing = this.vx >= 0 ? 1 : -1
    this.turnTimer = randRange(0.7, 1.2)
  }

  get scale(): number {
    return this.cfg.scale
  }

  get width(): number {
    return DUCK_BASE_WIDTH * this.cfg.scale
  }

  get height(): number {
    return DUCK_BASE_HEIGHT * this.cfg.scale
  }

  update(dt: number): void {
    this.stateTime += dt
    switch (this.state) {
      case 'flying':
        this.fly(dt)
        break
      case 'hit':
        if (this.stateTime >= HIT_FREEZE_SECONDS) {
          this.state = 'falling'
          this.stateTime = 0
          this.vx = 0
          this.vy = 0
        }
        break
      case 'falling':
        this.vy += FALL_GRAVITY * dt
        this.y += this.vy * dt
        if (this.y >= GROUND_Y - 20) {
          this.y = GROUND_Y - 20
          this.state = 'landed'
          this.stateTime = 0
        }
        break
      case 'escaping':
        this.age += dt
        this.vy = -this.cfg.speed * 1.8
        this.x += this.vx * dt
        this.y += this.vy * dt
        if (this.y < -this.height) this.state = 'gone'
        break
      default:
        break
    }
  }

  hit(): void {
    if (this.state !== 'flying') return
    this.state = 'hit'
    this.stateTime = 0
  }

  escape(): void {
    if (this.state !== 'flying') return
    this.state = 'escaping'
    this.stateTime = 0
    this.vx *= 0.5
  }

  hitTest(px: number, py: number): HitZone {
    if (this.state !== 'flying') return 'miss'
    const w = this.width * (1 + HIT_PADDING)
    const h = this.height * (1 + HIT_PADDING)
    const left = this.x - w / 2
    const top = this.y - h / 2
    if (px < left || px > left + w || py < top || py > top + h) return 'miss'
    const inTopHalf = py < this.y
    const inFront = this.facing === 1 ? px > this.x + w * 0.1 : px < this.x - w * 0.1
    return inTopHalf && inFront ? 'head' : 'body'
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.state === 'gone' || this.state === 'landed') return
    const pose: DuckPose =
      this.state === 'hit' ? 'hit' : this.state === 'falling' ? 'fall' : 'fly'
    const frame = FLAP_SEQUENCE[frameAt(this.age, 12, FLAP_SEQUENCE.length)]
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.facing * this.cfg.scale, this.cfg.scale)
    drawDuckBody(ctx, pose, frame)
    ctx.restore()
  }

  private fly(dt: number): void {
    this.age += dt
    if (this.age >= this.cfg.flightSeconds) {
      this.escape()
      return
    }
    this.turnTimer -= dt
    if (this.turnTimer <= 0) {
      this.pickHeading()
      this.turnTimer = randRange(0.5, 1.1)
    }
    this.x += this.vx * dt
    this.y += this.vy * dt

    const hw = this.width / 2
    const hh = this.height / 2
    if (this.x < SKY.left + hw) {
      this.x = SKY.left + hw
      this.vx = Math.abs(this.vx)
    }
    if (this.x > SKY.right - hw) {
      this.x = SKY.right - hw
      this.vx = -Math.abs(this.vx)
    }
    if (this.y < SKY.top + hh) {
      this.y = SKY.top + hh
      this.vy = Math.abs(this.vy)
    }
    if (this.y > SKY.bottom - hh) {
      this.y = SKY.bottom - hh
      this.vy = -Math.abs(this.vy)
    }
    if (this.vx !== 0) this.facing = this.vx > 0 ? 1 : -1
  }

  private pickHeading(): void {
    const upward = chance(0.65)
    const angle = upward
      ? randRange(-Math.PI * 0.85, -Math.PI * 0.15)
      : chance(0.5)
        ? randRange(Math.PI * 0.15, Math.PI * 0.4)
        : randRange(Math.PI * 0.6, Math.PI * 0.85)
    this.vx = Math.cos(angle) * this.cfg.speed
    this.vy = Math.sin(angle) * this.cfg.speed
  }
}
