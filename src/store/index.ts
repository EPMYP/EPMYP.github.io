// 导入Pinia的createPinia函数，用于创建Pinia实例
import { createPinia } from 'pinia';

// 创建Pinia实例（全局状态管理容器）
const pinia = createPinia();

// 导出Pinia实例，供main.ts导入使用
export default pinia;