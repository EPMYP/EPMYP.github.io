import express from 'express';
import { body, validationResult } from 'express-validator';
import { paymentConfigsStorage, donationsStorage, articlesStorage } from '../config/storage.js';
// 已移除认证中间件

const router = express.Router();

// 获取文章的支付配置
router.get('/article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    const configs = await paymentConfigsStorage.find({
      article_id: articleId,
      enabled: true
    });

    res.json({ configs });
  } catch (error) {
    console.error('获取支付配置错误:', error);
    res.status(500).json({ error: '获取支付配置失败' });
  }
});

// 设置文章支付配置
router.post('/article/:articleId', [
  body('payment_type').isIn(['wechat', 'alipay', 'usdt_trc20', 'bitcoin', 'ethereum', 'other']).withMessage('无效的支付类型'),
  body('qr_code_url').optional().isURL().withMessage('二维码URL格式无效'),
  body('address').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { articleId } = req.params;
    const { payment_type, qr_code_url, address, enabled = true } = req.body;

    // 检查文章是否存在
    const article = await articlesStorage.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 检查权限
    if (article.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权修改此文章的支付配置' });
    }

    // 检查是否已存在相同类型的配置
    const existing = await paymentConfigsStorage.findOne({
      article_id: articleId,
      payment_type
    });

    if (existing) {
      // 更新现有配置
      await paymentConfigsStorage.update(existing.id, {
        qr_code_url: qr_code_url || null,
        address: address || null,
        enabled
      });
      res.json({ message: '支付配置更新成功', id: existing.id });
    } else {
      // 创建新配置
      const config = await paymentConfigsStorage.create({
        article_id: articleId,
        payment_type,
        qr_code_url: qr_code_url || null,
        address: address || null,
        enabled
      });
      res.status(201).json({ message: '支付配置创建成功', id: config.id });
    }
  } catch (error) {
    console.error('设置支付配置错误:', error);
    res.status(500).json({ error: '设置支付配置失败' });
  }
});

// 删除支付配置
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查配置是否存在
    const config = await paymentConfigsStorage.findById(id);
    if (!config) {
      return res.status(404).json({ error: '支付配置不存在' });
    }

    // 检查文章权限
    const article = await articlesStorage.findById(config.article_id);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    if (article.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此支付配置' });
    }

    await paymentConfigsStorage.delete(id);

    res.json({ message: '支付配置删除成功' });
  } catch (error) {
    console.error('删除支付配置错误:', error);
    res.status(500).json({ error: '删除支付配置失败' });
  }
});

// 记录赞赏
router.post('/donate', [
  body('article_id').notEmpty().withMessage('文章ID不能为空'),
  body('amount').optional().isFloat({ min: 0 }),
  body('payment_type').isString(),
  body('transaction_id').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { article_id, amount, payment_type, transaction_id } = req.body;
    const user_id = req.user?.id || null;

    const donation = await donationsStorage.create({
      article_id,
      user_id,
      amount: amount || null,
      payment_type,
      transaction_id: transaction_id || null,
      status: 'completed'
    });

    res.status(201).json({ message: '赞赏记录成功', id: donation.id });
  } catch (error) {
    console.error('记录赞赏错误:', error);
    res.status(500).json({ error: '记录赞赏失败' });
  }
});

export default router;
