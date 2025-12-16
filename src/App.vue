<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 路由出口：所有页面都会渲染到这里 -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 导入导航栏组件（如果没有 Navbar.vue，先创建简化版）
import Navbar from '@/components/Navbar.vue';
</script>

<style scoped>
/* 基础样式，确保页面不塌陷 */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>