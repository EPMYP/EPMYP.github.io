/** @type {import('tailwindcss').Config} */
module.exports = {
  // 确保扫描范围包含所有组件文件
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 关键：覆盖src下所有组件
  ],
  theme: {
    extend: {
      // 必须在这里定义primary颜色
      colors: {
        primary: '#2563eb', // 示例：蓝色（可替换为你的主色）
      },
    },
  },
  // 确保typography插件已配置（如果之前加过）
  plugins: [require('@tailwindcss/typography')],
};