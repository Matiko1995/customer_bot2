import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'customer-bot': 'src/index.ts'
  },
  format: ['iife'],
  globalName: 'CustomerBotBundle',
  outDir: 'dist',
  outExtension() {
    return {
      js: '.js'
    }
  },
  clean: true,
  minify: false,
  sourcemap: false,
  target: 'es2019'
})
