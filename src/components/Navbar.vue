<template>
  <nav class="bg-white border-b border-gray-200 py-4">
    <div class="container mx-auto px-4 flex justify-between items-center">
      <a href="/" class="text-xl font-bold text-blue-600">Vue 博客</a>
      <div class="flex gap-4">
        <router-link to="/" class="hover:text-blue-600">首页</router-link>
        <router-link to="/editor" class="hover:text-blue-600">写文章</router-link>
        <router-link to="/tags" class="hover:text-blue-600">标签</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
// 导入路由链接组件
import { RouterLink } from 'vue-router';
</script>