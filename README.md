# 文章目录结构

    vue-blog/
    ├── .github/
    │   └── workflows/
    │       └── deploy.yml       # GitHub 自动部署工作流
    ├── public/
    │   └── favicon.ico
    ├── src/
    │   ├── assets/              # 静态资源
    │   ├── components/          # 组件
    │   │   ├── Editor.vue       # 文章编辑器（带预览）
    │   │   ├── EncryptModal.vue # 加解密模态框
    │   │   ├── ArticleCard.vue  # 文章卡片
    │   │   ├── TagInput.vue     # 标签输入组件
    │   │   └── Navbar.vue       # 导航栏
    │   ├── composables/         # 组合式函数
    │   │   ├── useCrypto.js     # 加密解密工具
    │   │   └── useStorage.js    # 本地存储工具
    │   ├── pages/               # 页面
    │   │   ├── Home.vue         # 首页
    │   │   ├── EditorPage.vue   # 编辑页面
    │   │   ├── ArticlePage.vue  # 文章详情页
    │   │   └── TagsPage.vue     # 标签页面
    │   ├── router/              # 路由配置
    │   │   └── index.js
    │   ├── store/               # 状态管理
    │   │   └── index.js
    │   ├── utils/               # 工具函数
    │   │   └── markdown.js      # Markdown 解析
    │   ├── App.vue              # 根组件
    │   └── main.js              # 入口文件
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── README.md