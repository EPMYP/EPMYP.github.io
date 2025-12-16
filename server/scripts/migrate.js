/**
 * 数据库迁移脚本
 * 创建所有必要的数据库表
 */
import { query, execute } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * 创建数据库表
 */
async function createTables() {
  console.log('📦 开始创建数据库表...');

  // 1. 用户表
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      email_verified BOOLEAN DEFAULT FALSE,
      avatar VARCHAR(500) NULL,
      failed_login_attempts INT DEFAULT 0,
      locked_until DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_username (username),
      INDEX idx_locked (locked_until)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 用户表创建完成');

  // 2. 邮箱验证码表
  await execute(`
    CREATE TABLE IF NOT EXISTS email_verification_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_code (email, code),
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 邮箱验证码表创建完成');

  // 3. SMTP配置表
  await execute(`
    CREATE TABLE IF NOT EXISTS smtp_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      smtp_host VARCHAR(255) NOT NULL,
      smtp_port INT NOT NULL,
      smtp_secure VARCHAR(10) NOT NULL DEFAULT 'TLS',
      smtp_user VARCHAR(255) NOT NULL,
      smtp_password VARCHAR(500) NOT NULL,
      smtp_from VARCHAR(255) NOT NULL,
      email_template TEXT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ SMTP配置表创建完成');

  // 4. 文章表（如果不存在）
  await execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(500) NOT NULL,
      slug VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      content_type ENUM('markdown', 'html') DEFAULT 'markdown',
      excerpt TEXT NULL,
      encrypted BOOLEAN DEFAULT FALSE,
      encryption_method VARCHAR(50) NULL,
      tags JSON NULL,
      cover_image VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id),
      INDEX idx_slug (slug),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 文章表创建完成');

  // 5. 支付配置表（如果不存在）
  await execute(`
    CREATE TABLE IF NOT EXISTS payment_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      payment_type VARCHAR(50) NOT NULL,
      qr_code_url VARCHAR(500) NULL,
      address VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      INDEX idx_article (article_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 支付配置表创建完成');

  console.log('✅ 所有数据库表创建完成');
}

/**
 * 创建默认管理员账户
 */
async function createDefaultAdmin() {
  console.log('👤 检查默认管理员账户...');

  // 检查是否已存在管理员（不区分大小写）
  const existingAdmin = await query(
    'SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR role = ?',
    ['Admin', 'admin']
  );

  if (existingAdmin.length > 0) {
    console.log('ℹ️  管理员账户已存在，跳过创建');
    return;
  }

  // 创建默认管理员
  const adminPassword = '4ztvavncDY#ZDKbP.)0FukJ&D4W)myFO*RzHloV7WpmMuP$4FD;LOhTVOU={D[h(';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await execute(
    `INSERT INTO users (username, email, password_hash, role, email_verified) 
     VALUES (?, ?, ?, ?, ?)`,
    ['Admin', 'Admin@center.com', passwordHash, 'admin', true]
  );

  console.log('✅ 默认管理员账户已创建');
  console.log('   用户名: Admin');
  console.log('   密码: 4ztvavncDY#ZDKbP.)0FukJ&D4W)myFO*RzHloV7WpmMuP$4FD;LOhTVOU={D[h(');
  console.log('   ⚠️  请登录后立即修改密码！');
}

/**
 * 主函数
 */
async function main() {
  try {
    await createTables();
    await createDefaultAdmin();
    console.log('✅ 数据库迁移完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createTables, createDefaultAdmin };

