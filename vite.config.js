import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { APP_PROXY_PREFIX } from './src/configs/index.js'

const siteName = process.env.VITE_APP || 'argos'

export default defineConfig({
  base: `/spc/`,
  plugins: [
    vue(),
    /** setup 语法糖导出 vue 文件name 属性，用于页面 keepAlive */
    VueSetupExtend(),
    tailwindcss(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')], // SVG 图标目录
      symbolId: 'icon-[name]', // 每个图标的 symbol id
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    outDir: `dist/${siteName}`, // 输出目录名
    emptyOutDir: false
  },
  server: {
    host: '0.0.0.0',
    port: 3300,
    proxy: {
      [APP_PROXY_PREFIX]: {
        target: 'https://www.sjiepc.com',
        changeOrigin: true,
        ws: true,
        toProxy: true
      }
    }
  }
})
