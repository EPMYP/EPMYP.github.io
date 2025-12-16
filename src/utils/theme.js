/**
 * 主题管理工具
 * 提供深色/浅色主题切换功能，主题设置保存在localStorage中
 */

// localStorage中存储主题的键名
const THEME_KEY = 'blog_theme';
// 定义支持的主题类型
const THEMES = {
  dark: 'dark',    // 深色主题（黑客帝国风格）
  light: 'light'  // 浅色主题（神经网络风格）
};

/**
 * 获取当前主题
 * @returns {string} 当前主题名称，默认为深色主题
 */
export function getTheme() {
  return localStorage.getItem(THEME_KEY) || THEMES.dark;
}

/**
 * 设置主题
 * @param {string} theme - 主题名称（'dark' 或 'light'）
 */
export function setTheme(theme) {
  // 验证主题是否有效
  if (Object.values(THEMES).includes(theme)) {
    // 保存到localStorage
    localStorage.setItem(THEME_KEY, theme);
    // 应用到页面
    applyTheme(theme);
  }
}

/**
 * 切换主题（在深色和浅色之间切换）
 * @returns {string} 新的主题名称
 */
export function toggleTheme() {
  const currentTheme = getTheme();
  // 如果当前是深色主题，切换到浅色，否则切换到深色
  const newTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
  setTheme(newTheme);
  return newTheme;
}

/**
 * 将主题应用到页面
 * @param {string} theme - 主题名称
 */
export function applyTheme(theme) {
  // 获取根元素（html标签）
  const root = document.documentElement;
  // 设置data-theme属性，CSS会根据此属性应用不同的样式
  root.setAttribute('data-theme', theme);
}

/**
 * 初始化主题（页面加载时调用）
 */
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}

