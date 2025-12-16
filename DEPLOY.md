# GitHub Pages 部署说明（主分支为master）

## 前提条件
1. 拥有GitHub账号
2. 创建一个名为 `vue-blog` 的仓库（或修改配置文件中的仓库名称）
3. 本地项目已关联到GitHub仓库
4. 安装Node.js 16+版本

## 部署步骤

### 1. 准备工作
确保项目根目录下已添加以下文件：
- `vite.config.ts` - Vite配置（含基础路径设置）
- `.github/workflows/gh-pages.yml` - GitHub Actions工作流配置
- `.gitignore` - Git忽略文件

### 2. 配置修改
根据你的实际情况修改以下配置：
1. `vite.config.ts` 中的 `basePath` 变量，改为 `/你的仓库名称/`
2. `.github/workflows/gh-pages.yml` 中的 `VITE_BASE_PATH` 环境变量，与上述一致
3. 确保所有配置文件中的仓库名称一致

### 3. 本地项目初始化（首次部署）
```bash
# 1. 初始化Git仓库（如果尚未初始化）
git init

# 2. 添加所有文件
git add .

# 3. 首次提交
git commit -m "initial commit: vue blog with github pages support"

# 4. 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/vue-blog.git

# 5. 推送至master分支（主分支）
git push -u origin master