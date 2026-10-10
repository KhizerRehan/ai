export const HUD_FONT = '"Arial Rounded MT Bold", "Helvetica Rounded", "Nunito", "Segoe UI", Arial, sans-serif'

export interface TextOptions {
  size?: number
  color?: string
  align?: CanvasTextAlign
  stroke?: string
  weight?: string
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: TextOptions = {}): void {
  const size = o.size ?? 32
  ctx.save()
  ctx.font = `${o.weight ?? 'bold'} ${size}px ${HUD_FONT}`
  ctx.textAlign = o.align ?? 'left'
  ctx.textBaseline = 'middle'
  if (o.stroke) {
    ctx.lineWidth = Math.max(2, size / 7)
    ctx.lineJoin = 'round'
    ctx.strokeStyle = o.stroke
    ctx.strokeText(text, x, y)
  }
  ctx.fillStyle = o.color ?? '#ffffff'
  ctx.fillText(text, x, y)
  ctx.restore()
}

export function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = 'rgba(0, 0, 0, 0.45)',
  radius = 16,
): void {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.fill()
  ctx.restore()
}

export interface IconRowOptions {
  x: number
  y: number
  count: number
  size: number
  gap?: number
  drawIcon(ctx: CanvasRenderingContext2D, index: number, cx: number, cy: number, size: number): void
}

export function drawIconRow(ctx: CanvasRenderingContext2D, o: IconRowOptions): void {
  const gap = o.gap ?? 8
  for (let i = 0; i < o.count; i++) {
    const cx = o.x + i * (o.size + gap) + o.size / 2
    o.drawIcon(ctx, i, cx, o.y, o.size)
  }
}

export function iconRowWidth(count: number, size: number, gap = 8): number {
  return count * size + Math.max(0, count - 1) * gap
}
