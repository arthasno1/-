import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  /** 部署到 GitHub Pages 子路径时用相对路径加载资源，避免 404 */
  base: './',

  /** 路径别名：@ 指向 src 目录 */
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname!, 'src')
    }
  },

  /** 开发服务器配置：跨域代理 */
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  /** 构建优化 */
  build: {
    /** CSS 拆成独立文件，不混在 JS 里 */
    cssCodeSplit: true,

    /** 小于 4KB 的图片转 base64 内联，减少 HTTP（超文本传输协议）请求 */
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        /** 第三方依赖拆成独立 chunk（块），用户改业务代码后浏览器只重新下载业务部分 */
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // vue 相关放一起，其他三方库放一起
            if (id.includes('node_modules/vue')) return 'vendor-vue'
            return 'vendor-libs'
          }
        },
        /** chunk（块）命名更清晰 */
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
})
