import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const siteName = process.env.VITE_APP || 'argos'

export default defineConfig({
  base: `/spc/`,
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    outDir: `dist/${siteName}`, // 输出目录名
    emptyOutDir: false
  }
})
