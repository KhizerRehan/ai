export type IconDrawer = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void

export const drawPlayIcon: IconDrawer = (ctx, cx, cy, r) => {
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.55, cy - r * 0.75)
  ctx.lineTo(cx + r * 0.8, cy)
  ctx.lineTo(cx - r * 0.55, cy + r * 0.75)
  ctx.closePath()
  ctx.fill()
}

export const drawPauseIcon: IconDrawer = (ctx, cx, cy, r) => {
  const w = r * 0.32
  ctx.fillRect(cx - r * 0.55, cy - r * 0.7, w, r * 1.4)
  ctx.fillRect(cx + r * 0.55 - w, cy - r * 0.7, w, r * 1.4)
}

export const drawReplayIcon: IconDrawer = (ctx, cx, cy, r) => {
  ctx.save()
  ctx.lineWidth = r * 0.26
  ctx.lineCap = 'round'
  ctx.strokeStyle = ctx.fillStyle
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.6, -Math.PI * 0.25, Math.PI * 1.35)
  ctx.stroke()
  const ax = cx + Math.cos(-Math.PI * 0.25) * r * 0.6
  const ay = cy + Math.sin(-Math.PI * 0.25) * r * 0.6
  ctx.beginPath()
  ctx.moveTo(ax + r * 0.3, ay - r * 0.3)
  ctx.lineTo(ax + r * 0.3, ay + r * 0.3)
  ctx.lineTo(ax - r * 0.3, ay + r * 0.05)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export const drawHomeIcon: IconDrawer = (ctx, cx, cy, r) => {
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.8)
  ctx.lineTo(cx + r * 0.85, cy)
  ctx.lineTo(cx + r * 0.6, cy)
  ctx.lineTo(cx + r * 0.6, cy + r * 0.75)
  ctx.lineTo(cx - r * 0.6, cy + r * 0.75)
  ctx.lineTo(cx - r * 0.6, cy)
  ctx.lineTo(cx - r * 0.85, cy)
  ctx.closePath()
  ctx.fill()
}

export const drawStarIcon: IconDrawer = (ctx, cx, cy, r) => {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const x = cx + Math.cos(a) * radius
    const y = cy + Math.sin(a) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

export const drawCheckIcon: IconDrawer = (ctx, cx, cy, r) => {
  ctx.save()
  ctx.lineWidth = r * 0.3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = ctx.fillStyle
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.6, cy)
  ctx.lineTo(cx - r * 0.15, cy + r * 0.5)
  ctx.lineTo(cx + r * 0.7, cy - r * 0.5)
  ctx.stroke()
  ctx.restore()
}

export const drawCrossIcon: IconDrawer = (ctx, cx, cy, r) => {
  ctx.save()
  ctx.lineWidth = r * 0.3
  ctx.lineCap = 'round'
  ctx.strokeStyle = ctx.fillStyle
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.55, cy - r * 0.55)
  ctx.lineTo(cx + r * 0.55, cy + r * 0.55)
  ctx.moveTo(cx + r * 0.55, cy - r * 0.55)
  ctx.lineTo(cx - r * 0.55, cy + r * 0.55)
  ctx.stroke()
  ctx.restore()
}

export const drawGearIcon: IconDrawer = (ctx, cx, cy, r) => {
  const teeth = 8
  ctx.save()
  ctx.translate(cx, cy)
  for (let i = 0; i < teeth; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / teeth)
    ctx.fillRect(-r * 0.2, -r, r * 0.4, r * 0.5)
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2, false)
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.restore()
}
