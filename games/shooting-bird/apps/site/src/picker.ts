import { isPlayable, type GameEntry } from '@kgf/core'

export function renderPicker(root: HTMLElement, games: readonly GameEntry[]): void {
  const grid = document.createElement('div')
  grid.className = 'picker'
  for (const game of games) {
    const tile = document.createElement('a')
    tile.className = 'tile'
    tile.href = isPlayable(game) ? `#/play/${game.id}` : game.href
    const icon = document.createElement('div')
    icon.className = 'tile-icon'
    icon.textContent = game.icon
    const title = document.createElement('div')
    title.className = 'tile-title'
    title.textContent = game.title
    tile.append(icon, title)
    grid.append(tile)
  }
  root.append(grid)
}
