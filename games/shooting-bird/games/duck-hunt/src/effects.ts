import { drawText, randRange } from '@kgf/core'

interface Sparkle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface Popup {
  x: number
  y: number
  text: string
  life: number
  color: string
}

const SPARKLE_COLORS = ['#ffd54f', '#ffffff', '#ffab40', '#fff59d']
const SPARKLE_LIFE = 0.7
const POPUP_LIFE = 1.1

export class Effects {
  private sparkles: Sparkle[] = []
  private popups: Popup[] = []

  burst(x: number, y: number, count = 16): void {
    for (let i = 0; i < count; i++) {
      const angle = randRange(0, Math.PI * 2)
      const speed = randRange(120, 320)
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        life: SPARKLE_LIFE,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        size: randRange(4, 9),
      })
    }
  }

  popup(x: number, y: number, text: string, color = '#ffd54f'): void {
    this.popups.push({ x, y, text, life: POPUP_LIFE, color })
  }

  update(dt: number): void {
    for (const s of this.sparkles) {
      s.life -= dt
      s.vy += 500 * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
    }
    this.sparkles = this.sparkles.filter((s) => s.life > 0)
    for (const p of this.popups) {
      p.life -= dt
      p.y -= 70 * dt
    }
    this.popups = this.popups.filter((p) => p.life > 0)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    for (const s of this.sparkles) {
      ctx.globalAlpha = Math.max(0, s.life / SPARKLE_LIFE)
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * (s.life / SPARKLE_LIFE), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    for (const p of this.popups) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, p.life / 0.4)
      drawText(ctx, p.text, p.x, p.y, { size: 44, color: p.color, stroke: '#1a1a1a', align: 'center' })
      ctx.restore()
    }
  }
}
