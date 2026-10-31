import { cp, readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const project = fileURLToPath(new URL('.', import.meta.url))
const frontend = path.resolve(project, '../frontend')
const output = path.resolve(project, 'dist')
const appweb = path.resolve(project, '../Appweb')

// Keep the existing static pages and their classic scripts available in production.
async function htmlEntries(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const results = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory() && entry.name !== 'components') return htmlEntries(file)
    return entry.isFile() && entry.name.endsWith('.html') ? [file] : []
  }))
  return results.flat()
}

export default defineConfig({
  root: frontend,
  publicDir: false,
  appType: 'mpa',
  plugins: [react(), {
    name: 'midec-static-files',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!['/Appweb/', '/Appweb/index.html'].includes(req.url?.split('?')[0])) return next()
        try {
          const html = await readFile(path.join(appweb, 'index.html'))
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (error) {
          next(error)
        }
      })
    },
    async writeBundle() {
      await cp(frontend, output, {
        recursive: true,
        filter: (source) => {
          const relative = path.relative(frontend, source)
          return !relative.split(path.sep).includes('components') &&
            !/\.(html|jsx|md)$/.test(source)
        },
      })
      await cp(appweb, path.join(output, 'Appweb'), { recursive: true })
    },
  }],
  resolve: {
    // Components live in frontend; dependencies are installed in frontend-react.
    alias: [
      { find: /^react-dom(?=\/|$)/, replacement: path.join(project, 'node_modules/react-dom') },
      { find: /^react(?=\/|$)/, replacement: path.join(project, 'node_modules/react') },
    ],
  },
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  preview: { host: '0.0.0.0', port: 4173, strictPort: true },
  build: {
    outDir: output,
    emptyOutDir: true,
    rollupOptions: { input: await htmlEntries(frontend) },
  },
})
