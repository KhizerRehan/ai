export type Difficulty = 'easy' | 'normal'

export interface DifficultyPreset {
  shotsPerDuck: number
  passRatio: number
  duckScale: number
  speedMultiplier: number
  flightSeconds: number
}

export interface RuleOverrides {
  ducksPerRound: number
  shotsPerDuck: number | 'auto'
  speedFactor: number
}

export interface RoundConfig {
  ducksPerRound: number
  shotsPerDuck: number
  passLine: number
  duckScale: number
  speedMultiplier: number
  flightSeconds: number
}

export const DEFAULT_DUCKS_PER_ROUND = 10
export const MAX_SPEED_ROUND = 10
export const SPEED_STEP = 0.1
export const BASE_DUCK_SPEED = 230

export const DIFFICULTY: Record<Difficulty, DifficultyPreset> = {
  normal: { shotsPerDuck: 3, passRatio: 0.6, duckScale: 1, speedMultiplier: 1, flightSeconds: 6 },
  easy: { shotsPerDuck: 5, passRatio: 0.4, duckScale: 1.5, speedMultiplier: 0.6, flightSeconds: 8 },
}

export const DEFAULT_OVERRIDES: RuleOverrides = {
  ducksPerRound: DEFAULT_DUCKS_PER_ROUND,
  shotsPerDuck: 'auto',
  speedFactor: 1,
}

export const POINTS = { body: 100, head: 300, perfect: 1000 } as const

export type HitZone = 'head' | 'body' | 'miss'

export type DuckResult = 'hit' | 'miss' | null

export function resolveConfig(difficulty: Difficulty, overrides: RuleOverrides = DEFAULT_OVERRIDES): RoundConfig {
  const preset = DIFFICULTY[difficulty]
  const ducksPerRound = Math.max(1, Math.round(overrides.ducksPerRound))
  return {
    ducksPerRound,
    shotsPerDuck: overrides.shotsPerDuck === 'auto' ? preset.shotsPerDuck : Math.max(1, overrides.shotsPerDuck),
    passLine: Math.max(1, Math.ceil(ducksPerRound * preset.passRatio)),
    duckScale: preset.duckScale,
    speedMultiplier: preset.speedMultiplier * overrides.speedFactor,
    flightSeconds: preset.flightSeconds,
  }
}

export function roundSpeed(round: number): number {
  const capped = Math.min(Math.max(round, 1), MAX_SPEED_ROUND)
  return 1 + SPEED_STEP * (capped - 1)
}

export function pointsFor(zone: HitZone): number {
  if (zone === 'head') return POINTS.head
  if (zone === 'body') return POINTS.body
  return 0
}

export function roundPassed(hits: number, cfg: RoundConfig): boolean {
  return hits >= cfg.passLine
}

export function isPerfect(hits: number, cfg: RoundConfig): boolean {
  return hits === cfg.ducksPerRound
}

export function duckSpeed(round: number, cfg: RoundConfig): number {
  return BASE_DUCK_SPEED * cfg.speedMultiplier * roundSpeed(round)
}
