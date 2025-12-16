import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { query } from '../config/database.js';

dotenv.config();

/**
 * 获取SMTP配置（优先从数据库读取，否则从环境变量读取）
 */
async function getSMTPConfig() {
  try {
    // 尝试从数据库读取SMTP配置
    const configs = await query(
      'SELECT * FROM smtp_configs WHERE enabled = TRUE ORDER BY id DESC LIMIT 1'
    );
    
    if (configs.length > 0) {
      const config = configs[0];
      return {
        host: config.smtp_host,
        port: config.smtp_port,
        secure: config.smtp_secure === 'SSL',
        auth: {
          user: config.smtp_user,
          pass: config.smtp_password
        },
        from: config.smtp_from,
        template: config.email_template
      };
    }
  } catch (error) {
    // 如果数据库未配置或查询失败，使用环境变量
    console.log('使用环境变量SMTP配置');
  }
  
  // 从环境变量读取
  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.SMTP_FROM,
    template: null
  };
}

/**
 * 创建邮件传输器
 */
async function createTransporter() {
  const config = await getSMTPConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });
}

export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify/${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: '邮箱验证 - 新一代个人安全技术博客',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00d4ff;">欢迎注册新一代个人安全技术博客</h2>
        <p>请点击以下链接验证您的邮箱：</p>
        <p><a href="${verificationUrl}" style="background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">验证邮箱</a></p>
        <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px;">此链接24小时内有效</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`验证邮件已发送到: ${email}`);
  } catch (error) {
    console.error('发送验证邮件失败:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: '重置密码 - 新一代个人安全技术博客',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00d4ff;">重置密码</h2>
        <p>您请求重置密码，请点击以下链接：</p>
        <p><a href="${resetUrl}" style="background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">重置密码</a></p>
        <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">此链接1小时内有效，如果您没有请求重置密码，请忽略此邮件。</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`重置密码邮件已发送到: ${email}`);
  } catch (error) {
    console.error('发送重置密码邮件失败:', error);
    throw error;
  }
}

/**
 * 发送验证码邮件
 * @param {string} email - 收件人邮箱
 * @param {string} code - 验证码
 */
export async function sendVerificationCode(email, code) {
  const config = await getSMTPConfig();
  const transporter = await createTransporter();
  
  // 使用自定义模板或默认模板
  let htmlContent = config.template || `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00d4ff;">您的验证码</h2>
      <p>您的验证码是：</p>
      <h1 style="color: #00d4ff; font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p style="color: #999; font-size: 12px;">验证码5分钟内有效，请勿泄露给他人。</p>
    </div>
  `;
  
  // 替换模板中的变量
  htmlContent = htmlContent.replace(/\{\{code\}\}/g, code);
  htmlContent = htmlContent.replace(/\{\{email\}\}/g, email);
  
  const mailOptions = {
    from: config.from || process.env.SMTP_FROM,
    to: email,
    subject: '验证码 - 新一代个人安全技术博客',
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`验证码已发送到: ${email}`);
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw error;
  }
}

/**
 * 发送测试邮件
 * @param {string} email - 收件人邮箱
 */
export async function sendTestEmail(email) {
  const config = await getSMTPConfig();
  const transporter = await createTransporter();
  
  const mailOptions = {
    from: config.from || process.env.SMTP_FROM,
    to: email,
    subject: '测试邮件 - 新一代个人安全技术博客',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00d4ff;">SMTP配置测试</h2>
        <p>这是一封测试邮件，如果您收到此邮件，说明SMTP配置正确。</p>
        <p style="color: #999; font-size: 12px;">发送时间: ${new Date().toLocaleString('zh-CN')}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`测试邮件已发送到: ${email}`);
    return { success: true, message: '测试邮件发送成功' };
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    throw error;
  }
}

