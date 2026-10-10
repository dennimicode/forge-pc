import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { rollupOptions: { input: Object.fromEntries(['index', 'catalog', 'configurator', 'service', 'contacts'].map(name => [name, resolve(import.meta.dirname, `${name}.html`)])) } },
})
