# 数据库设置指南

本项目支持MySQL 5.7+及其他兼容数据库（如MariaDB、TiDB等）。

## 数据库要求

- MySQL 5.7+ 或 MariaDB 10.2+ 或 TiDB 5.0+
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci

## 快速设置

### 1. 创建数据库

```sql
CREATE DATABASE secure_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置环境变量

在 `server/.env` 文件中配置数据库连接：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=secure_blog
```

### 3. 运行迁移脚本

```bash
cd server
npm run migrate
```

迁移脚本会自动：
- 创建所有必要的数据库表
- 创建默认管理员账户（Admin）

### 4. 默认管理员账户

- **用户名**：Admin
- **密码**：4ztvavncDY#ZDKbP.)0FukJ&D4W)myFO*RzHloV7WpmMuP$4FD;LOhTVOU={D[h(

⚠️ **重要**：登录后请立即修改密码！

## 数据库表结构

### users（用户表）
- id: 主键
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password_hash: 密码哈希
- role: 角色（admin/user）
- email_verified: 邮箱是否已验证
- failed_login_attempts: 登录失败次数
- locked_until: 账号锁定到期时间
- created_at, updated_at: 时间戳

### email_verification_codes（邮箱验证码表）
- id: 主键
- email: 邮箱地址
- code: 验证码（6位数字）
- expires_at: 过期时间（300秒）
- used: 是否已使用
- created_at: 创建时间

### smtp_configs（SMTP配置表）
- id: 主键
- smtp_host: SMTP服务器地址
- smtp_port: SMTP端口
- smtp_secure: 加密方式（SSL/TLS/NONE）
- smtp_user: SMTP账号
- smtp_password: SMTP密码（加密存储）
- smtp_from: 发件地址
- email_template: 邮件模板（HTML）
- enabled: 是否启用
- created_at, updated_at: 时间戳

### articles（文章表）
- id: 主键
- user_id: 用户ID（外键）
- title: 文章标题
- slug: URL友好标识
- content: 文章内容
- content_type: 内容类型（markdown/html）
- excerpt: 摘要
- encrypted: 是否加密
- encryption_method: 加密方式
- tags: 标签（JSON）
- cover_image: 封面图片
- created_at, updated_at: 时间戳

### payment_configs（支付配置表）
- id: 主键
- article_id: 文章ID（外键）
- payment_type: 支付类型
- qr_code_url: 二维码URL
- address: 支付地址
- created_at, updated_at: 时间戳

## 功能说明

### 邮箱白名单验证

注册时仅允许以下邮箱域名：
- gmail.com
- qq.com
- 163.com
- yahoo.com
- sina.com
- 126.com
- outlook.com
- yeah.net
- foxmail.com

### 验证码功能

- 验证码为6位数字
- 有效期：300秒（5分钟）
- 每个邮箱同时只能有一个有效验证码
- 验证后自动标记为已使用

### 账号锁定功能

- 登录失败10次后锁定账号
- 锁定时长：24小时
- 锁定期间无法登录
- 锁定到期后自动解除

### SMTP配置

管理员可以在后台管理界面配置SMTP设置：
- SMTP服务器地址
- SMTP端口
- 加密方式（SSL/TLS）
- SMTP账号和密码
- 发件地址
- 自定义邮件模板

## 不使用MySQL（兼容模式）

如果不配置MySQL，系统会自动使用JSON文件存储（兼容模式）：
- 数据存储在 `server/data` 目录
- 功能受限（不支持邮箱验证、账号锁定等高级功能）
- 适合开发测试环境

## 数据库备份

```bash
# 备份数据库
mysqldump -u root -p secure_blog > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p secure_blog < backup_20240101.sql
```

## 常见问题

### 1. 连接失败

检查：
- 数据库服务是否启动
- 数据库用户权限
- 防火墙设置
- 环境变量配置

### 2. 字符编码问题

确保数据库和表都使用 `utf8mb4` 字符集。

### 3. 迁移脚本失败

检查：
- 数据库用户是否有CREATE TABLE权限
- 数据库是否已存在同名表
- 查看错误日志

