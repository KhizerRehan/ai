import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const here = fileURLToPath(new URL('.', import.meta.url))

const standalonePages = [{ route: 'tiny-explorers', file: resolve(here, '../../../tiny-explorers/index.html') }]

function serveStandalonePages(): Plugin {
  return {
    name: 'standalone-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const page = standalonePages.find((p) => req.url === `/${p.route}` || req.url === `/${p.route}/`)
        if (!page) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(readFileSync(page.file))
      })
    },
    closeBundle() {
      for (const page of standalonePages) {
        const dir = resolve(here, 'dist', page.route)
        mkdirSync(dir, { recursive: true })
        copyFileSync(page.file, resolve(dir, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  plugins: [serveStandalonePages()],
  server: {
    port: 5173,
  },
})
