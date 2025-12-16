<template>
  <div class="article-edit">
    <div class="editor-container">
      <div class="editor-header">
        <h2>编辑文章</h2>
        <div class="editor-actions">
          <button @click="handleSave" class="save-btn" :disabled="!canSave">保存文章</button>
          <button @click="$emit('saved')" class="cancel-btn">取消</button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <p>加载中...</p>
      </div>

      <div v-else-if="!article" class="error">
        <p>文章不存在</p>
      </div>

      <div v-else>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { marked } from 'marked'
import { getArticle, saveArticle } from '../utils/storage'
import { decrypt, encrypt, hashSHA256, hashSHA512 } from '../utils/crypto'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['saved'])

const article = ref(null)
const loading = ref(true)
const encryptionPassword = ref('')
const tagsInput = ref('')
const activeTab = ref('split')

const canSave = computed(() => {
  return article.value && article.value.title.trim() !== '' && article.value.content.trim() !== ''
})

const previewContent = computed(() => {
  if (!article.value || !article.value.content) return '<p class="empty-preview">开始写作，预览将在这里显示...</p>'
  
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

const loadArticle = async () => {
  loading.value = true
  const loadedArticle = getArticle(props.articleId)
  
  if (loadedArticle) {
    article.value = { ...loadedArticle }
    
    // 如果文章已加密，需要解密
    if (article.value.encrypted && article.value.content) {
      // 检查是否是哈希
      if (article.value.content.startsWith('[HASH:')) {
        // 哈希值无法解密，显示提示
        article.value.content = '[此文章已使用哈希验证，无法查看原始内容]'
      } else {
        // 尝试从存储中获取密码提示，或者要求用户输入
        const password = prompt('此文章已加密，请输入密码以查看内容：')
        if (password) {
          try {
            // 尝试不同的加密方法
            let decrypted = false
            for (const method of ['aes-256', 'aes-128']) {
              try {
                article.value.content = decrypt(article.value.content, method, password)
                article.value.encryptionMethod = method
                decrypted = true
                break
              } catch (e) {
                // 继续尝试下一个方法
              }
            }
            if (!decrypted) {
              alert('密码错误或加密方法不匹配')
              article.value.content = '[解密失败]'
            }
          } catch (error) {
            alert('解密失败: ' + error.message)
            article.value.content = '[解密失败]'
          }
        } else {
          article.value.content = '[需要密码才能查看]'
        }
      }
    }
    
    // 恢复内容类型
    if (article.value.originalContentType) {
      article.value.contentType = article.value.originalContentType
    }
    
    // 设置标签输入
    if (article.value.tags && article.value.tags.length > 0) {
      tagsInput.value = article.value.tags.join(', ')
    }
  }
  
  loading.value = false
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
        const hash = article.value.encryptionMethod === 'sha256' 
          ? hashSHA256(contentToSave)
          : hashSHA512(contentToSave)
        contentToSave = `[HASH:${article.value.encryptionMethod}:${hash}]原始内容已哈希处理`
      } else {
        contentToSave = encrypt(contentToSave, article.value.encryptionMethod, encryptionPassword.value)
      }
      article.value.encrypted = true
    } catch (error) {
      alert('加密失败: ' + error.message)
      return
    }
  } else {
    article.value.encrypted = false
  }

  // 保存文章
  article.value.updatedAt = new Date().toISOString()
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
.article-edit {
  animation: fadeIn 0.3s;
}

.editor-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  background: white;
  color: #667eea;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.loading,
.error {
  padding: 4rem 2rem;
  text-align: center;
  color: #666;
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
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
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-item {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.5);
}

.editor-section {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: #f0f0f0;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: white;
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
}

.editor-pane {
  border-right: 1px solid #e0e0e0;
}

.content-editor {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  padding: 0;
}

.preview-content {
  line-height: 1.8;
  color: #333;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #333;
}

.preview-content :deep(p) {
  margin-bottom: 1em;
}

.preview-content :deep(code) {
  background: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.preview-content :deep(pre) {
  background: #f4f4f4;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
}

.preview-content :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
}

.empty-preview {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.error-preview {
  color: #ff6b6b;
  padding: 1rem;
  background: #ffe0e0;
  border-radius: 8px;
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
    border-bottom: 1px solid #e0e0e0;
  }
}
</style>

