import { isPlayable, type GameHandle } from '@kgf/core'
import { renderPicker } from './picker'
import { games } from './registry'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('Missing #app root')
const app: HTMLDivElement = root

let handle: GameHandle | null = null

function route(): void {
  handle?.destroy()
  handle = null
  app.replaceChildren()

  const match = /^#\/play\/([\w-]+)$/.exec(location.hash)
  const game = match ? games.filter(isPlayable).find((g) => g.id === match[1]) : undefined

  if (!game) {
    if (location.hash && location.hash !== '#/') {
      location.hash = '#/'
      return
    }
    renderPicker(app, games)
    return
  }

  const stage = document.createElement('div')
  stage.className = 'stage'
  const canvas = document.createElement('canvas')
  stage.append(canvas)
  app.append(stage)
  handle = game.create(canvas, {
    onHome: () => {
      location.hash = '#/'
    },
  })
}

window.addEventListener('hashchange', route)
route()
