export const LOGICAL_WIDTH = 960
export const LOGICAL_HEIGHT = 540

export interface FixedCanvas {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  toLogical(clientX: number, clientY: number): { x: number; y: number }
  destroy(): void
}

export function createFixedCanvas(canvas: HTMLCanvasElement): FixedCanvas {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  canvas.width = LOGICAL_WIDTH
  canvas.height = LOGICAL_HEIGHT
  canvas.style.cursor = 'none'
  canvas.style.display = 'block'
  const container = canvas.parentElement ?? document.body

  const resize = (): void => {
    const scale = Math.min(container.clientWidth / LOGICAL_WIDTH, container.clientHeight / LOGICAL_HEIGHT)
    canvas.style.width = `${Math.floor(LOGICAL_WIDTH * scale)}px`
    canvas.style.height = `${Math.floor(LOGICAL_HEIGHT * scale)}px`
  }

  const observer = new ResizeObserver(resize)
  observer.observe(container)
  window.addEventListener('resize', resize)
  resize()

  return {
    canvas,
    ctx,
    toLogical(clientX, clientY) {
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH,
        y: ((clientY - rect.top) / rect.height) * LOGICAL_HEIGHT,
      }
    },
    destroy() {
      observer.disconnect()
      window.removeEventListener('resize', resize)
    },
  }
}
