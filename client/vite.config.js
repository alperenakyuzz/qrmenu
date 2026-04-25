import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hmrHost = process.env.VITE_HMR_HOST
const hmrProtocol = process.env.VITE_HMR_PROTOCOL || 'ws'
const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    ...(hmrHost
      ? {
          hmr: {
            host: hmrHost,
            protocol: hmrProtocol,
            ...(hmrClientPort ? { clientPort: Number(hmrClientPort) } : {}),
          },
        }
      : {}),
    allowedHosts: [
      '5b82-88-253-73-136.ngrok-free.app',
      'menu.asacoffebistro.com',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
