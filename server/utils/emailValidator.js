/**
 * 邮箱验证工具
 * 包括邮箱白名单验证、验证码生成和验证等功能
 */

// 允许的邮箱域名白名单
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'qq.com',
  '163.com',
  'yahoo.com',
  'sina.com',
  '126.com',
  'outlook.com',
  'yeah.net',
  'foxmail.com'
];

/**
 * 验证邮箱是否在白名单中
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否在白名单中
 */
export function isEmailAllowed(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // 提取邮箱域名
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) {
    return false;
  }

  const domain = parts[1];
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

/**
 * 生成6位数字验证码
 * @returns {string} 验证码
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 验证码有效期（300秒 = 5分钟）
 */
export const CODE_EXPIRY_SECONDS = 300;

/**
 * 计算验证码过期时间
 * @returns {Date} 过期时间
 */
export function getCodeExpiryTime() {
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + CODE_EXPIRY_SECONDS);
  return expiryTime;
}

/**
 * 检查验证码是否过期
 * @param {Date|string} expiresAt - 过期时间
 * @returns {boolean} 是否已过期
 */
export function isCodeExpired(expiresAt) {
  const expiryDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return new Date() > expiryDate;
}

/**
 * 获取邮箱域名
 * @param {string} email - 邮箱地址
 * @returns {string|null} 域名
 */
export function getEmailDomain(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  const parts = email.toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : null;
}

export default {
  isEmailAllowed,
  generateVerificationCode,
  CODE_EXPIRY_SECONDS,
  getCodeExpiryTime,
  isCodeExpired,
  getEmailDomain,
  ALLOWED_EMAIL_DOMAINS
};

