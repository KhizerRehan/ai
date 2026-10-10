export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const easeInQuad = (t: number): number => t * t

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export function frameAt(time: number, fps: number, frames: number): number {
  return Math.floor(time * fps) % frames
}

export function pingPong(time: number, period: number): number {
  const p = (time % period) / period
  return p < 0.5 ? p * 2 : 2 - p * 2
}
