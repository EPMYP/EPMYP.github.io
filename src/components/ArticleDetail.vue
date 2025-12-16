<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="!article" class="error">
      <p>文章不存在</p>
      <button @click="$emit('back')" class="back-btn">返回列表</button>
    </div>

    <div v-else class="article-content">
      <div class="article-header">
        <button @click="$emit('back')" class="back-btn">← 返回</button>
        <div class="header-actions">
          <button @click="$emit('edit', article.id)" class="edit-btn">编辑</button>
        </div>
      </div>

      <div class="article-card">
        <div class="article-title-section">
          <h1 class="article-title">{{ article.title }}</h1>
          <span v-if="article.encrypted" class="encrypted-badge">🔒 已加密</span>
        </div>

        <div class="article-meta">
          <span class="meta-item">创建时间: {{ formatDate(article.createdAt) }}</span>
          <span class="meta-item">更新时间: {{ formatDate(article.updatedAt) }}</span>
        </div>

        <div v-if="article.tags && article.tags.length > 0" class="article-tags">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div v-if="article.excerpt" class="article-excerpt">
          <p>{{ article.excerpt }}</p>
        </div>

        <div class="article-body">
          <div v-if="needsPassword" class="password-prompt">
            <h3>此文章已加密</h3>
            <input
              v-model="decryptPassword"
              type="password"
              placeholder="输入密码以查看内容"
              class="password-input"
              @keyup.enter="handleDecrypt"
            />
            <button @click="handleDecrypt" class="decrypt-btn">解密</button>
            <p v-if="decryptError" class="error-message">{{ decryptError }}</p>
          </div>

          <div v-else-if="isHash" class="hash-info">
            <p>此文章使用了{{ hashMethod }}哈希验证。哈希值已保存，但原始内容无法恢复。</p>
            <p class="hash-value">哈希值: {{ hashValue }}</p>
          </div>

          <div v-else class="content-display" v-html="displayContent"></div>
        </div>
      </div>

      <!-- 评论区 -->
      <CommentSection 
        v-if="article"
        :article-id="article.id"
        :article-title="article.title"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { getArticle } from '../utils/storage'
import { decrypt } from '../utils/crypto'
import CommentSection from './CommentSection.vue'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back', 'edit'])

const article = ref(null)
const loading = ref(true)
const decryptPassword = ref('')
const decryptError = ref('')
const decryptedContent = ref('')

const needsPassword = computed(() => {
  return article.value && article.value.encrypted && !decryptedContent.value && !isHash.value
})

const isHash = computed(() => {
  return article.value && article.value.content && article.value.content.startsWith('[HASH:')
})

const hashMethod = computed(() => {
  if (isHash.value) {
    const match = article.value.content.match(/\[HASH:([^:]+):/)
    return match ? match[1].toUpperCase() : ''
  }
  return ''
})

const hashValue = computed(() => {
  if (isHash.value) {
    const match = article.value.content.match(/\[HASH:[^:]+:([^\]]+)\]/)
    return match ? match[1] : ''
  }
  return ''
})

const displayContent = computed(() => {
  if (!article.value) return ''
  
  const content = decryptedContent.value || article.value.content
  
  if (article.value.originalContentType === 'markdown' || article.value.contentType === 'markdown') {
    try {
      return marked.parse(content)
    } catch (error) {
      return '<p class="error">Markdown解析错误: ' + error.message + '</p>'
    }
  } else {
    return content
  }
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

const handleDecrypt = () => {
  if (!decryptPassword.value) {
    decryptError.value = '请输入密码'
    return
  }

  try {
    // 尝试不同的加密方法
    let decrypted = false
    for (const method of ['aes-256', 'aes-128']) {
      try {
        decryptedContent.value = decrypt(article.value.content, method, decryptPassword.value)
        decrypted = true
        decryptError.value = ''
        break
      } catch (e) {
        // 继续尝试下一个方法
      }
    }
    
    if (!decrypted) {
      decryptError.value = '密码错误或加密方法不匹配'
    }
  } catch (error) {
    decryptError.value = '解密失败: ' + error.message
  }
}

const loadArticle = () => {
  loading.value = true
  const loadedArticle = getArticle(props.articleId)
  
  if (loadedArticle) {
    article.value = { ...loadedArticle }
    
    // 如果文章未加密，直接显示
    if (!article.value.encrypted) {
      decryptedContent.value = article.value.content
    }
  }
  
  loading.value = false
}

onMounted(() => {
  loadArticle()
})

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true
})
</script>

<style scoped>
.article-detail {
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

.loading,
.error {
  background: rgba(15, 23, 42, 0.8);
  padding: 4rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--tech-text-muted);
}

.article-content {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.3);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  background: rgba(15, 23, 42, 0.5);
}

.back-btn,
.edit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.back-btn {
  background: rgba(0, 212, 255, 0.1);
  color: var(--tech-primary);
  border: 1px solid rgba(0, 212, 255, 0.5);
}

.back-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: var(--tech-primary);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.edit-btn {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  border: 1px solid var(--tech-primary);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.edit-btn:hover {
  box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5);
  transform: translateY(-3px);
}

.article-card {
  padding: 2rem;
}

.article-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.article-title {
  margin: 0;
  color: var(--tech-primary);
  font-size: 2.5rem;
  line-height: 1.2;
  flex: 1;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  font-family: 'Courier New', monospace;
}

.encrypted-badge {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  white-space: nowrap;
  margin-top: 0.5rem;
  box-shadow: 0 4px 15px rgba(248, 113, 113, 0.3);
  border: 1px solid rgba(248, 113, 113, 0.5);
}

.article-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  color: var(--tech-text-muted);
  font-size: 0.9rem;
  flex-wrap: wrap;
  font-family: 'Courier New', monospace;
}

.meta-item {
  display: flex;
  align-items: center;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tag {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.5);
  font-family: 'Courier New', monospace;
}

.article-excerpt {
  background: rgba(0, 212, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid var(--tech-primary);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.article-excerpt p {
  margin: 0;
  color: var(--tech-text);
  font-size: 1.1rem;
  line-height: 1.6;
}

.article-body {
  margin-top: 2rem;
}

.password-prompt {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.password-prompt h3 {
  margin: 0 0 1.5rem 0;
  color: var(--tech-primary);
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.password-input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.8);
  color: var(--tech-text);
  font-family: 'Courier New', monospace;
}

.password-input:focus {
  outline: none;
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.decrypt-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  border: 1px solid var(--tech-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.decrypt-btn:hover {
  box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5);
  transform: translateY(-3px);
}

.error-message {
  color: #f87171;
  margin-top: 1rem;
  font-family: 'Courier New', monospace;
}

.hash-info {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.hash-info p {
  color: var(--tech-text);
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
}

.hash-value {
  font-family: 'Courier New', monospace;
  background: rgba(15, 23, 42, 0.8);
  padding: 1rem;
  border-radius: 8px;
  word-break: break-all;
  color: var(--tech-accent);
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.content-display {
  line-height: 1.8;
  color: var(--tech-text);
}

.content-display :deep(h1),
.content-display :deep(h2),
.content-display :deep(h3),
.content-display :deep(h4),
.content-display :deep(h5),
.content-display :deep(h6) {
  margin-top: 2em;
  margin-bottom: 1em;
  color: var(--tech-primary);
  line-height: 1.3;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.content-display :deep(p) {
  margin-bottom: 1.5em;
  color: var(--tech-text);
}

.content-display :deep(ul),
.content-display :deep(ol) {
  margin-bottom: 1.5em;
  padding-left: 2em;
}

.content-display :deep(li) {
  margin-bottom: 0.5em;
  color: var(--tech-text);
}

.content-display :deep(code) {
  background: rgba(0, 0, 0, 0.5);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: var(--tech-accent);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.content-display :deep(pre) {
  background: rgba(0, 0, 0, 0.6);
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.5em;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.content-display :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  color: var(--tech-accent);
}

.content-display :deep(blockquote) {
  border-left: 4px solid var(--tech-primary);
  padding-left: 1.5em;
  margin-left: 0;
  color: var(--tech-text-muted);
  font-style: italic;
  background: rgba(0, 212, 255, 0.05);
  padding: 1em 1.5em;
  border-radius: 4px;
}

.content-display :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.content-display :deep(a) {
  color: var(--tech-primary);
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  transition: all 0.3s;
}

.content-display :deep(a:hover) {
  color: #00ffff;
  border-bottom-color: var(--tech-primary);
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.content-display :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.content-display :deep(th),
.content-display :deep(td) {
  border: 1px solid rgba(0, 212, 255, 0.3);
  padding: 0.75em;
  text-align: left;
  color: var(--tech-text);
}

.content-display :deep(th) {
  background: rgba(0, 212, 255, 0.1);
  font-weight: 600;
  color: var(--tech-primary);
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .article-card {
    padding: 1.5rem;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .back-btn,
  .edit-btn {
    width: 100%;
  }
}
</style>

