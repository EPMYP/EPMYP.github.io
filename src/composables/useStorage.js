export function useStorage() {
  const STORAGE_KEY = 'vue_blog_articles';
  
  // 获取所有文章
  const getArticles = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  // 保存文章
  const saveArticle = (article) => {
    const articles = getArticles();
    const index = articles.findIndex(item => item.id === article.id);
    
    if (index > -1) {
      articles[index] = article; // 更新文章
    } else {
      article.id = Date.now().toString(); // 生成唯一ID
      article.createdAt = new Date().toISOString();
      article.updatedAt = new Date().toISOString();
      articles.unshift(article); // 新增文章排在前面
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    return article;
  };

  // 获取单篇文章
  const getArticleById = (id) => {
    const articles = getArticles();
    return articles.find(item => item.id === id) || null;
  };

  // 删除文章
  const deleteArticle = (id) => {
    let articles = getArticles();
    articles = articles.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  };

  // 获取所有标签
  const getTags = () => {
    const articles = getArticles();
    const tags = new Set();
    
    articles.forEach(article => {
      article.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags);
  };

  // 根据标签筛选文章
  const getArticlesByTag = (tag) => {
    const articles = getArticles();
    return articles.filter(article => article.tags.includes(tag));
  };

  return {
    getArticles,
    saveArticle,
    getArticleById,
    deleteArticle,
    getTags,
    getArticlesByTag
  };
}