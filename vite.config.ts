// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // 确保导入了path模块

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 关键配置：@指向src目录
      '@': path.resolve(__dirname, './src'), 
    },
  },
  // 其他配置...
});