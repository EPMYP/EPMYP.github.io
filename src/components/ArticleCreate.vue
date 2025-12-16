<template>
  <div class="article-create">
    <div class="editor-container">
      <div class="editor-header">
        <h2>创建新文章</h2>
        <div class="editor-actions">
          <button @click="handleSave" class="save-btn" :disabled="!canSave">保存文章</button>
          <button @click="$emit('saved')" class="cancel-btn">取消</button>
        </div>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label>文章标题 *</label>
          <input v-model="article.title" type="text" placeholder="输入文章标题" class="form-input" />
        </div>

        <div class="form-group">
          <label>文章摘要</label>
          <textarea v-model="article.excerpt" placeholder="输入文章摘要（可选）" class="form-textarea" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>内容类型</label>
          <div class="radio-group">
            <label>
              <input type="radio" v-model="article.contentType" value="markdown" />
              Markdown
            </label>
            <label>
              <input type="radio" v-model="article.contentType" value="html" />
              HTML
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>加密方式</label>
          <select v-model="article.encryptionMethod" class="form-select">
            <option value="">不加密</option>
            <option value="aes-128">AES-128</option>
            <option value="aes-256">AES-256</option>
            <option value="sha256">SHA256（哈希验证）</option>
            <option value="sha512">SHA512（哈希验证）</option>
          </select>
          <input
            v-if="article.encryptionMethod"
            v-model="encryptionPassword"
            type="password"
            placeholder="输入加密密码"
            class="form-input"
            style="margin-top: 0.5rem;"
          />
        </div>

        <div class="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="例如: 技术, Vue, 博客"
            class="form-input"
            @blur="updateTags"
          />
          <div v-if="article.tags && article.tags.length > 0" class="tags-display">
            <span v-for="tag in article.tags" :key="tag" class="tag-item">
              {{ tag }}
              <button @click="removeTag(tag)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="editor-section">
        <div class="editor-tabs">
          <button
            :class="['tab-btn', { active: activeTab === 'edit' }]"
            @click="activeTab = 'edit'"
          >
            编辑
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'preview' }]"
            @click="activeTab = 'preview'"
          >
            预览
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'split' }]"
            @click="activeTab = 'split'"
          >
            分屏
          </button>
        </div>

        <div class="editor-content">
          <div v-if="activeTab === 'edit' || activeTab === 'split'" class="editor-pane">
            <textarea
              v-model="article.content"
              placeholder="开始写作..."
              class="content-editor"
              @input="handleContentChange"
            ></textarea>
          </div>
          <div v-if="activeTab === 'preview' || activeTab === 'split'" class="preview-pane">
            <div class="preview-content" v-html="previewContent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import { generateArticleId, saveArticle } from '../utils/storage'
import { encrypt, hashSHA256, hashSHA512 } from '../utils/crypto'

const emit = defineEmits(['saved'])

const article = ref({
  id: generateArticleId(),
  title: '',
  excerpt: '',
  content: '',
  contentType: 'markdown',
  encryptionMethod: '',
  encrypted: false,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const encryptionPassword = ref('')
const tagsInput = ref('')
const activeTab = ref('split')

const canSave = computed(() => {
  return article.value.title.trim() !== '' && article.value.content.trim() !== ''
})

const previewContent = computed(() => {
  if (!article.value.content) return '<p class="empty-preview">开始写作，预览将在这里显示...</p>'
  
  if (article.value.contentType === 'markdown') {
    try {
      return marked.parse(article.value.content)
    } catch (error) {
      return '<p class="error-preview">Markdown解析错误: ' + error.message + '</p>'
    }
  } else {
    return article.value.content
  }
})

const updateTags = () => {
  if (tagsInput.value.trim()) {
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '')
    article.value.tags = [...new Set(tags)]
    tagsInput.value = article.value.tags.join(', ')
  }
}

const removeTag = (tag) => {
  article.value.tags = article.value.tags.filter(t => t !== tag)
  tagsInput.value = article.value.tags.join(', ')
}

const handleContentChange = () => {
  article.value.updatedAt = new Date().toISOString()
}

const handleSave = () => {
  if (!canSave.value) {
    alert('请填写标题和内容')
    return
  }

  if (article.value.encryptionMethod && !encryptionPassword.value) {
    alert('请输入加密密码')
    return
  }

  // 更新标签
  updateTags()

  // 处理加密
  let contentToSave = article.value.content
  if (article.value.encryptionMethod) {
    try {
      if (article.value.encryptionMethod === 'sha256' || article.value.encryptionMethod === 'sha512') {
        // SHA是哈希，保存哈希值
        const hash = article.value.encryptionMethod === 'sha256' 
          ? hashSHA256(contentToSave)
          : hashSHA512(contentToSave)
        contentToSave = `[HASH:${article.value.encryptionMethod}:${hash}]原始内容已哈希处理`
      } else {
        // AES加密
        contentToSave = encrypt(contentToSave, article.value.encryptionMethod, encryptionPassword.value)
      }
      article.value.encrypted = true
    } catch (error) {
      alert('加密失败: ' + error.message)
      return
    }
  }

  // 保存文章
  const articleToSave = {
    ...article.value,
    content: contentToSave,
    originalContentType: article.value.contentType
  }

  if (saveArticle(articleToSave)) {
    alert('文章保存成功！')
    emit('saved')
  } else {
    alert('保存失败，请重试')
  }
}

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true
})
</script>

<style scoped>
.article-create {
  animation: fadeIn 0.3s;
}

.editor-container {
  background: var(--tech-bg-card);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--tech-shadow);
  border: 1px solid var(--tech-border);
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--tech-border);
  background: linear-gradient(135deg, var(--tech-primary) 0%, var(--tech-secondary) 100%);
  color: white;
  font-family: 'Courier New', monospace;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.editor-actions {
  display: flex;
  gap: 1rem;
}

.save-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.save-btn {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: #ffffff;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4), 0 0 20px rgba(0, 212, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.3);
  background: linear-gradient(135deg, #00e5ff 0%, #00aadd 100%);
  border-color: rgba(255, 255, 255, 0.5);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(0, 212, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}

.cancel-btn {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid var(--tech-border);
  background: var(--tech-bg-card);
  transition: background-color 0.3s ease;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--tech-text);
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--tech-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  color: var(--tech-text);
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--tech-text-muted);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  background: rgba(0, 0, 0, 0.4);
}

.form-select {
  background: rgba(0, 0, 0, 0.3);
  color: var(--tech-text);
  cursor: pointer;
}

.form-select option {
  background: var(--tech-bg-dark);
  color: var(--tech-text);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.radio-group {
  display: flex;
  gap: 2rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
  color: var(--tech-text);
  font-family: 'Courier New', monospace;
}

.radio-group input[type="radio"] {
  accent-color: var(--tech-primary);
  cursor: pointer;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-item {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--tech-primary);
  box-shadow: 0 4px 15px rgba(0, 255, 0, 0.3);
  font-family: 'Courier New', monospace;
}

.tag-remove {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.editor-section {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid var(--tech-border);
  background: rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: var(--tech-text-muted);
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.tab-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  color: var(--tech-primary);
}

.tab-btn.active {
  color: var(--tech-primary);
  border-bottom-color: var(--tech-primary);
  background: rgba(0, 255, 0, 0.15);
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-pane,
.preview-pane {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
}

.editor-pane {
  border-right: 1px solid var(--tech-border);
}

.content-editor {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  padding: 0;
  background: transparent;
  color: var(--tech-text);
}

.content-editor::placeholder {
  color: var(--tech-text-muted);
}

.preview-content {
  line-height: 1.8;
  color: var(--tech-text);
  background: transparent;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--tech-primary);
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.preview-content :deep(p) {
  margin-bottom: 1em;
  color: var(--tech-text);
}

.preview-content :deep(code) {
  background: rgba(0, 255, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: var(--tech-accent);
  border: 1px solid var(--tech-border);
}

.preview-content :deep(pre) {
  background: rgba(0, 0, 0, 0.5);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--tech-border);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
}

.preview-content :deep(pre code) {
  background: transparent;
  border: none;
  color: var(--tech-text);
}

.preview-content :deep(blockquote) {
  border-left: 4px solid var(--tech-primary);
  padding-left: 1em;
  margin-left: 0;
  color: var(--tech-text-muted);
  background: rgba(0, 255, 0, 0.05);
  padding: 1em;
  border-radius: 4px;
}

.empty-preview {
  color: var(--tech-text-muted);
  font-style: italic;
  text-align: center;
  padding: 2rem;
  font-family: 'Courier New', monospace;
}

.error-preview {
  color: #ff6b6b;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .editor-actions {
    width: 100%;
  }

  .save-btn,
  .cancel-btn {
    flex: 1;
  }

  .editor-content {
    flex-direction: column;
  }

  .editor-pane {
    border-right: none;
    border-bottom: 1px solid var(--tech-border);
  }
}
</style>

