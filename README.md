# 新一代个人安全技术博客

一个功能完整的新一代个人安全技术博客系统，采用现代化Vue技术栈，支持文章加密、标签管理、实时预览、用户认证、赞赏功能、AI摘要等。专为技术爱好者和安全研究人员设计，提供极致的写作和阅读体验。

## 🚀 GitHub Pages 自动部署

本项目已配置GitHub Actions，支持自动构建和部署到GitHub Pages。只需将代码推送到GitHub仓库，即可自动发布网页。

详细部署指南请查看 [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md)

## ✨ 功能特性

### 核心功能
- 🎨 **科技感UI设计** - 富含计算机科学网络高新技术的元素主题，代码风格、终端风格、网络节点、数据流等动态效果
- 🔒 **文章加密** - 支持AES-128、AES-256、SHA256、SHA512多种加密方式
- 🏷️ **标签管理** - 为文章添加多个标签，方便分类和检索
- 👁️ **实时预览** - 支持Markdown和HTML，边写边预览
- 🔍 **智能搜索** - 全文搜索功能，支持关键词搜索和标签筛选
- 💰 **赞赏功能** - 支持微信、支付宝、USDT-TRC20、Bitcoin、Ethereum等多种支付方式
- 🤖 **AI智能摘要** - 自动生成文章摘要和重点内容（支持OpenAI等）
- 📸 **文章封面** - 支持上传和设置文章封面图片
- 💻 **代码高亮** - 使用GitHub代码块样式，支持多种编程语言

### 用户系统
- 👤 **用户注册登录** - 邮箱注册、密码登录
- ✉️ **邮箱验证** - 注册后发送验证邮件
- 🔐 **密码重置** - 忘记密码功能
- 🔗 **OAuth登录** - 支持GitHub、Google、QQ、微信登录
- 👥 **用户管理** - 管理员后台管理用户

### 数据存储
- 💾 **JSON文件存储** - 使用JSON文件存储所有数据，无需MySQL数据库
- 📊 **数据管理** - 数据存储在 `server/data` 目录，便于备份和管理
- 🔄 **自动初始化** - 首次启动自动创建默认管理员账户

### 部署支持
- 🚀 **1Panel部署** - 完整的1Panel部署脚本和配置
- 🚀 **aaPanel部署** - 完整的aaPanel部署脚本和配置
- 📦 **GitHub Pages** - 前端静态文件可部署到GitHub Pages
- 🔧 **Docker支持** - 可容器化部署

## 🛠️ 技术栈

### 前端
- Vue 3 (Composition API)
- Vite
- Axios (HTTP客户端)
- Highlight.js (代码高亮)
- Marked (Markdown解析)
- Pinia (状态管理)
- Vue Router (路由)

### 后端
- Node.js + Express
- JSON文件存储（无需数据库）
- JWT (身份认证)
- Passport.js (OAuth认证)
- Nodemailer (邮件发送)
- Multer (文件上传)
- Sharp (图片处理)
- bcryptjs (密码加密)

## 📦 安装和运行

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **安装前端依赖**
   ```bash
   npm install
   ```

3. **安装后端依赖**
   ```bash
   cd server
   npm install
   ```

4. **配置环境变量**
   ```bash
   cd server
   # 创建 .env 文件，配置JWT密钥、邮箱等（无需数据库配置）
   nano .env
   ```
   
   最小配置示例：
   ```env
   JWT_SECRET=your_random_secret_key
   PORT=3000
   ```

6. **启动后端服务**
   ```bash
   npm run dev
   # 或
   npm start
   ```

7. **启动前端开发服务器**（新终端）
   ```bash
   cd ..
   npm run dev
   ```

### 构建生产版本

```bash
# 构建前端
npm run build

# 后端已配置为生产模式
cd server
npm start
```

## 🚀 部署指南

本项目支持多种部署方式，包括GitHub Pages、1Panel和aaPanel。根据您的需求选择合适的部署方式。

### 📋 部署方式对比

| 部署方式 | 适用场景 | 前端 | 后端 | 数据库 |
|---------|---------|------|------|--------|
| GitHub Pages | 静态展示、个人博客 | ✅ | ❌ | ❌ |
| 1Panel | 完整功能、国内服务器 | ✅ | ✅ | JSON文件 |
| aaPanel | 完整功能、宝塔用户 | ✅ | ✅ | JSON文件 |

---

## 🌐 方式一：GitHub Pages 部署（仅前端）

GitHub Pages适合部署静态前端，适合展示型博客。后端需要单独部署到服务器。

### 前置要求
- GitHub账号
- 已创建GitHub仓库

### 部署步骤

#### 1. 准备代码

```bash
# 克隆或Fork仓库
git clone https://github.com/your-username/my-secure-blog.git
cd my-secure-blog
```

#### 2. 配置仓库名称

如果您的仓库名不是 `my-secure-blog`，需要修改配置：

**方法一：修改 `vite.config.js`**
```javascript
export default {
  base: '/your-repo-name/',  // 修改为您的仓库名
  // ...
}
```

**方法二：设置环境变量**
在 `.github/workflows/deploy.yml` 中会自动使用仓库名，无需手动配置。

#### 3. 推送代码到GitHub

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

#### 4. 启用GitHub Pages

1. 进入GitHub仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 下拉菜单中选择 **GitHub Actions**
4. 保存设置

#### 5. 查看部署状态

1. 点击仓库顶部的 **Actions** 标签
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待部署完成（通常需要1-2分钟）

#### 6. 访问网站

部署完成后，访问地址：
```
https://[您的GitHub用户名].github.io/[仓库名]/
```

例如：`https://username.github.io/my-secure-blog/`

### 配置后端API（可选）

如果需要在GitHub Pages上使用完整功能，需要单独部署后端：

1. 将后端部署到服务器（参考1Panel或aaPanel部署）
2. 在项目根目录创建 `.env` 文件：
```env
VITE_API_URL=https://your-backend-domain.com/api
```

3. 重新构建并推送：
```bash
npm run build
git add .
git commit -m "Update API URL"
git push origin main
```

### 注意事项

- ⚠️ GitHub Pages只支持静态文件，无法运行Node.js后端
- ⚠️ 如需完整功能（登录、文章管理等），必须单独部署后端
- ⚠️ 建议使用HTTPS访问（GitHub Pages默认支持）

---

## 🖥️ 方式二：1Panel 部署（完整功能）

1Panel是一个现代化的Linux服务器运维管理面板，适合部署完整的博客系统。

### 前置要求
- Linux服务器（推荐Ubuntu 20.04+或CentOS 7+）
- 已安装1Panel面板
- Node.js 18+（可通过1Panel应用商店安装）
- Nginx（用于反向代理）

### 部署步骤

#### 1. 上传代码到服务器

**方法一：使用Git克隆（推荐）**
```bash
# SSH登录服务器
ssh root@your-server-ip

# 进入网站目录
cd /www/wwwroot

# 克隆仓库
git clone https://github.com/your-username/my-secure-blog.git
cd my-secure-blog
```

**方法二：使用1Panel文件管理**
1. 进入1Panel → 文件管理
2. 上传项目压缩包到 `/www/wwwroot`
3. 解压文件

#### 2. 运行部署脚本

```bash
# 进入项目目录
cd /www/wwwroot/my-secure-blog

# 赋予执行权限
chmod +x 1panel-deploy.sh

# 运行部署脚本
./1panel-deploy.sh
```

部署脚本会自动：
- 安装前端依赖
- 安装后端依赖
- 构建前端项目
- 创建必要的目录

#### 3. 配置环境变量

```bash
# 进入后端目录
cd server

# 创建.env文件
nano .env
```

**最小配置示例：**
```env
# JWT密钥（请使用强随机字符串）
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# 服务器端口
PORT=3000

# 前端地址（用于OAuth回调）
FRONTEND_URL=http://your-domain.com
```

**完整配置示例：**
```env
# JWT配置
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# 服务器配置
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://your-domain.com

# 邮箱配置（用于发送验证码、重置密码等）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# GitHub OAuth（可选）
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth（可选）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI摘要服务（可选）
AI_API_KEY=your_openai_api_key
AI_PROVIDER=openai
```

保存文件：按 `Ctrl+X`，然后输入 `Y`，再按 `Enter`

#### 4. 在1Panel中创建Node.js应用

1. 进入1Panel面板
2. 点击 **应用商店** → **Node.js**
3. 点击 **创建应用**
4. 填写配置：
   - **应用名称**：my-secure-blog
   - **应用目录**：`/www/wwwroot/my-secure-blog/server`
   - **启动文件**：`index.js`
   - **运行命令**：`node index.js`
   - **端口**：3000（或您.env中配置的端口）
   - **运行用户**：www（或root）
5. 点击 **确认** 创建应用
6. 启动应用

#### 5. 配置Nginx反向代理

1. 进入1Panel → **网站** → **创建网站**
2. 填写域名：`your-domain.com`
3. 创建完成后，点击 **设置** → **配置文件**
4. 替换为以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /www/wwwroot/my-secure-blog/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # 文件上传目录
    location /uploads {
        alias /www/wwwroot/my-secure-blog/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /www/wwwroot/my-secure-blog/dist;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

5. 保存配置并重载Nginx

#### 6. 配置SSL证书（推荐）

1. 进入网站设置 → **SSL**
2. 选择 **Let's Encrypt** 免费证书
3. 填写邮箱，点击 **申请**
4. 开启 **强制HTTPS**

#### 7. 设置文件权限

```bash
# 设置数据目录权限
chmod -R 755 /www/wwwroot/my-secure-blog/server/data
chown -R www:www /www/wwwroot/my-secure-blog/server/data

# 设置上传目录权限
chmod -R 755 /www/wwwroot/my-secure-blog/server/uploads
chown -R www:www /www/wwwroot/my-secure-blog/server/uploads
```

#### 8. 访问网站

打开浏览器访问：`http://your-domain.com` 或 `https://your-domain.com`

### 常见问题

**Q: 端口被占用怎么办？**
```bash
# 查看端口占用
lsof -i:3000
# 或修改.env中的PORT为其他端口（如3001）
```

**Q: 数据文件权限错误？**
```bash
chmod -R 755 server/data server/uploads
chown -R www:www server/data server/uploads
```

**Q: 如何查看日志？**
- 应用日志：1Panel → 应用 → my-secure-blog → 日志
- 系统日志：`tail -f /www/wwwroot/my-secure-blog/server/logs/*.log`

---

## 🎛️ 方式三：aaPanel 部署（完整功能）

aaPanel是宝塔面板的国际版，适合熟悉宝塔面板的用户。

### 前置要求
- Linux服务器
- 已安装aaPanel面板
- Node.js 18+（可通过aaPanel应用商店安装）
- Nginx

### 部署步骤

#### 1. 上传代码

```bash
# SSH登录服务器
ssh root@your-server-ip

# 进入网站目录
cd /www/wwwroot

# 克隆仓库
git clone https://github.com/your-username/my-secure-blog.git
cd my-secure-blog
```

#### 2. 运行部署脚本

```bash
# 赋予执行权限
chmod +x aapanel-deploy.sh

# 运行部署脚本
./aapanel-deploy.sh
```

#### 3. 配置环境变量

同1Panel部署步骤3，创建 `server/.env` 文件。

#### 4. 在aaPanel中创建Node.js应用

1. 进入aaPanel → **App Store** → **Node.js**
2. 点击 **Create**
3. 填写配置：
   - **App Name**: my-secure-blog
   - **App Path**: `/www/wwwroot/my-secure-blog/server`
   - **Start File**: `index.js`
   - **Port**: 3000
4. 点击 **Create** 创建应用
5. 启动应用

#### 5. 配置Nginx

1. 进入aaPanel → **Website** → **Add Site**
2. 填写域名：`your-domain.com`
3. 创建完成后，点击 **Settings** → **Configuration File**
4. 使用与1Panel相同的Nginx配置（见上方）

#### 6. 配置SSL和文件权限

同1Panel部署步骤6和7。

---

## 📝 部署后配置

### 初始化管理员账户

首次启动后，系统会自动创建默认管理员账户：
- **用户名**：admin
- **密码**：admin123（或通过环境变量 `ADMIN_PASSWORD` 设置）

⚠️ **重要**：登录后请立即修改密码！

### 数据备份

项目使用JSON文件存储，数据位于 `server/data` 目录：

```bash
# 备份数据
tar -czf backup-$(date +%Y%m%d).tar.gz server/data

# 恢复数据
tar -xzf backup-20240101.tar.gz -C server/
```

### 更新部署

```bash
# 进入项目目录
cd /www/wwwroot/my-secure-blog

# 拉取最新代码
git pull

# 更新依赖
cd server && npm install --production
cd .. && npm install

# 重新构建前端
npm run build

# 重启Node.js应用（在1Panel/aaPanel中操作）
```

---

## 🔧 详细部署文档

更多部署细节请参考：
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) - GitHub Pages部署指南

## ⚙️ 配置说明

### 环境变量配置

在 `server/.env` 文件中配置：

#### 必需配置
```env
# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# 服务器
PORT=3000
```

#### 可选配置
```env
# 邮箱（用于发送验证码）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
SMTP_FROM=noreply@yourdomain.com

# OAuth（GitHub、Google、QQ、微信）
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://your-domain.com/api/auth/github/callback

# AI摘要（OpenAI等）
AI_API_KEY=your_ai_api_key
AI_PROVIDER=openai
```

### 前端配置

在项目根目录创建 `.env` 文件：
```env
VITE_API_URL=http://localhost:3000/api
VITE_GITHUB_REPO=your-username/my-secure-blog
VITE_GITHUB_TOKEN=your_github_token
```

## 📖 使用说明

### 用户注册和登录

1. **邮箱注册**
   - 访问注册页面
   - 填写用户名、邮箱、密码
   - 查收验证邮件并点击验证链接

2. **OAuth登录**
   - 点击对应的OAuth登录按钮（GitHub、Google、QQ、微信）
   - 授权后自动登录

3. **密码重置**
   - 点击"忘记密码"
   - 输入邮箱，查收重置密码邮件

### 创建和发布文章

1. 登录后点击"创建文章"
2. 填写文章标题和内容
3. 选择内容类型（Markdown或HTML）
4. 上传文章封面（可选）
5. 添加标签（用逗号分隔）
6. 选择加密方式（可选）
7. 使用实时预览功能
8. 点击"保存文章"

### 搜索文章

- 在搜索栏输入关键词
- 支持标题、内容、摘要搜索
- 支持标签筛选

### 设置赞赏

1. 在文章编辑页面
2. 配置支付方式（微信、支付宝、USDT等）
3. 上传支付二维码或输入地址
4. 保存配置

### AI摘要功能

- 发布文章时自动生成摘要
- 如果配置了AI API，会自动提取重点内容
- 未配置时使用简单文本摘要

## 🗂️ 项目结构

```
my-secure-blog/
├── server/                 # 后端服务
│   ├── config/            # 配置文件
│   │   ├── database.js    # 数据库配置
│   │   └── passport.js    # OAuth配置
│   ├── routes/            # 路由
│   │   ├── auth.js        # 认证路由
│   │   ├── articles.js    # 文章路由
│   │   ├── payments.js    # 支付路由
│   │   ├── upload.js      # 上传路由
│   │   └── users.js       # 用户路由
│   ├── middleware/        # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── utils/             # 工具函数
│   │   ├── ai.js          # AI摘要
│   │   ├── email.js       # 邮件发送
│   │   └── slugify.js     # URL生成
│   ├── uploads/           # 上传文件目录
│   ├── index.js           # 入口文件
│   └── package.json       # 后端依赖
├── src/                    # 前端源码
│   ├── api/               # API客户端
│   ├── components/        # Vue组件
│   │   ├── ArticleList.vue
│   │   ├── ArticleCreate.vue
│   │   ├── ArticleDetail.vue
│   │   ├── ArticleEdit.vue
│   │   ├── CommentSection.vue
│   │   ├── SearchBar.vue
│   │   └── DonationSection.vue
│   ├── utils/             # 工具函数
│   │   ├── crypto.js      # 加密解密
│   │   ├── codeHighlight.js # 代码高亮
│   │   └── storage.js     # 本地存储
│   ├── App.vue            # 主应用
│   └── main.js            # 入口文件
├── .github/
│   └── workflows/         # GitHub Actions
├── 1panel-deploy.sh       # 1Panel部署脚本
├── aapanel-deploy.sh      # aaPanel部署脚本
└── DEPLOYMENT.md          # 部署指南
```

## 🔒 安全注意事项

- 文章数据存储在MySQL数据库中，定期备份
- 加密密码请妥善保管，忘记密码将无法恢复文章内容
- SHA256/SHA512是单向哈希，选择后无法查看原始内容
- JWT密钥请使用强随机字符串
- OAuth密钥请妥善保管，不要提交到代码仓库
- 生产环境请使用HTTPS

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT

## 🚀 GitHub Pages 快速部署

### 一键部署步骤

1. **Fork 或克隆此仓库**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   ```

2. **修改仓库名配置**（如果仓库名不是 `my-secure-blog`）
   - 编辑 `vite.config.js`，修改 `base` 路径
   - 或设置环境变量 `VITE_BASE_PATH`

3. **推送到GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

5. **等待自动部署**
   - 进入 Actions 标签页查看部署状态
   - 部署完成后访问：`https://[用户名].github.io/[仓库名]/`

详细部署指南请查看 [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md)

## 🙏 致谢

感谢所有开源项目的支持！
