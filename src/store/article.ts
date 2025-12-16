// 导入Pinia的defineStore函数，用于定义状态管理模块
import { defineStore } from 'pinia';
// 导入文章和标签相关类型定义
import { Article, ArticleForm, Tag } from '@/types';
// 导入加密相关工具函数
import { encryptArticle, sha256Encrypt } from '@/utils/encryption';
// 导入Markdown处理工具函数
import { extractExcerpt, markdownToHtml, parseTags } from '@/utils/markdown';

// 模拟数据库数据 - 实际项目中会从MySQL数据库获取
const mockArticles: Article[] = [
  {
    id: 1,
    title: 'Vue 3 组合式API入门',
    content: '# Vue 3 组合式API\n\nVue 3 引入的组合式API（Composition API）是一种全新的代码组织方式，相比选项式API（Options API），它提供了更好的代码复用性和逻辑组织能力。\n\n## 核心优势\n\n- 更好的代码复用\n- 更灵活的逻辑组织\n- 更好的类型推断支持\n- 更小的打包体积\n\n## 基础使用\n\n```javascript\nimport { ref, computed } from \'vue\'\n\nexport default {\n  setup() {\n    const count = ref(0)\n    const double = computed(() => count.value * 2)\n\n    const increment = () => {\n      count.value++\n    }\n\n    return { count, double, increment }\n  }\n}\n```',
    htmlContent: markdownToHtml('# Vue 3 组合式API\n\nVue 3 引入的组合式API（Composition API）是一种全新的代码组织方式，相比选项式API（Options API），它提供了更好的代码复用性和逻辑组织能力。\n\n## 核心优势\n\n- 更好的代码复用\n- 更灵活的逻辑组织\n- 更好的类型推断支持\n- 更小的打包体积\n\n## 基础使用\n\n```javascript\nimport { ref, computed } from \'vue\'\n\nexport default {\n  setup() {\n    const count = ref(0)\n    const double = computed(() => count.value * 2)\n\n    const increment = () => {\n      count.value++\n    }\n\n    return { count, double, increment }\n  }\n}\n```'),
    excerpt: 'Vue 3 引入的组合式API（Composition API）是一种全新的代码组织方式，相比选项式API（Options API），它提供了更好的代码复用性和逻辑组织能力。核心优势：更好的代码复用、更灵活的逻辑组织、更好的类型推断支持、更小的打包体积...',
    tags: ['Vue', '前端', 'Composition API'],
    isEncrypted: false,
    createdAt: '2025-01-15T10:30:00',
    updatedAt: '2025-01-15T10:30:00',
    viewCount: 128
  },
  {
    id: 2,
    title: '加密文章示例',
    content: '', // 加密文章明文内容为空
    encryptedContent: encryptArticle('这是一篇加密文章的内容，只有输入正确密码才能查看。\n\n## 加密文章的用途\n- 存储私密笔记\n- 分享敏感信息\n- 个人日记\n\n密码是：123456（仅作示例）', '123456'),
    passwordHash: sha256Encrypt('123456'), // 密码"123456"的SHA256哈希
    excerpt: '这是一篇加密文章，需要密码才能查看',
    tags: ['加密', '示例'],
    isEncrypted: true,
    createdAt: '2025-01-16T14:20:00',
    updatedAt: '2025-01-16T14:20:00',
    viewCount: 76
  }
];

// 模拟标签数据 - 实际项目中会从MySQL数据库获取
const mockTags: Tag[] = [
  { id: 1, name: 'Vue', count: 5 },
  { id: 2, name: '前端', count: 12 },
  { id: 3, name: 'Composition API', count: 2 },
  { id: 4, name: '加密', count: 3 },
  { id: 5, name: '示例', count: 8 }
];

/**
 * 文章状态管理模块
 * @description 管理文章和标签的状态，提供相关操作方法
 */
export const useArticleStore = defineStore('article', {
  // 状态定义 - 存储文章、标签等数据
  state: () => ({
    articles: [...mockArticles] as Article[], // 文章列表
    tags: [...mockTags] as Tag[], // 标签列表
    currentArticle: null as Article | null, // 当前选中的文章
    isLoading: false, // 加载状态标识
    error: '' as string // 错误信息
  }),
  //  actions - 定义修改状态的方法（支持异步）
  actions: {
    /**
     * 获取所有文章
     * @returns 文章列表数组
     * @description 模拟API请求，实际项目中会调用后端接口从MySQL获取
     */
    getArticles() {
      this.isLoading = true; // 开始加载
      // 模拟API请求延迟（500ms）
      setTimeout(() => {
        this.isLoading = false; // 加载完成
      }, 500);
      return [...this.articles]; // 返回文章列表副本，避免直接修改原数据
    },

    /**
     * 根据ID获取单个文章
     * @param id 文章ID
     * @returns 对应的文章对象（找不到返回null）
     */
    getArticleById(id: number) {
      this.isLoading = true;
      // 模拟API请求延迟
      setTimeout(() => {
        // 查找对应ID的文章
        this.currentArticle = this.articles.find(article => article.id === id) || null;
        this.isLoading = false;
      }, 500);
      return this.currentArticle;
    },

    /**
     * 根据标签筛选文章
     * @param tagName 标签名称
     * @returns 该标签下的所有文章
     */
    getArticlesByTag(tagName: string) {
      this.isLoading = true;
      // 模拟API请求延迟
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
      // 筛选包含该标签的文章
      return this.articles.filter(article => 
        article.tags.includes(tagName)
      );
    },

    /**
     * 创建新文章
     * @param form 文章发布表单数据
     * @returns 新建的文章对象
     * @description 处理文章数据，包括标签解析、摘要生成、加密处理等
     */
    createArticle(form: ArticleForm) {
      this.isLoading = true;
      try {
        // 解析标签字符串为标签数组
        const tags = parseTags(form.tags);
        // 自动提取文章摘要
        const excerpt = extractExcerpt(form.content);
        
        let articleContent = form.content; // 文章明文内容
        let encryptedContent = ''; // 加密后的内容
        let passwordHash = ''; // 密码哈希
        
        // 如果需要加密且密码存在
        if (form.isEncrypted && form.password) {
          encryptedContent = encryptArticle(form.content, form.password); // 加密文章内容
          passwordHash = sha256Encrypt(form.password); // 生成密码哈希（不存储明文密码）
          articleContent = ''; // 加密文章清空明文内容
        }
        
        // 根据编辑器类型处理内容为HTML
        const htmlContent = form.editorType === 'markdown' 
          ? markdownToHtml(form.content) // Markdown转HTML
          : form.content; // HTML直接使用
        
        // 构建新文章对象
        const newArticle: Article = {
          id: Date.now(), // 使用时间戳作为临时ID（实际项目中由数据库生成）
          title: form.title,
          content: articleContent,
          htmlContent,
          excerpt,
          tags,
          isEncrypted: form.isEncrypted,
          encryptedContent: form.isEncrypted ? encryptedContent : undefined,
          passwordHash: form.isEncrypted ? passwordHash : undefined,
          createdAt: new Date().toISOString(), // 当前时间（ISO格式）
          updatedAt: new Date().toISOString(),
          viewCount: 0 // 初始阅读量为0
        };
        
        // 将新文章添加到文章列表（头部添加，最新文章在前）
        this.articles.unshift(newArticle);
        
        // 更新标签统计（新增标签或增加标签关联数量）
        this.updateTagStatistics(tags);
        
        this.isLoading = false;
        return newArticle;
      } catch (error) {
        this.error = '创建文章失败';
        this.isLoading = false;
        throw error; // 抛出错误，让调用方处理
      }
    },

    /**
     * 更新标签统计信息
     * @param tags 新文章的标签数组
     * @description 新增标签（如果不存在）或增加标签的文章计数
     */
    updateTagStatistics(tags: string[]) {
      tags.forEach(tagName => {
        // 查找标签是否已存在
        const existingTag = this.tags.find(tag => tag.name === tagName);
        if (existingTag) {
          existingTag.count++; // 已存在则计数+1
        } else {
          // 不存在则新增标签
          this.tags.push({
            id: Date.now() + Math.random(), // 临时ID
            name: tagName,
            count: 1 // 初始计数为1
          });
        }
      });
    },

    /**
     * 搜索文章
     * @param keyword 搜索关键词
     * @returns 符合条件的文章列表
     * @description 支持标题、摘要、标签的模糊搜索
     */
    searchArticles(keyword: string) {
      this.isLoading = true;
      // 模拟API请求延迟
      setTimeout(() => {
        this.isLoading = false;
      }, 300);
      
      const lowerKeyword = keyword.toLowerCase(); // 关键词转为小写，不区分大小写
      // 筛选条件：标题、摘要、标签包含关键词
      return this.articles.filter(article => 
        article.title.toLowerCase().includes(lowerKeyword) ||
        article.excerpt.toLowerCase().includes(lowerKeyword) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    }
  }
});