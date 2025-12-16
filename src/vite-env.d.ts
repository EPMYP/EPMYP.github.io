/// <reference types="vite/client" />

// 声明Vue组件模块类型，解决TS导入.vue文件的类型提示问题
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}