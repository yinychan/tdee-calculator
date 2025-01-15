import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from 'vite'
import path from 'path'
import tsconfigPaths from "vite-tsconfig-paths"
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    remix({
      ssr: false,
    }), 
    tsconfigPaths()
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "sass:math";`,
        includePaths: [path.resolve(__dirname, 'app')]
      }
    }
  }
});