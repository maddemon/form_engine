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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor'
          if (id.includes('node_modules/antd')) return 'ui'
          if (id.includes('node_modules/antd-mobile')) return 'ui-mobile'
          if (id.includes('@babel/standalone')) return 'babel'
          if (/[\\/]packages[\\/](core|adapter-antd|adapter-antd-mobile)[\\/]/.test(id)) return 'form-engine'
        },
      },
    },
  },
})
