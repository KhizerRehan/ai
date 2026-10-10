export interface Scene {
  enter?(): void
  exit?(): void
  update(dt: number): void
  draw(ctx: CanvasRenderingContext2D): void
  onClick?(x: number, y: number): void
  onKey?(key: string): boolean
}

export interface SceneManager {
  readonly current: Scene | null
  go(scene: Scene): void
  update(dt: number): void
  draw(ctx: CanvasRenderingContext2D): void
  click(x: number, y: number): void
  key(key: string): boolean
}

export function createSceneManager(): SceneManager {
  let current: Scene | null = null
  return {
    get current() {
      return current
    },
    go(scene) {
      current?.exit?.()
      current = scene
      scene.enter?.()
    },
    update(dt) {
      current?.update(dt)
    },
    draw(ctx) {
      current?.draw(ctx)
    },
    click(x, y) {
      current?.onClick?.(x, y)
    },
    key(key) {
      return current?.onKey?.(key) ?? false
    },
  }
}
