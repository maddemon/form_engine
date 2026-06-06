import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', '@form-engine/core', 'antd', '@ant-design/icons'],
  sourcemap: true,
  jsx: 'automatic',
})
