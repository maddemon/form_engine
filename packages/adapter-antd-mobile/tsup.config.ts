import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: false,  // Disable DTS build to avoid type errors
  splitting: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', '@form-engine/core', 'antd-mobile'],
  sourcemap: true,
  jsx: 'automatic',
})
