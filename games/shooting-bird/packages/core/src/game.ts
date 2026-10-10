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

export interface ExternalGameDefinition {
  id: string
  title: string
  icon: string
  href: string
}

export type GameEntry = GameDefinition | ExternalGameDefinition

export function isPlayable(entry: GameEntry): entry is GameDefinition {
  return 'create' in entry
}
