<template>
  <!-- 首页视图：展示文章列表和标签筛选 -->
  <div class="container mx-auto px-4 py-20">
    <!-- 欢迎区域 -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        现代化Vue博客
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        基于Vue 3 + TypeScript构建，支持Markdown/HTML编辑、文章加密、标签管理等功能
      </p>
    </div>
    
    <!-- 标签筛选栏（可滚动） -->
    <div class="mb-8">
      <el-scrollbar wrap-class="flex gap-2 pb-2">
        <!-- 全部文章标签 -->
        <router-link 
          to="/" 
          class="tag"
          :class="{ 'bg-primary text-white': currentTag === '' }" <!-- 当前选中标签高亮 -->
        >
          全部文章
        </router-link>
        <!-- 所有标签 -->
        <router-link 
          v-for="tag in tags" 
          :key="tag.id" 
          :to="{ name: 'tag-articles', params: { name: tag.name } }"
          class="tag"
          :class="{ 'bg-primary text-white': currentTag === tag.name }"
        >
          {{ tag.name }} ({{ tag.count }}) <!-- 标签名称和文章数量 -->
        </router-link>
      </el-scrollbar>
    </div>
    
    <!-- 文章列表区域 -->
    <div v-if="!articleStore.isLoading">
      <!-- 有文章时显示文章卡片列表 -->
      <div v-if="articles.length > 0">
        <ArticleCard 
          v-for="article in articles" 
          :key="article.id" 
          :article="article"
        />
      </div>
      <!-- 无文章时显示提示 -->
      <div v-else class="text-center py-16">
        <DocumentNotFound class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold mb-2">暂无文章</h3>
        <p class="text-gray-500 mb-6">没有找到符合条件的文章</p>
        <!-- 已登录用户显示发布文章按钮 -->
        <router-link to="/editor" class="btn btn-primary" v-if="isLoggedIn">
          <EditPen class="mr-1" /> 发布第一篇文章
        </router-link>
      </div>
    </div>
    
    <!-- 加载中状态 -->
    <div v-else class="text-center py-16">
      <el-loading :text="loadingText" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入Vue相关函数
import { ref, computed, onMounted } from 'vue';
// 导入Vue Router的useRoute钩子
import { useRoute } from 'vue-router';
// 导入文章状态管理
import { useArticleStore } from '@/store/article';
// 导入文章卡片组件
import ArticleCard from '@/components/article/ArticleCard.vue';
// 导入Element Plus图标
import { DocumentNotFound, EditPen } from '@element-plus/icons-vue';

// 初始化路由和状态管理
const route = useRoute();
const articleStore = useArticleStore();
// 当前选中的标签（用于高亮）
const currentTag = ref('');
// 文章列表
const articles = ref(articleStore.getArticles());
// 标签列表
const tags = ref(articleStore.tags);
// 加载提示文本
const loadingText = ref('加载文章中...');
// 是否已登录
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

/**
 * 组件挂载时执行
 * @description 监听路由变化，处理标签筛选逻辑
 */
onMounted(() => {
  // 判断是否为标签筛选页面
  const unsubscribe = route.params.name && route.name === 'tag-articles'
    ? watch(
        () => route.params.name,
        (tagName) => {
          if (tagName) {
            currentTag.value = tagName as string;
            loadingText.value = `加载标签"${tagName}"的文章中...`;
            // 根据标签筛选文章
            articles.value = articleStore.getArticlesByTag(tagName as string);
          } else {
            currentTag.value = '';
            // 显示所有文章
            articles.value = articleStore.getArticles();
          }
        },
        { immediate: true } // 初始化时执行一次
      )
    : null;

  // 组件卸载时取消监听
  return () => {
    unsubscribe?.();
  };
});
</script>