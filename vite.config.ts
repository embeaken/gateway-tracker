import { readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * Serves netlify/functions/* from the Vite dev server, so `npm run dev` works
 * without `netlify dev`. Each function's `config.path` (with `:param`
 * segments) is matched against the request, like Netlify does in production.
 */
function netlifyFunctionsDev(): Plugin {
  const dir = fileURLToPath(new URL('./netlify/functions', import.meta.url))
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        try {
          for (const file of readdirSync(dir).filter((f) => /\.m?ts$/.test(f))) {
            const mod = await server.ssrLoadModule(`${dir}/${file}`)
            const names: string[] = []
            const pattern = String(mod.config?.path ?? '').replace(/:(\w+)/g, (_, name: string) => {
              names.push(name)
              return '([^/]+)'
            })
            const match = pattern && url.pathname.match(new RegExp(`^${pattern}$`))
            if (!match) continue

            const params = Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(match[i + 1]!)]))
            const response: Response = await mod.default(new Request(url), { params })
            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            res.end(Buffer.from(await response.arrayBuffer()))
            return
          }
          next()
        } catch (e) {
          next(e)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), vueDevTools(), netlifyFunctionsDev()],
})
