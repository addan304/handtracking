import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  base: '/handtracking/',
  plugins: [
    react()
  ],
  server: {
    https: true,
    host: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443
    }
  }
})

