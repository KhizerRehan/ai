export type SettingValue = number | string | boolean

export interface SettingOption {
  label: string
  value: SettingValue
}

export interface SettingDef {
  key: string
  label: string
  options: readonly SettingOption[]
  defaultValue: SettingValue
}

export interface SettingsStore {
  readonly defs: readonly SettingDef[]
  get(key: string): SettingValue
  set(key: string, value: SettingValue): void
  step(key: string, direction: 1 | -1): void
  optionLabel(key: string): string
  reset(): void
  onChange(handler: () => void): () => void
}

function readSaved(storageKey: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export function createSettingsStore(gameId: string, defs: readonly SettingDef[]): SettingsStore {
  const storageKey = `kgf:${gameId}:settings`
  const handlers = new Set<() => void>()
  const values = new Map<string, SettingValue>()

  const defFor = (key: string): SettingDef => {
    const def = defs.find((d) => d.key === key)
    if (!def) throw new Error(`Unknown setting: ${key}`)
    return def
  }

  const isAllowed = (def: SettingDef, value: unknown): value is SettingValue =>
    def.options.some((o) => o.value === value)

  const saved = readSaved(storageKey)
  for (const def of defs) {
    const candidate = saved[def.key]
    values.set(def.key, isAllowed(def, candidate) ? candidate : def.defaultValue)
  }

  const persist = (): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(values)))
    } catch {
      return
    }
  }

  const emit = (): void => {
    persist()
    for (const h of handlers) h()
  }

  const store: SettingsStore = {
    defs,
    get(key) {
      const def = defFor(key)
      return values.get(key) ?? def.defaultValue
    },
    set(key, value) {
      const def = defFor(key)
      if (!isAllowed(def, value)) return
      values.set(key, value)
      emit()
    },
    step(key, direction) {
      const def = defFor(key)
      const current = def.options.findIndex((o) => o.value === store.get(key))
      const count = def.options.length
      const next = (Math.max(current, 0) + direction + count) % count
      values.set(key, def.options[next].value)
      emit()
    },
    optionLabel(key) {
      const def = defFor(key)
      const value = store.get(key)
      return def.options.find((o) => o.value === value)?.label ?? String(value)
    },
    reset() {
      for (const def of defs) values.set(def.key, def.defaultValue)
      emit()
    },
    onChange(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
  }

  return store
}
