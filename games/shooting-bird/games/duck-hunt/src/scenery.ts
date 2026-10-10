import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@kgf/core'

export const W = LOGICAL_WIDTH
export const H = LOGICAL_HEIGHT
export const GROUND_Y = 440
export const SKY = { left: 40, top: 40, right: W - 40, bottom: 350 } as const

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.beginPath()
  ctx.arc(x, y, 26 * s, 0, Math.PI * 2)
  ctx.arc(x + 30 * s, y - 10 * s, 32 * s, 0, Math.PI * 2)
  ctx.arc(x + 64 * s, y, 26 * s, 0, Math.PI * 2)
  ctx.arc(x + 32 * s, y + 10 * s, 28 * s, 0, Math.PI * 2)
  ctx.fill()
}

function drawTree(ctx: CanvasRenderingContext2D, x: number): void {
  ctx.fillStyle = '#7a4b26'
  ctx.fillRect(x - 18, GROUND_Y - 180, 36, 180)
  ctx.fillStyle = '#2e8b3c'
  ctx.beginPath()
  ctx.arc(x, GROUND_Y - 220, 72, 0, Math.PI * 2)
  ctx.arc(x - 62, GROUND_Y - 175, 56, 0, Math.PI * 2)
  ctx.arc(x + 64, GROUND_Y - 180, 58, 0, Math.PI * 2)
  ctx.arc(x, GROUND_Y - 150, 62, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4caf50'
  ctx.beginPath()
  ctx.arc(x - 20, GROUND_Y - 240, 26, 0, Math.PI * 2)
  ctx.arc(x + 40, GROUND_Y - 205, 20, 0, Math.PI * 2)
  ctx.fill()
}

export function drawBackground(ctx: CanvasRenderingContext2D): void {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  sky.addColorStop(0, '#4fb0ff')
  sky.addColorStop(1, '#c6ecff')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, GROUND_Y)

  ctx.fillStyle = '#ffe066'
  ctx.beginPath()
  ctx.arc(830, 90, 46, 0, Math.PI * 2)
  ctx.fill()

  drawCloud(ctx, 200, 110, 1)
  drawCloud(ctx, 540, 70, 0.8)
  drawCloud(ctx, 700, 190, 0.6)

  ctx.fillStyle = '#6cbf5a'
  ctx.beginPath()
  ctx.ellipse(220, GROUND_Y + 10, 440, 95, 0, 0, Math.PI * 2)
  ctx.ellipse(760, GROUND_Y + 20, 400, 75, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#7ccd62'
  ctx.fillRect(0, GROUND_Y - 10, W, H - GROUND_Y + 10)

  drawTree(ctx, 130)

  ctx.fillStyle = '#5aa84a'
  ctx.fillRect(0, GROUND_Y - 10, W, 30)
}

export function drawForeground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#3f9a3a'
  ctx.fillRect(0, GROUND_Y - 30, W, H - GROUND_Y + 30)

  ctx.fillStyle = '#4caf3f'
  ctx.beginPath()
  for (let x = -10; x < W + 40; x += 44) {
    ctx.moveTo(x, GROUND_Y - 28)
    ctx.lineTo(x + 14, GROUND_Y - 62)
    ctx.lineTo(x + 24, GROUND_Y - 28)
    ctx.moveTo(x + 20, GROUND_Y - 28)
    ctx.lineTo(x + 34, GROUND_Y - 50)
    ctx.lineTo(x + 44, GROUND_Y - 28)
  }
  ctx.fill()

  ctx.fillStyle = '#2f7d2d'
  ctx.fillRect(0, H - 40, W, 40)
}
