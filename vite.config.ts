import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, normalize } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const BASE = '/claudecertificationfoundation'
const SEO_DIR = join(__dirname, 'seo-pages')

function contentTypeFor(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8'
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

function resolveSeoFile(urlPath: string): string | null {
  let relative = decodeURIComponent(urlPath.split('?')[0] ?? '')
  if (relative.startsWith(BASE)) relative = relative.slice(BASE.length)
  if (!relative.startsWith('/')) relative = `/${relative}`

  const candidates = [
    relative,
    relative.endsWith('/') ? `${relative}index.html` : `${relative}/index.html`,
  ]

  for (const candidate of candidates) {
    const full = normalize(join(SEO_DIR, candidate.replace(/^\//, '')))
    if (!full.startsWith(SEO_DIR)) continue
    if (existsSync(full) && statSync(full).isFile()) return full
  }
  return null
}

function seoStaticMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next()
    return
  }

  const url = req.url ?? ''
  if (!url.startsWith(BASE)) {
    next()
    return
  }

  // Leave the SPA entry and Vite tooling alone.
  const pathOnly = url.slice(BASE.length).split('?')[0] ?? ''
  if (
    pathOnly === '' ||
    pathOnly === '/' ||
    pathOnly.startsWith('/src/') ||
    pathOnly.startsWith('/@') ||
    pathOnly.startsWith('/node_modules/') ||
    pathOnly.startsWith('/assets/')
  ) {
    next()
    return
  }

  const file = resolveSeoFile(url)
  if (!file) {
    next()
    return
  }

  const body = readFileSync(file)
  res.statusCode = 200
  res.setHeader('Content-Type', contentTypeFor(file))
  res.setHeader('Content-Length', String(body.length))
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  res.end(body)
}

function seoPagesPlugin(): Plugin {
  return {
    name: 'seo-pages-dev-server',
    configureServer(server) {
      server.middlewares.use(seoStaticMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(seoStaticMiddleware)
    },
  }
}

// GitHub Pages serves from https://<user>.github.io/<repo>/
export default defineConfig({
  base: `${BASE}/`,
  plugins: [react(), tailwindcss(), seoPagesPlugin()],
})
