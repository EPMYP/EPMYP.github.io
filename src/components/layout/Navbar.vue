<template>
  <!-- 导航栏组件：使用Element Plus的Header组件，固定在顶部 -->
  <el-header class="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
    <div class="container mx-auto px-4 flex items-center justify-between h-16">
      <!-- 博客Logo和名称 -->
      <div class="flex items-center">
        <router-link to="/" class="text-primary text-xl font-bold flex items-center">
          <BookFilled class="mr-2" /> <!-- 图标 -->
          <span>Vue博客</span> <!-- 博客名称 -->
        </router-link>
      </div>
      
      <!-- 桌面端搜索框（中等屏幕以上显示） -->
      <div class="hidden md:flex items-center flex-1 max-w-md mx-8">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章、标签..."
          class="w-full"
          @keyup.enter="handleSearch" <!-- 回车触发搜索 -->
        >
          <template #append>
            <el-button @click="handleSearch" icon="Search" /> <!-- 搜索按钮 -->
          </template>
        </el-input>
      </div>
      
      <!-- 导航菜单和用户操作区 -->
      <div class="flex items-center space-x-4">
        <!-- 首页链接（中等屏幕以上显示） -->
        <router-link 
          to="/" 
          class="hidden md:block hover:text-primary transition-colors"
        >
          首页
        </router-link>
        
        <!-- 已登录状态：显示发布文章按钮和用户下拉菜单 -->
        <template v-if="isLoggedIn">
          <router-link 
            to="/editor" 
            class="btn btn-primary text-white"
          >
            <EditPen class="mr-1" /> 发布文章
          </router-link>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleDropdownCommand">
            <span class="flex items-center cursor-pointer">
              <el-avatar icon="User" class="mr-2" /> <!-- 用户头像 -->
              <span class="hidden md:block">管理员</span> <!-- 用户名 -->
              <CaretBottom class="ml-1" /> <!-- 下拉箭头 -->
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="dashboard">
                  <Dashboard class="mr-2" /> 管理后台
                </el-dropdown-item>
                <el-dropdown-item command="articles">
                  <Document class="mr-2" /> 文章管理
                </el-dropdown-item>
                <el-dropdown-item command="tags">
                  <Tags class="mr-2" /> 标签管理
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided> <!-- divided：分隔线 -->
                  <Logout class="mr-2" /> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <!-- 未登录状态：显示登录按钮 -->
        <template v-else>
          <router-link to="/login" class="btn btn-outline">
            登录
          </router-link>
        </template>
      </div>
    </div>
    
    <!-- 移动端搜索框（中等屏幕以下显示） -->
    <div class="md:hidden px-4 pb-4">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索文章、标签..."
        class="w-full"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" icon="Search" />
        </template>
      </el-input>
    </div>
  </el-header>
</template>

<script setup lang="ts">
// 导入Vue相关函数
import { ref, computed } from 'vue';
// 导入Vue Router的useRouter钩子
import { useRouter } from 'vue-router';
// 导入Element Plus图标组件
import { 
  BookFilled, Search, EditPen, User, CaretBottom, 
  Dashboard, Document, Tags, Logout 
} from '@element-plus/icons-vue';

// 初始化路由实例
const router = useRouter();
// 搜索关键词响应式变量
const searchKeyword = ref('');

/**
 * 计算属性：判断用户是否已登录
 * @description 从本地存储获取登录状态
 */
const isLoggedIn = computed(() => {
  return localStorage.getItem('isLoggedIn') === 'true';
});

/**
 * 搜索处理函数
 * @description 跳转到搜索结果页，传递搜索关键词
 */
const handleSearch = () => {
  if (searchKeyword.value.trim()) { // 关键词不为空
    router.push({
      name: 'search',
      query: { keyword: searchKeyword.value.trim() } // 通过query传递关键词
    });
    searchKeyword.value = ''; // 清空搜索框
  }
};

/**
 * 下拉菜单命令处理函数
 * @param command 菜单命令标识
 * @description 根据命令跳转到对应的管理页面或执行退出登录
 */
const handleDropdownCommand = (command: string) => {
  switch (command) {
    case 'dashboard':
      router.push('/admin'); // 管理后台首页
      break;
    case 'articles':
      router.push('/admin/articles'); // 文章管理页
      break;
    case 'tags':
      router.push('/admin/tags'); // 标签管理页
      break;
    case 'logout':
      localStorage.removeItem('isLoggedIn'); // 清除登录状态
      router.push('/login'); // 跳转到登录页
      break;
  }
};
</script>