<!-- 黑客代码雨背景组件 -->
<template>
  <!-- Canvas画布，用于绘制代码雨动画 -->
  <canvas ref="canvasRef" class="code-rain"></canvas>
</template>

<script setup>
// 导入Vue组合式API函数
import { ref, onMounted, onUnmounted, watch } from 'vue';
// 导入主题工具函数
import { getTheme } from '../utils/theme.js';

// Canvas元素的引用
const canvasRef = ref(null);
// 动画帧ID，用于取消动画
let animationId = null;
// 代码雨的列数
let columns = [];
// 字体大小（像素）
let fontSize = 14;
// 每列字符的下落位置数组
let drops = [];

// 字符集 - 包含数字、字母、日文假名和特殊字符，用于代码雨效果
const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * 初始化Canvas画布
 * 设置画布大小并开始绘制动画
 */
const initCanvas = () => {
  const canvas = canvasRef.value;
  // 如果canvas元素不存在，直接返回
  if (!canvas) return;

  // 获取2D绘图上下文
  const ctx = canvas.getContext('2d');
  // 获取父容器或使用body元素
  const container = canvas.parentElement || document.body;
  
  // 设置画布宽度为容器宽度或窗口宽度
  canvas.width = container.clientWidth || window.innerWidth;
  // 设置画布高度为容器高度或窗口高度
  canvas.height = container.clientHeight || window.innerHeight;

  // 根据画布宽度和字体大小计算可以显示的列数
  columns = Math.floor(canvas.width / fontSize);
  // 初始化每列的起始位置（从顶部开始）
  drops = Array(columns).fill(1);

  // 开始绘制动画
  draw(ctx, canvas);
};

const draw = (ctx, canvas) => {
  const theme = getTheme();
  
  // 根据主题设置颜色 - 夜间模式：绿色系黑客风格
  const colors = {
    dark: {
      primary: 'rgba(0, 255, 0, 0.9)',      // 亮绿色
      secondary: 'rgba(0, 200, 0, 0.7)',    // 中绿色
      accent: 'rgba(0, 150, 0, 0.5)',      // 暗绿色
      highlight: 'rgba(255, 255, 255, 0.8)', // 高亮白色
      fade: 'rgba(0, 0, 0, 0.03)'          // 淡黑色拖尾
    },
    light: {
      primary: 'rgba(0, 100, 255, 0.85)',   // 深蓝色 - 高可见度
      secondary: 'rgba(0, 150, 200, 0.75)',  // 深青色 - 高可见度
      accent: 'rgba(50, 0, 200, 0.7)',      // 深紫色 - 高可见度
      highlight: 'rgba(0, 0, 0, 0.9)',      // 深色高亮 - 最强对比
      fade: 'rgba(255, 255, 255, 0.15)'     // 增强拖尾效果
    }
  };

  const themeColors = colors[theme] || colors.dark;

  // 半透明背景，创造拖尾效果（黑客代码雨效果）
  ctx.fillStyle = themeColors.fade;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 设置字体
  ctx.font = `${fontSize}px 'Courier New', monospace`;

  // 绘制每一列
  for (let i = 0; i < drops.length; i++) {
    // 随机选择字符
    const text = chars[Math.floor(Math.random() * chars.length)];
    
    // 根据位置选择颜色和透明度（顶部更亮）
    const y = drops[i] * fontSize;
    const progress = y / canvas.height;
    // 白天模式使用更高的基础透明度和更小的衰减
    const baseOpacity = theme === 'light' ? 0.6 : 0.3;
    const fadeRate = theme === 'light' ? 0.3 : 0.7;
    const opacity = Math.max(baseOpacity, 1 - progress * fadeRate);
    
    // 随机选择颜色，顶部更可能使用高亮色
    let color;
    const rand = Math.random();
    if (progress < 0.1 && rand > 0.3) {
      // 顶部10%区域，30%概率使用高亮色
      color = themeColors.highlight;
    } else if (rand < 0.4) {
      color = themeColors.primary;
    } else if (rand < 0.7) {
      color = themeColors.secondary;
    } else {
      color = themeColors.accent;
    }
    
    // 应用透明度
    let rgbaColor = color;
    if (color.includes('rgba')) {
      // 提取RGB值并替换透明度
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (match) {
        rgbaColor = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    
    ctx.fillStyle = rgbaColor;
    ctx.fillText(text, i * fontSize, y);

    // 重置位置并添加随机性
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }

  animationId = requestAnimationFrame(() => draw(ctx, canvas));
};

const handleResize = () => {
  if (canvasRef.value) {
    initCanvas();
  }
};

const handleThemeChange = () => {
  // 主题变化时重新初始化
  if (canvasRef.value) {
    initCanvas();
  }
};

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', handleResize);
  
  // 监听主题变化
  const observer = new MutationObserver(() => {
    handleThemeChange();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.code-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

/* 深色主题下的代码雨 - 黑客风格，更明显 */
:root[data-theme="dark"] .code-rain,
:root:not([data-theme]) .code-rain {
  opacity: 0.75;
  filter: brightness(1.1);
}

/* 浅色主题下的代码雨 - 大幅增强可见度，神经网络+黑客风格 */
:root[data-theme="light"] .code-rain {
  opacity: 0.85;
  filter: brightness(1.3) contrast(1.5) saturate(1.2);
}
</style>

