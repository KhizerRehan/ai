import { createRuntime, type GameDefinition } from '@kgf/core'
import type { GameContext } from './context'
import { TitleScene } from './scenes/title'
import { createDuckHuntSettings, soundEnabled } from './settings'
import { defineSounds } from './sounds'

export const duckHunt: GameDefinition = {
  id: 'duck-hunt',
  title: 'Duck Hunt',
  icon: '🦆',
  create(canvas, opts) {
    const settings = createDuckHuntSettings()
    const rt = createRuntime(canvas, {
      onQuit: opts.onHome,
      onKey: (key) => {
        if (key !== 'm') return false
        settings.step('sound', 1)
        return true
      },
    })
    defineSounds(rt.audio)
    rt.audio.muted = !soundEnabled(settings)
    settings.onChange(() => {
      rt.audio.muted = !soundEnabled(settings)
    })
    const g: GameContext = { rt, difficulty: 'normal', settings, onHome: opts.onHome }
    rt.scenes.go(new TitleScene(g))
    rt.loop.start()
    return { destroy: () => rt.destroy() }
  },
}
