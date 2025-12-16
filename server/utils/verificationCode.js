/**
 * 验证码管理工具
 * 用于存储、验证和管理邮箱验证码
 */
import { query, execute } from '../config/database.js';
import { generateVerificationCode, getCodeExpiryTime, isCodeExpired } from './emailValidator.js';

/**
 * 创建验证码记录
 * @param {string} email - 邮箱地址
 * @returns {Promise<{code: string, expiresAt: Date}>} 验证码和过期时间
 */
export async function createVerificationCode(email) {
  // 生成验证码
  const code = generateVerificationCode();
  const expiresAt = getCodeExpiryTime();

  // 将之前的验证码标记为已使用
  await execute(
    'UPDATE email_verification_codes SET used = TRUE WHERE email = ? AND used = FALSE',
    [email]
  );

  // 插入新的验证码
  await execute(
    `INSERT INTO email_verification_codes (email, code, expires_at) 
     VALUES (?, ?, ?)`,
    [email, code, expiresAt]
  );

  return { code, expiresAt };
}

/**
 * 验证验证码
 * @param {string} email - 邮箱地址
 * @param {string} code - 验证码
 * @returns {Promise<{valid: boolean, message?: string}>} 验证结果
 */
export async function verifyCode(email, code) {
  // 查找最新的未使用验证码
  const codes = await query(
    `SELECT * FROM email_verification_codes 
     WHERE email = ? AND code = ? AND used = FALSE 
     ORDER BY created_at DESC LIMIT 1`,
    [email, code]
  );

  if (codes.length === 0) {
    return { valid: false, message: '验证码不存在或已使用' };
  }

  const codeRecord = codes[0];

  // 检查是否过期
  if (isCodeExpired(codeRecord.expires_at)) {
    // 标记为已使用
    await execute(
      'UPDATE email_verification_codes SET used = TRUE WHERE id = ?',
      [codeRecord.id]
    );
    return { valid: false, message: '验证码已过期' };
  }

  // 标记为已使用
  await execute(
    'UPDATE email_verification_codes SET used = TRUE WHERE id = ?',
    [codeRecord.id]
  );

  return { valid: true };
}

/**
 * 清理过期的验证码
 */
export async function cleanupExpiredCodes() {
  await execute(
    'DELETE FROM email_verification_codes WHERE expires_at < NOW() OR used = TRUE'
  );
}

export default {
  createVerificationCode,
  verifyCode,
  cleanupExpiredCodes
};

