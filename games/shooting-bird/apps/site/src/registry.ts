import type { GameEntry } from '@kgf/core'
import { duckHunt } from '@kgf/duck-hunt'

export const games: readonly GameEntry[] = [
  duckHunt,
  { id: 'tiny-explorers', title: 'Tiny Explorers', icon: '🧭', href: 'tiny-explorers/' },
]
