import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// 已移除认证中间件
import sharp from 'sharp';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// 配置multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const type = req.body.type || 'general';
    const dir = path.join(uploadDir, type);
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 上传文件
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const filePath = req.file.path;
    const relativePath = `/uploads/${req.body.type || 'general'}/${req.file.filename}`;

    // 如果是图片，生成缩略图（可选）
    if (req.body.generateThumbnail === 'true') {
      const thumbPath = filePath.replace(path.extname(filePath), '_thumb' + path.extname(filePath));
      await sharp(filePath)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .toFile(thumbPath);
    }

    res.json({
      url: relativePath,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('上传文件错误:', error);
    res.status(500).json({ error: '上传文件失败' });
  }
});

// 删除文件
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.query.type || 'general';
    const filePath = path.join(uploadDir, type, filename);

    try {
      await fs.unlink(filePath);
      // 尝试删除缩略图
      const thumbPath = filePath.replace(path.extname(filePath), '_thumb' + path.extname(filePath));
      await fs.unlink(thumbPath).catch(() => {});
      res.json({ message: '文件删除成功' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: '文件不存在' });
      }
      throw error;
    }
  } catch (error) {
    console.error('删除文件错误:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
});

export default router;

