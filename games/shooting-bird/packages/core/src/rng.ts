export const randRange = (min: number, max: number): number => min + Math.random() * (max - min)

export const randInt = (min: number, max: number): number => Math.floor(randRange(min, max + 1))

export const chance = (p: number): boolean => Math.random() < p

export const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]
