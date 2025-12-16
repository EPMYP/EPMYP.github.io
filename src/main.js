import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 路由
import pinia from './store';  // 状态管理
import './assets/index.css';  // Tailwind 样式（如果没有这个文件，先创建空文件）

// 1. 创建 App 实例
const app = createApp(App);

// 2. 注册插件（顺序不能乱）
app.use(pinia);   // 先注册 Pinia
app.use(router);  // 再注册路由

// 3. 挂载到页面 #app 元素（必须和 index.html 中的 id 一致）
app.mount('#app');

// 调试：确认挂载成功
console.log('Vue App 挂载成功', app);