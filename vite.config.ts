import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from 'vite'
import path from 'path'
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "sass:math";`,
        includePaths: [path.resolve(__dirname, 'app')]
      }
    }
  }
});