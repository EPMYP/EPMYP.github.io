<template>
  <div class="article-list">
    <div class="header-section">
      <div class="header-title-wrapper">
        <h2>
          <span class="title-icon">📝</span>
          所有文章
        </h2>
        <div class="title-decoration"></div>
      </div>
      <div class="filter-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章..."
          class="search-input"
        />
        <select v-model="selectedTag" class="tag-filter">
          <option value="">所有标签</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </div>

    <div v-if="filteredArticles.length === 0" class="empty-state">
      <p>暂无文章，点击"创建文章"开始写作吧！</p>
    </div>

    <div v-else class="articles-grid">
      <article
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-card"
        @click="$emit('view-article', article.id)"
      >
        <div class="article-header">
          <h3 class="article-title">{{ article.title }}</h3>
          <span v-if="article.encrypted" class="encrypted-badge">🔒 已加密</span>
        </div>
        <p class="article-excerpt">{{ article.excerpt || '无摘要' }}</p>
        <div class="article-meta">
          <span class="article-date">{{ formatDate(article.createdAt) }}</span>
          <div class="article-tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="article-actions" @click.stop>
          <button @click="$emit('edit-article', article.id)" class="action-btn edit">编辑</button>
          <button @click="handleDelete(article.id)" class="action-btn delete">删除</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllArticles, deleteArticle, getAllTags } from '../utils/storage'

const emit = defineEmits(['view-article', 'edit-article'])

const articles = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const allTags = ref([])

const filteredArticles = computed(() => {
  let filtered = articles.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(query) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(query))
    )
  }

  if (selectedTag.value) {
    filtered = filtered.filter(article =>
      article.tags && article.tags.includes(selectedTag.value)
    )
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = (id) => {
  if (confirm('确定要删除这篇文章吗？')) {
    deleteArticle(id)
    loadArticles()
  }
}

const loadArticles = () => {
  articles.value = getAllArticles()
  allTags.value = getAllTags()
}

onMounted(() => {
  loadArticles()
  // 监听localStorage变化（用于跨标签页同步）
  window.addEventListener('storage', (e) => {
    if (e.key === 'blog_articles') {
      loadArticles()
    }
  })
})
</script>

<style scoped>
.article-list {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section {
  background: var(--tech-bg-card);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--tech-shadow);
  border: 1px solid var(--tech-border);
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.header-title-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.header-section h2 {
  margin: 0;
  color: var(--tech-primary);
  font-size: 2rem;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.title-icon {
  font-size: 1.8rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6));
}

.title-decoration {
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, var(--tech-primary), transparent);
  border-radius: 2px;
  animation: glow 2s ease-in-out infinite;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input,
.tag-filter {
  padding: 0.75rem 1rem;
  border: 1px solid var(--tech-border);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  flex: 1;
  min-width: 200px;
  background: var(--tech-bg-card);
  color: var(--tech-text);
  font-family: 'Courier New', monospace;
}

.search-input:focus,
.tag-filter:focus {
  outline: none;
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.empty-state {
  background: var(--tech-bg-card);
  padding: 4rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px var(--tech-shadow);
  border: 1px solid var(--tech-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.empty-state p {
  color: var(--tech-text-muted);
  font-size: 1.2rem;
  font-family: 'Courier New', monospace;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background: var(--tech-bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--tech-shadow);
  border: 1px solid var(--tech-border);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.5s;
}

.article-card:hover::before {
  left: 100%;
}

.article-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 212, 255, 0.4);
  border-color: var(--tech-primary);
  background: var(--tech-bg-card);
  filter: brightness(1.05);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.article-title {
  margin: 0;
  color: var(--tech-primary);
  font-size: 1.3rem;
  flex: 1;
  line-height: 1.4;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.encrypted-badge {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(248, 113, 113, 0.3);
  border: 1px solid rgba(248, 113, 113, 0.5);
}

.article-excerpt {
  color: var(--tech-text-muted);
  margin: 0 0 1rem 0;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--tech-border);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-date {
  color: var(--tech-text-muted);
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.5);
  font-family: 'Courier New', monospace;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn.edit {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  border: 1px solid var(--tech-primary);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  font-family: 'Courier New', monospace;
}

.action-btn.edit:hover {
  box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
}

.action-btn.delete {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  border: 1px solid rgba(248, 113, 113, 0.5);
  box-shadow: 0 4px 15px rgba(248, 113, 113, 0.3);
  font-family: 'Courier New', monospace;
}

.action-btn.delete:hover {
  box-shadow: 0 6px 25px rgba(248, 113, 113, 0.5);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>

