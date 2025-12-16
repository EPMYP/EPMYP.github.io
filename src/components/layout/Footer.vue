<template>
  <!-- 页脚组件：使用Element Plus的Footer组件，深色背景 -->
  <el-footer class="bg-dark text-white py-8">
    <div class="container mx-auto px-4">
      <!-- 页脚内容网格布局（1列/3列响应式） -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 博客介绍 -->
        <div>
          <h3 class="text-xl font-bold mb-4 flex items-center">
            <BookFilled class="mr-2" /> Vue博客
          </h3>
          <p class="text-gray-400">
            基于Vue 3 + TypeScript构建的现代化博客系统，支持Markdown/HTML编辑、文章加密、标签管理等功能。
          </p>
        </div>
        <!-- 快速链接 -->
        <div>
          <h3 class="text-xl font-bold mb-4">快速链接</h3>
          <ul class="space-y-2 text-gray-400">
            <li>
              <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
            </li>
            <li>
              <router-link to="/editor" class="hover:text-primary transition-colors" v-if="isLoggedIn">
                发布文章
              </router-link>
            </li>
            <li>
              <router-link to="/admin" class="hover:text-primary transition-colors" v-if="isLoggedIn">
                管理后台
              </router-link>
            </li>
          </ul>
        </div>
        <!-- 标签云 -->
        <div>
          <h3 class="text-xl font-bold mb-4">标签云</h3>
          <div class="flex flex-wrap gap-2">
            <router-link 
              v-for="tag in tags" 
              :key="tag.id" 
              :to="{ name: 'tag-articles', params: { name: tag.name } }"
              class="tag bg-gray-800 text-gray-300 hover:bg-primary hover:text-white"
            >
              {{ tag.name }} ({{ tag.count }}) <!-- 标签名称和关联文章数量 -->
            </router-link>
          </div>
        </div>
      </div>
      <!-- 版权信息 -->
      <div class="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500">
        <p>© {{ new Date().getFullYear() }} Vue博客. 保留所有权利.</p>
      </div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
// 导入Vue相关函数
import { ref } from 'vue';
// 导入文章状态管理
import { useArticleStore } from '@/store/article';
// 导入Element Plus图标
import { BookFilled } from '@element-plus/icons-vue';

// 初始化文章状态管理
const articleStore = useArticleStore();
// 标签云：显示前8个标签（避免过多标签导致排版问题）
const tags = ref(articleStore.tags.slice(0, 8));

// 判断用户是否已登录
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
</script>