import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  // Relative paths so Electron can load dist/index.html from the filesystem
  base: process.env.ELECTRON === 'true' ? './' : '/',
})
