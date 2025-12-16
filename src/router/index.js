import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import Editor from '@/pages/EditorPage.vue';
import Article from '@/pages/ArticlePage.vue';
import Tags from '@/pages/TagsPage.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/editor', name: 'Editor', component: Editor },
  { path: '/editor/:id', name: 'EditArticle', component: Editor },
  { path: '/article/:id', name: 'Article', component: Article },
  { path: '/tags', name: 'Tags', component: Tags },
  { path: '/tags/:tag', name: 'TagArticles', component: Tags },
  { path: '/:pathMatch(.*)*', redirect: '/' } // 404 重定向到首页
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;