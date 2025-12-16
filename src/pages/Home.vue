<template>
  <div class="text-center py-12">
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Vue 个人博客</h1>
    <p class="text-gray-600 mb-8">支持文章加解密、Markdown 预览、标签管理</p>
    <router-link 
      to="/editor" 
      class="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      开始写第一篇文章
    </router-link>
    
    <!-- 文章列表（简化版） -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6 text-left">最新文章</h2>
      <div class="grid gap-4">
        <div class="bg-white p-4 rounded shadow-sm border border-gray-100 text-left">
          暂无文章，点击「开始写第一篇文章」创建
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>