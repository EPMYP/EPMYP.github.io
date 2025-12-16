import { createRouter, createWebHistory } from 'vue-router';
// 确保这些组件路径正确（如果文件不在 pages 目录，修改路径）
import Home from '@/pages/Home.vue';
import Editor from '@/pages/EditorPage.vue';
import Article from '@/pages/ArticlePage.vue';
import Tags from '@/pages/TagsPage.vue';

const routes = [
  { path: '/', name: 'Home', component: Home }, // 首页路由必须存在
  { path: '/editor', name: 'Editor', component: Editor },
  { path: '/editor/:id', name: 'EditArticle', component: Editor },
  { path: '/article/:id', name: 'Article', component: Article },
  { path: '/tags', name: 'Tags', component: Tags },
  { path: '/:pathMatch(.*)*', redirect: '/' }, // 404 重定向
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 现在 ESM 模式下可正常使用
  routes,
});

// 调试：路由创建成功日志
console.log('路由配置成功', router.getRoutes());

export default router;