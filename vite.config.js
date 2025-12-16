// 导入Vite配置函数和Vue插件
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 获取基础路径（用于GitHub Pages部署）
 * GitHub Pages部署时，URL格式为：https://username.github.io/repo-name/
 * 因此需要设置base路径为仓库名
 * @returns {string} 基础路径
 */
const getBasePath = () => {
  // 生产环境（GitHub Pages部署）
  if (process.env.NODE_ENV === 'production') {
    // 如果设置了VITE_BASE_PATH环境变量，优先使用
    if (process.env.VITE_BASE_PATH) {
      return process.env.VITE_BASE_PATH
    }
    // 默认使用仓库名（需要根据实际仓库名修改）
    // 例如：如果仓库名是 my-secure-blog，则返回 '/my-secure-blog/'
    return '/my-secure-blog/'
  }
  // 开发环境使用根路径
  return '/'
}

// Vite配置文件
// 参考文档：https://vite.dev/config/
export default defineConfig({
  // Vue插件，用于处理.vue文件
  plugins: [vue()],
  // 基础路径（用于GitHub Pages部署）
  base: getBasePath(),
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 不生成sourcemap（生产环境）
    sourcemap: false,
    // 使用esbuild进行代码压缩
    minify: 'esbuild',
    // Rollup打包选项
    rollupOptions: {
      output: {
        // 手动代码分割，将大型库单独打包
        manualChunks: {
          // Vue核心库单独打包
          'vue-vendor': ['vue'],
          // 工具库单独打包（axios、marked、highlight.js）
          'utils': ['axios', 'marked', 'highlight.js']
        }
      }
    }
  },
  // 开发服务器配置
  server: {
    // 开发服务器端口
    port: 5173,
    // 代理配置（开发环境API请求转发）
    proxy: {
      // 所有以/api开头的请求都转发到后端服务器
      '/api': {
        // 后端服务器地址（使用环回IP，端口3000）
        target: 'http://127.0.0.1:3000',
        // 改变请求头中的origin
        changeOrigin: true,
        // 重写路径（可选，保持原路径）
        rewrite: (path) => path
      }
    }
  }
})
