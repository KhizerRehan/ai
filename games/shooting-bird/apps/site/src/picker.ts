import type { GameDefinition } from '@kgf/core'

export function renderPicker(root: HTMLElement, games: readonly GameDefinition[]): void {
  const grid = document.createElement('div')
  grid.className = 'picker'
  for (const game of games) {
    const tile = document.createElement('a')
    tile.className = 'tile'
    tile.href = `#/play/${game.id}`
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
