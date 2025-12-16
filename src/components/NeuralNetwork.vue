<template>
  <div class="neural-network">
    <svg ref="svgRef" class="neural-svg">
      <!-- 神经网络节点和连接线将通过JavaScript动态生成 -->
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getTheme } from '../utils/theme.js';

const svgRef = ref(null);
let animationId = null;
let nodes = [];
let connections = [];
let nodeCount = 30;

// 初始化神经网络节点
const initNodes = () => {
  if (!svgRef.value) return;
  
  const width = svgRef.value.clientWidth || window.innerWidth;
  const height = svgRef.value.clientHeight || window.innerHeight;
  
  nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 2
    });
  }
  
  // 创建连接关系
  connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 只连接距离较近的节点
      if (distance < Math.min(width, height) * 0.3) {
        connections.push({ from: i, to: j, distance });
      }
    }
  }
};

// 更新和绘制神经网络
const animate = () => {
  if (!svgRef.value) return;
  
  const theme = getTheme();
  const width = svgRef.value.clientWidth || window.innerWidth;
  const height = svgRef.value.clientHeight || window.innerHeight;
  
  // 更新节点位置
  nodes.forEach(node => {
    node.x += node.vx;
    node.y += node.vy;
    
    // 边界反弹
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
    
    // 限制在边界内
    node.x = Math.max(0, Math.min(width, node.x));
    node.y = Math.max(0, Math.min(height, node.y));
  });
  
  // 清空SVG
  svgRef.value.innerHTML = '';
  
  // 根据主题设置颜色
  const colors = {
    dark: {
      node: '#00ff00',
      connection: 'rgba(0, 255, 0, 0.2)',
      glow: 'rgba(0, 255, 0, 0.5)'
    },
    light: {
      node: '#0066ff',
      connection: 'rgba(0, 102, 255, 0.4)',
      glow: 'rgba(0, 102, 255, 0.6)'
    }
  };
  
  const themeColors = colors[theme] || colors.dark;
  
  // 绘制连接线
  connections.forEach(conn => {
    const from = nodes[conn.from];
    const to = nodes[conn.to];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 根据距离调整透明度，白天模式更明显
    const baseOpacity = theme === 'light' ? 0.3 : 0.1;
    const maxOpacity = theme === 'light' ? 0.6 : 0.4;
    const opacity = Math.max(baseOpacity, maxOpacity - (distance / (Math.min(width, height) * 0.3)) * (maxOpacity - baseOpacity));
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', themeColors.connection);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('opacity', opacity);
    svgRef.value.appendChild(line);
  });
  
  // 绘制节点
  nodes.forEach((node, index) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', node.radius);
    circle.setAttribute('fill', themeColors.node);
    circle.setAttribute('opacity', '0.8');
    
    // 添加发光效果
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `glow-${index}`);
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    svgRef.value.appendChild(filter);
    
    circle.setAttribute('filter', `url(#glow-${index})`);
    svgRef.value.appendChild(circle);
  });
  
  animationId = requestAnimationFrame(animate);
};

const handleResize = () => {
  if (svgRef.value) {
    initNodes();
  }
};

onMounted(() => {
  if (svgRef.value) {
    svgRef.value.setAttribute('width', '100%');
    svgRef.value.setAttribute('height', '100%');
    initNodes();
    animate();
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.neural-network {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.neural-svg {
  width: 100%;
  height: 100%;
}

/* 深色主题下的神经网络 */
:root[data-theme="dark"] .neural-network,
:root:not([data-theme]) .neural-network {
  opacity: 0.5;
}

/* 浅色主题下的神经网络 - 增强可见度 */
:root[data-theme="light"] .neural-network {
  opacity: 0.75;
}
</style>

