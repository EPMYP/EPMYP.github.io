module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        // 定义 light 颜色（示例：浅灰色）
        light: '#f3f4f6', 
        // 之前定义的 primary 等颜色可保留
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};