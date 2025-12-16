import { createPinia } from 'pinia';
import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';

const { getArticles, saveArticle, getArticleById, deleteArticle, getTags, getArticlesByTag } = useStorage();

export const useBlogStore = defineStore('blog', {
  state: () => ({
    articles: [],
    currentArticle: null,
    tags: [],
    loading: false
  }),
  
  actions: {
    // 加载所有文章
    fetchArticles() {
      this.loading = true;
      this.articles = getArticles();
      this.tags = getTags();
      this.loading = false;
    },
    
    // 加载单篇文章
    fetchArticleById(id) {
      this.loading = true;
      this.currentArticle = getArticleById(id);
      this.loading = false;
      return this.currentArticle;
    },
    
    // 保存文章
    saveArticle(article) {
      this.loading = true;
      const saved = saveArticle(article);
      this.fetchArticles();
      this.currentArticle = saved;
      this.loading = false;
      return saved;
    },
    
    // 删除文章
    deleteArticle(id) {
      this.loading = true;
      deleteArticle(id);
      this.fetchArticles();
      if (this.currentArticle?.id === id) {
        this.currentArticle = null;
      }
      this.loading = false;
    },
    
    // 根据标签筛选文章
    fetchArticlesByTag(tag) {
      this.loading = true;
      this.articles = getArticlesByTag(tag);
      this.loading = false;
      return this.articles;
    }
  }
});

export default createPinia();