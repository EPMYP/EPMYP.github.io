/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 确保扫描到项目中的所有组件
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // 注册typography插件
  ],
}