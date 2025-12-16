<template>
  <div class="search-bar">
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文章..."
        class="search-input"
        @input="handleSearch"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
      />
      <button class="search-btn" @click="handleSearch">
        <span class="icon">🔍</span>
      </button>
    </div>
    
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        <h4>{{ suggestion.title }}</h4>
        <p>{{ suggestion.excerpt }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { articlesAPI } from '../api/articles.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const suggestions = ref([]);
const showSuggestions = ref(false);

const emit = defineEmits(['search']);

let searchTimeout = null;

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value);
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (newVal.trim().length >= 2) {
    searchTimeout = setTimeout(async () => {
      try {
        const result = await articlesAPI.search(newVal);
        suggestions.value = result.articles?.slice(0, 5) || [];
      } catch (error) {
        console.error('搜索建议失败:', error);
      }
    }, 300);
  } else {
    suggestions.value = [];
  }
});

const selectSuggestion = (article) => {
  router.push(`/article/${article.id}`);
  showSuggestions.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-container {
  display: flex;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--tech-border);
  border-radius: 8px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--tech-text);
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  padding: 0.5rem;
}

.search-input::placeholder {
  color: var(--tech-text-muted);
}

.search-btn {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--tech-border);
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

.suggestion-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-item:hover {
  background: rgba(0, 212, 255, 0.1);
  transform: translateX(5px);
}

.suggestion-item h4 {
  margin: 0 0 0.5rem 0;
  color: var(--tech-primary);
  font-size: 1rem;
}

.suggestion-item p {
  margin: 0;
  color: var(--tech-text-muted);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

