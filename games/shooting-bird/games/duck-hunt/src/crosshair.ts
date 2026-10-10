import type { Pointer } from '@kgf/core'

export function drawCrosshair(ctx: CanvasRenderingContext2D, pointer: Pointer): void {
  if (!pointer.inside) return
  const { x, y } = pointer
  ctx.save()
  ctx.lineCap = 'round'

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(x, y, 22, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#e53935'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, 22, 0, Math.PI * 2)
  ctx.moveTo(x - 34, y)
  ctx.lineTo(x - 12, y)
  ctx.moveTo(x + 12, y)
  ctx.lineTo(x + 34, y)
  ctx.moveTo(x, y - 34)
  ctx.lineTo(x, y - 12)
  ctx.moveTo(x, y + 12)
  ctx.lineTo(x, y + 34)
  ctx.stroke()

  ctx.fillStyle = '#e53935'
  ctx.beginPath()
  ctx.arc(x, y, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
