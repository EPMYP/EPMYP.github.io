// vite.config.js（修改后完整代码）
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // 加载环境变量（兼容 ESM/CJS）
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [vue()],
    // 适配 GitHub Pages：用户主页仓库（xxx.github.io）base 必须为 '/'
    base: mode === 'production' ? '/' : '/',
    server: {
      open: true,
      port: 3000
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    }
  };
});