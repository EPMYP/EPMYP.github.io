<template>
  <div class="min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 主内容区 -->
    <main class="flex-1 pt-16">
      <router-view />
    </main>
    
    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
// 导入布局组件
import Navbar from '@/components/layout/Navbar.vue';
import Footer from '@/components/layout/Footer.vue';
</script>