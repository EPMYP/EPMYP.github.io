<template>
  <div class="comment-section">
    <div class="comment-header">
      <h3 class="comment-title">
        <span class="icon">💬</span>
        评论区
        <span v-if="commentsCount > 0" class="comment-count">({{ commentsCount }})</span>
      </h3>
      <div class="comment-actions">
        <button @click="refreshComments" class="refresh-btn" :disabled="loading">
          <span class="icon">🔄</span> 刷新
        </button>
        <a
          v-if="issueUrl"
          :href="issueUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
        >
          <span class="icon">🔗</span> 在GitHub上评论
        </a>
      </div>
    </div>

    <div v-if="!githubConfigured" class="config-notice">
      <p class="notice-text">
        <span class="icon">⚙️</span>
        要启用评论区功能，请在环境变量中配置 <code>VITE_GITHUB_REPO</code> 和 <code>VITE_GITHUB_TOKEN</code>
      </p>
      <p class="notice-detail">
        或者直接访问GitHub仓库的Issues页面进行评论。
      </p>
    </div>

    <div v-else-if="loading && comments.length === 0" class="loading-comments">
      <div class="loading-spinner"></div>
      <p>加载评论中...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadComments" class="retry-btn">重试</button>
    </div>

    <div v-else>
      <div v-if="comments.length === 0" class="no-comments">
        <p>暂无评论，成为第一个评论者吧！</p>
        <a
          v-if="issueUrl"
          :href="issueUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="comment-link-btn"
        >
          在GitHub上添加评论
        </a>
      </div>

      <div v-else class="comments-list">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-avatar">
            <img
              :src="comment.user.avatar_url"
              :alt="comment.user.login"
              class="avatar-img"
            />
          </div>
          <div class="comment-content">
            <div class="comment-meta">
              <span class="comment-author">{{ comment.user.login }}</span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="comment-body" v-html="formatCommentBody(comment.body)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getOrCreateArticleIssue, getIssueComments } from '../utils/github'
import { marked } from 'marked'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  },
  articleTitle: {
    type: String,
    required: true
  }
})

const issue = ref(null)
const comments = ref([])
const loading = ref(false)
const error = ref('')

const githubConfigured = computed(() => {
  return import.meta.env.VITE_GITHUB_REPO && import.meta.env.VITE_GITHUB_TOKEN
})

const issueUrl = computed(() => {
  if (!issue.value) return null
  const repo = import.meta.env.VITE_GITHUB_REPO || 'your-username/my-secure-blog'
  return `https://github.com/${repo}/issues/${issue.value.number}`
})

const commentsCount = computed(() => {
  return comments.value.length
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

const formatCommentBody = (body) => {
  try {
    return marked.parse(body)
  } catch (error) {
    return body.replace(/\n/g, '<br>')
  }
}

const loadComments = async () => {
  if (!githubConfigured.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 获取或创建Issue
    issue.value = await getOrCreateArticleIssue(props.articleId, props.articleTitle)
    
    if (issue.value) {
      // 获取评论
      comments.value = await getIssueComments(issue.value.number)
    }
  } catch (err) {
    error.value = '加载评论失败: ' + err.message
    console.error('加载评论失败:', err)
  } finally {
    loading.value = false
  }
}

const refreshComments = () => {
  loadComments()
}

onMounted(() => {
  loadComments()
})

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true
})
</script>

<style scoped>
.comment-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
}

.comment-title {
  margin: 0;
  color: #60a5fa;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
}

.comment-count {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: normal;
}

.comment-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.refresh-btn,
.github-link {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.refresh-btn:hover:not(:disabled),
.github-link:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: #60a5fa;
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 1.2em;
}

.config-notice {
  padding: 2rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  text-align: center;
}

.notice-text {
  color: #fbbf24;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
}

.notice-text code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #fbbf24;
}

.notice-detail {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.loading-comments {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #f87171;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.5);
  color: #f87171;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: rgba(248, 113, 113, 0.3);
}

.no-comments {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.comment-link-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.comment-link-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s;
}

.comment-item:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(15, 23, 42, 0.7);
  transform: translateX(5px);
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.5);
}

.comment-content {
  flex: 1;
}

.comment-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.comment-author {
  font-weight: 600;
  color: #60a5fa;
  font-family: 'Courier New', monospace;
}

.comment-date {
  color: #94a3b8;
  font-size: 0.9rem;
}

.comment-body {
  color: #e2e8f0;
  line-height: 1.6;
}

.comment-body :deep(p) {
  margin: 0.5rem 0;
}

.comment-body :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #34d399;
}

.comment-body :deep(pre) {
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.comment-body :deep(a) {
  color: #60a5fa;
  text-decoration: none;
}

.comment-body :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .comment-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .comment-item {
    flex-direction: column;
  }
}
</style>

