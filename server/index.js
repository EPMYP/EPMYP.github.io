// 导入Express框架，用于创建HTTP服务器
import express from 'express';
// 导入CORS中间件，允许跨域请求
import cors from 'cors';
// 导入dotenv，用于加载环境变量
import dotenv from 'dotenv';
// 导入Node.js URL和路径模块，用于处理文件路径
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// 导入各个路由模块
import articleRoutes from './routes/articles.js'; // 文章路由（CRUD操作）
import paymentRoutes from './routes/payments.js';  // 支付路由（赞赏功能）
import uploadRoutes from './routes/upload.js';     // 文件上传路由
// 导入存储初始化函数（JSON文件存储 - 用于兼容）
import { initStorage } from './config/storage.js';

// 加载.env文件中的环境变量
dotenv.config();

// 获取当前文件的绝对路径（ES模块中需要使用这种方式）
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);

// 创建Express应用实例
const app = express();
// 从环境变量获取端口号，如果未设置则使用3000
const PORT = process.env.PORT || 3000;

// ========== 中间件配置 ==========
// 启用CORS，允许所有来源的跨域请求
app.use(cors());
// 解析JSON格式的请求体
app.use(express.json());
// 解析URL编码的请求体（表单数据）
app.use(express.urlencoded({ extended: true }));

// ========== 静态文件服务 ==========
// 将uploads目录作为静态资源目录，可通过/uploads路径访问上传的文件
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// ========== 路由配置 ==========
// 文章相关路由：/api/articles/*
app.use('/api/articles', articleRoutes);
// 支付相关路由：/api/payments/*
app.use('/api/payments', paymentRoutes);
// 文件上传路由：/api/upload/*
app.use('/api/upload', uploadRoutes);

// ========== 健康检查接口 ==========
// 用于检查服务器是否正常运行
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// ========== 错误处理中间件 ==========
// 捕获所有未处理的错误
app.use((err, req, res, next) => {
  // 输出错误堆栈到控制台
  console.error(err.stack);
  // 返回错误响应
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    // 仅在开发环境下返回错误堆栈信息
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== 初始化数据库并启动服务器 ==========
// 初始化数据库（MySQL）和JSON文件存储（兼容）
async function initializeServer() {
  try {
    // 使用JSON文件存储
    console.log('📦 使用JSON文件存储...');
    await initStorage();
    
    // 设置路由
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Data storage: JSON files in ./data directory`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
}

// 启动服务器
initializeServer();

