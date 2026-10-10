import { createAudioBus, type AudioBus } from './audio'
import { createFixedCanvas, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './canvas'
import { drawText } from './hud'
import { drawHomeIcon, drawPlayIcon } from './icons'
import { createMouseInput, type MouseInput, type Pointer } from './input'
import { createKeyboardInput, type KeyboardInput } from './keyboard'
import { createGameLoop, type GameLoop } from './loop'
import { createSceneManager, type SceneManager } from './scene'
import { createKidButton, pressButtonAt, type KidButton } from './ui'

export interface RuntimeOptions {
  onQuit?(): void
  onKey?(key: string): boolean
}

export interface Runtime {
  readonly ctx: CanvasRenderingContext2D
  readonly width: number
  readonly height: number
  readonly input: MouseInput
  readonly keyboard: KeyboardInput
  readonly audio: AudioBus
  readonly scenes: SceneManager
  readonly loop: GameLoop
  toggleFullscreen(): void
  destroy(): void
}

const RESUME_KEYS = ['escape', 'p', 'enter', 'space']
const PAUSE_KEYS = ['escape', 'p']
const PAUSE_BUTTON_SIZE = 140
const PAUSE_BUTTON_OFFSET = 95

function drawPointer(ctx: CanvasRenderingContext2D, pointer: Pointer): void {
  if (!pointer.inside) return
  ctx.save()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(pointer.x, pointer.y, 12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(pointer.x, pointer.y, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function createRuntime(canvasEl: HTMLCanvasElement, opts: RuntimeOptions = {}): Runtime {
  const fixed = createFixedCanvas(canvasEl)
  const input = createMouseInput(fixed)
  const keyboard = createKeyboardInput()
  const audio = createAudioBus()
  const scenes = createSceneManager()
  const ctx = fixed.ctx
  const centerX = LOGICAL_WIDTH / 2
  const centerY = LOGICAL_HEIGHT / 2
  const quit = opts.onQuit

  const pauseButtons: KidButton[] = [
    createKidButton({
      x: quit ? centerX - PAUSE_BUTTON_OFFSET : centerX,
      y: centerY,
      size: PAUSE_BUTTON_SIZE,
      color: '#43a047',
      icon: drawPlayIcon,
      onPress: () => loop.resume(),
    }),
  ]
  if (quit) {
    pauseButtons.push(
      createKidButton({
        x: centerX + PAUSE_BUTTON_OFFSET,
        y: centerY,
        size: PAUSE_BUTTON_SIZE,
        color: '#546e7a',
        icon: drawHomeIcon,
        onPress: () => quit(),
      }),
    )
  }

  const drawPausedOverlay = (): void => {
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
    ctx.restore()
    for (const b of pauseButtons) b.draw(ctx, input.pointer)
    const hintY = centerY + PAUSE_BUTTON_SIZE / 2 + 34
    const hint = { size: 22, align: 'center' as const, color: 'rgba(255, 255, 255, 0.85)' }
    drawText(ctx, 'Esc', pauseButtons[0].x, hintY, hint)
    if (quit) drawText(ctx, 'Q', pauseButtons[1].x, hintY, hint)
    drawPointer(ctx, input.pointer)
  }

  const toggleFullscreen = (): void => {
    const target = canvasEl.parentElement ?? canvasEl
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    else void target.requestFullscreen().catch(() => undefined)
  }

  const loop = createGameLoop({
    update: (dt) => scenes.update(dt),
    draw: () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
      scenes.draw(ctx)
      if (loop.paused) drawPausedOverlay()
    },
  })

  const offClick = input.onClick((x, y) => {
    if (loop.paused) {
      if (!pressButtonAt(pauseButtons, x, y)) loop.resume()
      return
    }
    scenes.click(x, y)
  })

  const offKey = keyboard.onKey((key) => {
    if (loop.paused) {
      if (RESUME_KEYS.includes(key)) {
        loop.resume()
        return true
      }
      if (key === 'q' && quit) {
        quit()
        return true
      }
      return false
    }
    if (scenes.key(key)) return true
    if (opts.onKey?.(key)) return true
    if (PAUSE_KEYS.includes(key)) {
      loop.pause()
      return true
    }
    if (key === 'f') {
      toggleFullscreen()
      return true
    }
    return false
  })

  return {
    ctx,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    input,
    keyboard,
    audio,
    scenes,
    loop,
    toggleFullscreen,
    destroy() {
      loop.stop()
      offClick()
      offKey()
      scenes.current?.exit?.()
      input.destroy()
      keyboard.destroy()
      audio.destroy()
      fixed.destroy()
    },
  }
}
