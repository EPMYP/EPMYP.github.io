#!/bin/bash

# aaPanel部署脚本
# 用于在aaPanel面板上部署My Secure Blog

echo "🚀 开始部署 My Secure Blog 到 aaPanel..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先在aaPanel中安装Node.js"
    exit 1
fi

# 注意：此项目使用JSON文件存储，无需MySQL

# 创建项目目录
PROJECT_DIR="/www/wwwroot/my-secure-blog"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 克隆或更新代码
if [ -d ".git" ]; then
    echo "📥 更新代码..."
    git pull
else
    echo "📥 请先上传代码到 $PROJECT_DIR"
    exit 1
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd server
npm install --production

# 安装前端依赖
echo "📦 安装前端依赖..."
cd ..
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 创建.env文件（如果不存在）
if [ ! -f "server/.env" ]; then
    echo "📝 创建.env配置文件..."
    cp server/.env.example server/.env
    echo "⚠️  请编辑 server/.env 文件配置数据库和其他设置"
fi

# 创建上传目录
mkdir -p server/uploads/general
mkdir -p server/uploads/covers

# 设置权限
chmod -R 755 server/uploads
chown -R www:www server/uploads

echo "✅ 部署完成！"
echo "📝 下一步："
echo "   1. 编辑 server/.env 配置邮箱和OAuth等"
echo "   2. 在aaPanel中创建Node.js应用，指向 $PROJECT_DIR/server"
echo "   3. 配置Nginx反向代理到后端API"
echo "   4. 数据将自动存储在 server/data 目录中"

