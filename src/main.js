// 导入Vue核心函数，用于创建Vue应用实例
import { createApp } from 'vue'
// 导入全局样式文件
import './style.css'
// 导入根组件App.vue
import App from './App.vue'
// 导入主题初始化函数
import { initTheme } from './utils/theme.js'

// 初始化主题（从localStorage读取保存的主题设置）
initTheme()

// 创建Vue应用实例并挂载到id为'app'的DOM元素上
createApp(App).mount('#app')
