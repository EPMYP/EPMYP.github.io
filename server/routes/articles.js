import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { articlesStorage, systemConfigsStorage } from '../config/storage.js';
import { generateSummary, extractHighlights } from '../utils/ai.js';
import slugify from '../utils/slugify.js';

const router = express.Router();

// 获取文章列表（支持搜索、分页、筛选）
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('tag').optional().isString(),
  query('status').optional().isIn(['draft', 'published'])
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, tag, status } = req.query;

    let articles = await articlesStorage.getAll();

    // 只显示已发布文章
    articles = articles.filter(a => a.status === 'published');
    
    if (status) {
      articles = articles.filter(a => a.status === status);
    }

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        a.title?.toLowerCase().includes(searchLower) ||
        a.content?.toLowerCase().includes(searchLower) ||
        a.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    // 标签过滤
    if (tag) {
      articles = articles.filter(a => {
        const tags = Array.isArray(a.tags) ? a.tags : JSON.parse(a.tags || '[]');
        return tags.includes(tag);
      });
    }

    // 排序
    articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 分页
    const total = articles.length;
    const offset = (page - 1) * limit;
    const paginatedArticles = articles.slice(offset, offset + limit);

    // 添加作者信息（已移除用户系统）
    const articlesWithUser = paginatedArticles.map((article) => {
      return {
        ...article,
        author: {
          id: null,
          username: 'Admin',
          avatar: null,
        },
        tags: Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || '[]')
      };
    });

    res.json({
      articles: articlesWithUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取文章列表错误:', error);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取单篇文章
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await articlesStorage.findById(id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 只显示已发布文章
    if (article.status !== 'published') {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 增加浏览量
    await articlesStorage.update(id, {
      view_count: (article.view_count || 0) + 1
    });

    res.json({
      ...article,
      author: {
        id: null,
        username: 'Admin',
        avatar: null,
      },
      tags: Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || '[]'),
      view_count: (article.view_count || 0) + 1
    });
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建文章
router.post('/', [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('content').notEmpty().withMessage('内容不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      excerpt,
      cover_image,
      content_type = 'markdown',
      encryption_method,
      tags = [],
      status = 'draft'
    } = req.body;

    // 生成slug
    const slug = slugify(title) + '-' + Date.now();

    // 生成摘要（如果没有提供）
    let finalExcerpt = excerpt;
    if (!finalExcerpt && content) {
      finalExcerpt = await generateSummary(content, title);
    }

    // 提取高亮
    const highlights = await extractHighlights(content);

    const article = await articlesStorage.create({
      user_id: 1, // 默认用户ID
      title,
      slug,
      content,
      excerpt: finalExcerpt,
      cover_image: cover_image || null,
      content_type,
      encryption_method: encryption_method || null,
      encrypted: !!encryption_method,
      tags: Array.isArray(tags) ? tags : [],
      status,
      view_count: 0,
      like_count: 0
    });

    // 保存高亮到系统配置（可选）
    if (highlights.length > 0) {
      await systemConfigsStorage.create({
        config_key: `article_${article.id}_highlights`,
        config_value: JSON.stringify(highlights)
      });
    }

    res.status(201).json({
      id: article.id,
      slug,
      excerpt: finalExcerpt,
      highlights
    });
  } catch (error) {
    console.error('创建文章错误:', error);
    res.status(500).json({ error: '创建文章失败' });
  }
});

// 更新文章
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('标题不能为空'),
  body('content').optional().notEmpty().withMessage('内容不能为空')
], async (req, res) => {
  try {
    const { id } = req.params;

    // 检查文章是否存在
    const article = await articlesStorage.findById(id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 允许修改所有文章（已移除认证）

    const {
      title,
      content,
      excerpt,
      cover_image,
      content_type,
      encryption_method,
      tags,
      status
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (content !== undefined) {
      updates.content = content;
      
      // 如果内容更新，重新生成摘要
      if (!excerpt) {
        updates.excerpt = await generateSummary(content, title || article.title);
      }
    }
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (cover_image !== undefined) updates.cover_image = cover_image;
    if (content_type !== undefined) updates.content_type = content_type;
    if (encryption_method !== undefined) {
      updates.encryption_method = encryption_method;
      updates.encrypted = !!encryption_method;
    }
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) {
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    await articlesStorage.update(id, updates);

    res.json({ message: '文章更新成功' });
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await articlesStorage.findById(id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 允许删除所有文章（已移除认证）

    await articlesStorage.delete(id);

    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({ error: '删除文章失败' });
  }
});

export default router;
