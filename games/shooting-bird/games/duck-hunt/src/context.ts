import type { Runtime, SettingsStore } from '@kgf/core'
import type { Difficulty } from './rules'

export interface GameContext {
  rt: Runtime
  difficulty: Difficulty
  settings: SettingsStore
  onHome(): void
}
