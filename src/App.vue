<template>
  <div class="app">
    <!-- 黑客代码雨背景 -->
    <CodeRain />
    <!-- 神经网络背景 -->
    <NeuralNetwork />
    
    <header class="header">
      <div class="container">
        <h1 class="logo" @click="currentView = 'list'">新一代个人安全技术博客</h1>
        <nav class="nav">
          <button @click="currentView = 'list'" class="nav-btn">文章列表</button>
          <button @click="handleCreateArticle" class="nav-btn primary">创建文章</button>
          <button @click="toggleTheme" class="theme-toggle" :title="currentTheme === 'dark' ? '切换到浅色主题' : '切换到深色主题'">
            <span v-if="currentTheme === 'dark'">☀️</span>
            <span v-else>🌙</span>
          </button>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <ArticleList v-if="currentView === 'list'" @view-article="viewArticle" @edit-article="editArticle" />
        <ArticleCreate v-else-if="currentView === 'create'" @saved="handleArticleSaved" />
        <ArticleEdit v-else-if="currentView === 'edit'" :article-id="editingArticleId" @saved="handleArticleSaved" />
        <ArticleDetail v-else-if="currentView === 'detail'" :article-id="viewingArticleId" @back="currentView = 'list'" @edit="editArticle" />
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ArticleList from './components/ArticleList.vue'
import ArticleCreate from './components/ArticleCreate.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import ArticleDetail from './components/ArticleDetail.vue'
import CodeRain from './components/CodeRain.vue'
import NeuralNetwork from './components/NeuralNetwork.vue'
import { initTheme, toggleTheme, getTheme } from './utils/theme.js'

const currentView = ref('list')
const editingArticleId = ref(null)
const viewingArticleId = ref(null)
const currentTheme = ref(getTheme())

const viewArticle = (id) => {
  viewingArticleId.value = id
  currentView.value = 'detail'
}

const editArticle = (id) => {
  editingArticleId.value = id
  currentView.value = 'edit'
}

const handleArticleSaved = () => {
  currentView.value = 'list'
  editingArticleId.value = null
}

// 处理创建文章按钮点击
const handleCreateArticle = () => {
  currentView.value = 'create'
}

const toggleThemeHandler = () => {
  currentTheme.value = toggleTheme()
}

onMounted(() => {
  initTheme()
  currentTheme.value = getTheme()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--tech-bg-darker);
  position: relative;
  overflow-x: hidden;
  transition: background-color 0.3s ease;
  z-index: 1;
}

/* 黑客帝国风格网格背景 */
.app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(var(--tech-primary) 1px, transparent 1px),
    linear-gradient(90deg, var(--tech-primary) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
  animation: float 30s ease-in-out infinite;
  opacity: 0.15;
}

:root[data-theme="light"] .app::before {
  opacity: 0.25;
}

/* 黑客帝国风格径向渐变 */
.app::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 200, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  animation: float 25s ease-in-out infinite reverse;
}

:root[data-theme="light"] .app::after {
  background: 
    radial-gradient(circle at 20% 30%, rgba(0, 102, 255, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 153, 255, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 204, 255, 0.1) 0%, transparent 70%);
}


.header {
  background: var(--tech-bg-card);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--tech-border);
  box-shadow: 0 4px 30px var(--tech-shadow);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--tech-primary);
  cursor: pointer;
  margin: 0;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
  text-shadow: 
    0 0 5px var(--tech-primary),
    0 0 10px var(--tech-primary),
    0 0 15px var(--tech-primary),
    0 0 20px var(--tech-primary);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;
}

.logo::before {
  content: '> ';
  color: var(--tech-accent);
  font-size: 1.2em;
  animation: pulse 2s ease-in-out infinite;
}

.logo::after {
  content: '_';
  color: var(--tech-primary);
  animation: pulse 1s ease-in-out infinite;
  margin-left: 2px;
}

.logo:hover {
  transform: scale(1.02);
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
  color: #00ffff;
}

.logo:hover::before {
  color: var(--tech-accent);
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--tech-border);
  background: rgba(0, 212, 255, 0.1);
  color: var(--tech-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  transition: left 0.5s;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: var(--tech-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
  color: #00ffff;
}

.nav-btn.primary {
  background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  color: white;
  border-color: var(--tech-primary);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.nav-btn.primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.nav-btn.primary:hover::before {
  width: 300px;
  height: 300px;
}

.nav-btn.primary:hover {
  box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5);
  transform: translateY(-3px);
}

.main {
  padding: 2rem 0;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 2;
}

.theme-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--tech-border);
  background: rgba(0, 212, 255, 0.1);
  color: var(--tech-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 38px;
}

.theme-toggle:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: var(--tech-primary);
  transform: translateY(-2px) rotate(15deg);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
}

@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }

}
</style>
