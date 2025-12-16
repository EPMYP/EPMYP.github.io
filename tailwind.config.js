/** @type {import('tailwindcss').Config} */
// 注意：文件必须在项目根目录（与 package.json 同级）
module.exports = {
  // 扫描所有可能使用 Tailwind 类的文件（必须覆盖所有组件）
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}" // 关键：确保 src 下所有文件被扫描
  ],
  theme: {
    extend: {
      // 强制定义 primary 颜色（色值可自定义，这里用蓝色示例）
      colors: {
        primary: '#2563eb' // 核心：必须有这行，定义 primary 对应的色值
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography') // 如果你用到了 prose 类，必须保留
  ]
};