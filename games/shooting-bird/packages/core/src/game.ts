export interface GameOptions {
  onHome(): void
}

export interface GameHandle {
  destroy(): void
}

export interface GameDefinition {
  id: string
  title: string
  icon: string
  create(canvas: HTMLCanvasElement, opts: GameOptions): GameHandle
}
