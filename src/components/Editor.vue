<template>
  <div class="editor-container">
    <div class="editor-header flex justify-between items-center mb-4">
      <h2>{{ isEditing ? '编辑文章' : '创建新文章' }}</h2>
      <div class="editor-actions">
        <button 
          @click="previewMode = !previewMode"
          class="px-3 py-1 mr-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          {{ previewMode ? '编辑模式' : '预览模式' }}
        </button>
        <button 
          @click="saveArticle"
          class="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded"
        >
          保存文章
        </button>
      </div>
    </div>

    <div class="editor-form">
      <!-- 文章标题 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">文章标题</label>
        <input
          v-model="article.title"
          class="w-full p-2 border border-gray-300 rounded"
          placeholder="请输入文章标题"
        />
      </div>

      <!-- 标签输入 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">标签（逗号分隔）</label>
        <tag-input v-model="article.tags" />
      </div>

      <!-- 加解密设置 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">
          <input type="checkbox" v-model="isEncrypted" class="mr-2" />
          加密文章
        </label>
        <div v-if="isEncrypted" class="pl-4 mt-2">
          <select v-model="encryptAlgorithm" class="p-1 mr-2 border rounded">
            <option value="AES-128">AES-128</option>
            <option value="AES-256">AES-256</option>
            <option value="SHA256">SHA256</option>
            <option value="SHA512">SHA512</option>
          </select>
          <input
            v-model="encryptPassword"
            type="password"
            class="p-1 border rounded"
            placeholder="请设置加密密码"
          />
        </div>
      </div>

      <!-- 编辑器主体 -->
      <div class="editor-body flex flex-col md:flex-row gap-4">
        <div v-if="!previewMode" class="w-full md:w-1/2">
          <label class="block mb-1 font-medium">文章内容（支持 Markdown 和 HTML）</label>
          <textarea
            v-model="article.content"
            class="w-full h-[500px] p-2 border border-gray-300 rounded"
            placeholder="请输入文章内容..."
          ></textarea>
        </div>
        
        <div v-else class="w-full md:w-1/2">
          <label class="block mb-1 font-medium">预览效果</label>
          <div 
            class="preview-container w-full h-[500px] p-4 border border-gray-300 rounded overflow-auto"
            v-html="parsedContent"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBlogStore } from '@/store';
import { parseMarkdown } from '@/utils/markdown';
import { useCrypto } from '@/composables/useCrypto';
import TagInput from './TagInput.vue';

const router = useRouter();
const route = useRoute();
const blogStore = useBlogStore();
const { encrypt } = useCrypto();

// 状态
const isEditing = ref(!!route.params.id);
const previewMode = ref(false);
const isEncrypted = ref(false);
const encryptAlgorithm = ref('AES-256');
const encryptPassword = ref('');
const article = ref({
  title: '',
  content: '',
  tags: [],
  isEncrypted: false,
  encryptAlgorithm: '',
  encryptedContent: ''
});

// 初始化文章
if (isEditing.value) {
  const articleData = blogStore.fetchArticleById(route.params.id);
  if (articleData) {
    article.value = { ...articleData };
    isEncrypted.value = articleData.isEncrypted;
    encryptAlgorithm.value = articleData.encryptAlgorithm || 'AES-256';
  }
}

// 解析内容
const parsedContent = computed(() => {
  return parseMarkdown(article.value.content);
});

// 保存文章
const saveArticle = () => {
  if (!article.value.title.trim()) {
    alert('请输入文章标题');
    return;
  }
  
  const articleToSave = { ...article.value };
  
  // 如果需要加密
  if (isEncrypted.value) {
    if (!encryptPassword.value.trim()) {
      alert('请设置加密密码');
      return;
    }
    
    articleToSave.isEncrypted = true;
    articleToSave.encryptAlgorithm = encryptAlgorithm.value;
    articleToSave.encryptedContent = encrypt(
      articleToSave.content,
      encryptPassword.value,
      encryptAlgorithm.value
    );
  } else {
    articleToSave.isEncrypted = false;
    articleToSave.encryptAlgorithm = '';
    articleToSave.encryptedContent = '';
  }
  
  blogStore.saveArticle(articleToSave);
  router.push(`/article/${articleToSave.id}`);
  alert('文章保存成功！');
};

// 监听加密状态变化
watch(isEncrypted, (newVal) => {
  article.value.isEncrypted = newVal;
});
</script>

<style scoped>
.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.editor-body {
  height: 500px;
}

.preview-container {
  background-color: #fff;
  line-height: 1.6;
}

.preview-container h1,
.preview-container h2,
.preview-container h3 {
  margin: 1rem 0;
}

.preview-container img {
  max-width: 100%;
}

.preview-container code {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.preview-container pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>