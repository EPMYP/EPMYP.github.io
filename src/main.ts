import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';
import './style.css';

// 导入Element Plus组件
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 安装插件
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount('#app');