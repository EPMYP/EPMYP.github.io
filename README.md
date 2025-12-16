# 文章目录结构

   vue-blog/
   ├── .github/
   │   └── workflows/
   │       └── gh-pages.yml  # GitHub Actions自动部署工作流
   ├── src/
   │   ├── assets/           # 静态资源
   │   ├── components/       # 组件
   │   │   ├── article/      # 文章相关组件
   │   │   ├── editor/       # 编辑器组件
   │   │   └── layout/       # 布局组件
   │   ├── router/           # 路由配置
   │   ├── store/            # Pinia状态管理
   │   ├── style.css         # 全局样式
   │   ├── types/            # 类型定义
   │   ├── utils/            # 工具函数
   │   ├── views/            # 页面视图
   │   └── vite-env.d.ts     # Vite类型声明
   ├── .gitignore            # Git忽略文件
   ├── DEPLOY.md             # 部署说明文档
   ├── index.html            # 入口HTML
   ├── package.json          # 项目依赖
   ├── postcss.config.js     # PostCSS配置
   ├── tailwind.config.js    # Tailwind配置
   ├── tsconfig.json         # TypeScript配置
   └── vite.config.ts        # Vite配置