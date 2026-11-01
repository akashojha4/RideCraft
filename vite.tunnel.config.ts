import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config'

// Production preview shared through a temporary Cloudflare quick tunnel:
//   npm run build && npx vite preview --config vite.tunnel.config.ts
//   cloudflared tunnel --url http://localhost:4173
export default mergeConfig(
  base,
  defineConfig({
    preview: { port: 4173, strictPort: true, allowedHosts: ['.trycloudflare.com'] },
  }),
)
