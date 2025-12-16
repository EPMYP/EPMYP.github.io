// 导入Vue Router相关函数和类型
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
// 导入页面组件
import HomeView from '@/views/HomeView.vue';
import ArticleDetail from '@/views/ArticleDetail.vue';
import EditorView from '@/views/EditorView.vue';
import TagArticles from '@/views/TagArticles.vue';
import SearchResults from '@/views/SearchResults.vue';
import AdminDashboard from '@/views/Admin/AdminDashboard.vue';
import ArticleManagement from '@/views/Admin/ArticleManagement.vue';
import TagManagement from '@/views/Admin/TagManagement.vue';
import LoginView from '@/views/LoginView.vue';

/**
 * 路由规则配置数组
 * @description 定义所有页面的路由路径、名称、组件和元信息
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/', // 路径
    name: 'home', // 路由名称
    component: HomeView, // 对应的组件
    meta: { title: '首页 - 现代化Vue博客' } // 元信息：页面标题
  },
  {
    path: '/article/:id', // 文章详情页（带ID参数）
    name: 'article-detail',
    component: ArticleDetail,
    meta: { title: '文章详情 - 现代化Vue博客' }
  },
  {
    path: '/editor', // 发布文章页
    name: 'editor',
    component: EditorView,
    meta: { title: '发布文章 - 现代化Vue博客', requiresAuth: true } // requiresAuth：需要登录才能访问
  },
  {
    path: '/editor/:id', // 编辑文章页（带ID参数）
    name: 'edit-article',
    component: EditorView,
    meta: { title: '编辑文章 - 现代化Vue博客', requiresAuth: true }
  },
  {
    path: '/tag/:name', // 标签文章列表页（带标签名称参数）
    name: 'tag-articles',
    component: TagArticles,
    meta: { title: '标签文章 - 现代化Vue博客' }
  },
  {
    path: '/search', // 搜索结果页
    name: 'search',
    component: SearchResults,
    meta: { title: '搜索结果 - 现代化Vue博客' }
  },
  {
    path: '/admin', // 管理后台首页
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { title: '管理后台 - 现代化Vue博客', requiresAuth: true }
  },
  {
    path: '/admin/articles', // 文章管理页
    name: 'article-management',
    component: ArticleManagement,
    meta: { title: '文章管理 - 现代化Vue博客', requiresAuth: true }
  },
  {
    path: '/admin/tags', // 标签管理页
    name: 'tag-management',
    component: TagManagement,
    meta: { title: '标签管理 - 现代化Vue博客', requiresAuth: true }
  },
  {
    path: '/login', // 登录页
    name: 'login',
    component: LoginView,
    meta: { title: '登录 - 现代化Vue博客' }
  },
  {
    path: '/:pathMatch(.*)*', // 404页面（匹配所有未定义的路径）
    redirect: '/' // 重定向到首页
  }
];

/**
 * 创建路由实例
 * @description 使用HTML5 History模式，配置路由规则和滚动行为
 * 关键：使用import.meta.env.BASE_URL适配GitHub Pages基础路径
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // HTML5 History模式（无#），适配基础路径
  routes, // 路由规则
  // 滚动行为配置：切换路由时滚动到顶部，支持浏览器后退/前进记忆滚动位置
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  }
});

/**
 * 路由守卫（全局前置守卫）
 * @description 在路由跳转前执行，用于权限控制和页面标题设置
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题（如果路由元信息中有title）
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  
  // 验证是否需要登录访问
  const requiresAuth = to.meta.requiresAuth; // 是否需要登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // 是否已登录（本地存储判断）
  
  // 需要登录但未登录：跳转到登录页
  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else {
    // 不需要登录或已登录：继续跳转
    next();
  }
});

// 导出路由实例，供main.ts导入使用
export default router;