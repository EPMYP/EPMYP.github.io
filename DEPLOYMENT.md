# 部署指南

## 1Panel 部署

### 前置要求
- 1Panel面板已安装
- Node.js 18+ 已安装
- Nginx 已安装（用于反向代理）
- 注意：此项目使用JSON文件存储，无需MySQL数据库

### 部署步骤

1. **上传代码**
   ```bash
   # 在1Panel文件管理中上传代码，或使用Git克隆
   cd /www/wwwroot
   git clone https://github.com/your-username/my-secure-blog.git
   cd my-secure-blog
   ```

2. **运行部署脚本**
   ```bash
   chmod +x 1panel-deploy.sh
   ./1panel-deploy.sh
   ```

3. **配置环境变量**
   ```bash
   cd server
   # 创建 .env 文件，配置邮箱、OAuth等（无需数据库配置）
   nano .env
   ```
   
   示例配置：
   ```env
   PORT=3000
   JWT_SECRET=your_random_secret_key
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_password
   FRONTEND_URL=http://your-domain.com
   ```

5. **在1Panel中创建Node.js应用**
   - 进入1Panel → 应用商店 → Node.js
   - 创建新应用
   - 应用目录：`/www/wwwroot/my-secure-blog/server`
   - 启动文件：`index.js`
   - 端口：3000（或自定义）
   - 运行命令：`node index.js`

6. **配置Nginx反向代理**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # 前端静态文件
       location / {
           root /www/wwwroot/my-secure-blog/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # 后端API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # 文件上传
       location /uploads {
           alias /www/wwwroot/my-secure-blog/server/uploads;
       }
   }
   ```

## aaPanel 部署

### 前置要求
- aaPanel面板已安装
- Node.js 18+ 已安装
- Nginx 已安装
- 注意：此项目使用JSON文件存储，无需MySQL数据库

### 部署步骤

1. **上传代码**
   ```bash
   cd /www/wwwroot
   git clone https://github.com/your-username/my-secure-blog.git
   cd my-secure-blog
   ```

2. **运行部署脚本**
   ```bash
   chmod +x aapanel-deploy.sh
   ./aapanel-deploy.sh
   ```

3. **配置环境变量**
   ```bash
   cd server
   cp .env.example .env
   nano .env
   ```

4. **初始化数据库**
   ```bash
   cd server
   npm run migrate
   ```

5. **在aaPanel中创建Node.js应用**
   - 进入aaPanel → 应用商店 → Node.js
   - 创建新应用
   - 应用目录：`/www/wwwroot/my-secure-blog/server`
   - 启动文件：`index.js`
   - 端口：3000

6. **配置Nginx反向代理**（同1Panel配置）

## 环境变量配置

### 必需配置
- `JWT_SECRET`: JWT密钥（请使用强随机字符串）
- `PORT`: 服务器端口（默认3000）

### 可选配置
- `SMTP_*`: 邮箱配置（用于发送验证码）
- `GITHUB_*`: GitHub OAuth配置
- `GOOGLE_*`: Google OAuth配置
- `QQ_*`: QQ OAuth配置
- `WECHAT_*`: 微信OAuth配置
- `AI_API_KEY`: AI摘要服务密钥

## 数据存储

项目使用JSON文件存储数据，所有数据自动保存在 `server/data` 目录中：
- `users.json` - 用户数据
- `articles.json` - 文章数据
- `payment_configs.json` - 支付配置
- `donations.json` - 赞赏记录
- `oauth_providers.json` - OAuth关联
- `system_configs.json` - 系统配置

首次启动时会自动创建默认管理员账户（如果不存在）：
- 用户名: admin
- 密码: admin123（或通过环境变量 `ADMIN_PASSWORD` 设置）
- 请登录后立即修改密码！

## 常见问题

### 1. 端口被占用
修改 `server/.env` 中的 `PORT` 配置，或停止占用端口的服务。

### 2. 数据文件权限问题
确保 `server/data` 目录有写入权限：
```bash
chmod -R 755 server/data
chown -R www:www server/data
```

### 3. 文件上传失败
检查 `server/uploads` 目录权限：
```bash
chmod -R 755 server/uploads
chown -R www:www server/uploads
```

### 4. OAuth登录失败
确保OAuth应用的回调URL配置正确，格式为：`http://your-domain.com/api/auth/{provider}/callback`

## 更新部署

```bash
cd /www/wwwroot/my-secure-blog
git pull
cd server
npm install --production
cd ..
npm install
npm run build
# 重启Node.js应用
```

