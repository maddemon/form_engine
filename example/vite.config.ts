import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      '@form-engine/core': path.resolve(__dirname, '../packages/core/src'),
    },
  },
  build: {
    outDir: 'dist',
  },
})
