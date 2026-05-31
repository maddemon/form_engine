import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,              // 生成 .d.ts 文件
  splitting: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],  // 不打包 react
  sourcemap: true,
  jsx: 'automatic',        // React 17+ JSX 转换
})
