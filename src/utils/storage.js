/**
 * 文章数据存储管理
 * 使用localStorage存储文章数据
 */

const STORAGE_KEY = 'blog_articles'

/**
 * 获取所有文章
 */
export function getAllArticles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取文章失败:', error)
    return []
  }
}

/**
 * 保存所有文章
 */
export function saveAllArticles(articles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
    return true
  } catch (error) {
    console.error('保存文章失败:', error)
    return false
  }
}

/**
 * 获取单篇文章
 */
export function getArticle(id) {
  const articles = getAllArticles()
  return articles.find(article => article.id === id)
}

/**
 * 保存文章
 */
export function saveArticle(article) {
  const articles = getAllArticles()
  const index = articles.findIndex(a => a.id === article.id)
  
  if (index >= 0) {
    articles[index] = article
  } else {
    articles.push(article)
  }
  
  return saveAllArticles(articles)
}

/**
 * 删除文章
 */
export function deleteArticle(id) {
  const articles = getAllArticles()
  const filtered = articles.filter(a => a.id !== id)
  return saveAllArticles(filtered)
}

/**
 * 生成文章ID
 */
export function generateArticleId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 获取所有标签
 */
export function getAllTags() {
  const articles = getAllArticles()
  const tagSet = new Set()
  articles.forEach(article => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
}

