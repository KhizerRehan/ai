export interface LoopCallbacks {
  update(dt: number): void
  draw(): void
}

export interface GameLoop {
  readonly running: boolean
  readonly paused: boolean
  start(): void
  stop(): void
  pause(): void
  resume(): void
}

const MAX_DT = 1 / 20

export function createGameLoop(callbacks: LoopCallbacks): GameLoop {
  let running = false
  let paused = false
  let last = 0
  let frame = 0

  const tick = (now: number): void => {
    if (!running) return
    const dt = Math.min((now - last) / 1000, MAX_DT)
    last = now
    if (!paused) callbacks.update(dt)
    callbacks.draw()
    frame = requestAnimationFrame(tick)
  }

  const onVisibility = (): void => {
    if (document.hidden) loop.pause()
  }
  const onBlur = (): void => loop.pause()

  const loop: GameLoop = {
    get running() {
      return running
    },
    get paused() {
      return paused
    },
    start() {
      if (running) return
      running = true
      last = performance.now()
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('blur', onBlur)
      frame = requestAnimationFrame(tick)
    },
    stop() {
      running = false
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    },
    pause() {
      paused = true
    },
    resume() {
      paused = false
      last = performance.now()
    },
  }

  return loop
}
