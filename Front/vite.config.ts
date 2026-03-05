import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // tudo que começar com /api vai para sua API em 5080
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
        // se a sua API não remove o prefixo /api, deixe sem rewrite
        // rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
