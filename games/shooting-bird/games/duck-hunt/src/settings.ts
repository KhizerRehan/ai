import { createSettingsStore, type SettingDef, type SettingsStore } from '@kgf/core'
import { DEFAULT_OVERRIDES, type RuleOverrides } from './rules'

export const SETTING_DEFS: readonly SettingDef[] = [
  {
    key: 'ducks',
    label: 'Ducks per round',
    defaultValue: 10,
    options: [3, 5, 10, 15, 20].map((n) => ({ label: String(n), value: n })),
  },
  {
    key: 'shots',
    label: 'Shots per duck',
    defaultValue: 'auto',
    options: [
      { label: 'Auto', value: 'auto' },
      ...[1, 2, 3, 5].map((n) => ({ label: String(n), value: n })),
    ],
  },
  {
    key: 'speed',
    label: 'Duck speed',
    defaultValue: 1,
    options: [
      { label: 'Slow', value: 0.7 },
      { label: 'Normal', value: 1 },
      { label: 'Fast', value: 1.3 },
    ],
  },
  {
    key: 'sound',
    label: 'Sound',
    defaultValue: true,
    options: [
      { label: 'On', value: true },
      { label: 'Off', value: false },
    ],
  },
]

export function createDuckHuntSettings(): SettingsStore {
  return createSettingsStore('duck-hunt', SETTING_DEFS)
}

export function readOverrides(store: SettingsStore): RuleOverrides {
  const ducks = store.get('ducks')
  const shots = store.get('shots')
  const speed = store.get('speed')
  return {
    ducksPerRound: typeof ducks === 'number' ? ducks : DEFAULT_OVERRIDES.ducksPerRound,
    shotsPerDuck: typeof shots === 'number' ? shots : 'auto',
    speedFactor: typeof speed === 'number' ? speed : DEFAULT_OVERRIDES.speedFactor,
  }
}

export function soundEnabled(store: SettingsStore): boolean {
  return store.get('sound') !== false
}
