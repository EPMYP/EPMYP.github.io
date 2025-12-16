/**
 * 账号锁定管理工具
 * 实现登录失败锁定功能（10次失败锁定24小时）
 */

import { query, execute } from '../config/database.js';

// 最大失败次数
const MAX_FAILED_ATTEMPTS = 10;
// 锁定时长（24小时，单位：毫秒）
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * 检查账号是否被锁定
 * @param {number} userId - 用户ID
 * @returns {Promise<{locked: boolean, lockedUntil?: Date, message?: string}>} 锁定状态
 */
export async function checkAccountLock(userId) {
  const users = await query(
    'SELECT locked_until, failed_login_attempts FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return { locked: false };
  }

  const user = users[0];

  // 如果没有锁定时间，说明未锁定
  if (!user.locked_until) {
    return { locked: false };
  }

  const lockedUntil = new Date(user.locked_until);
  const now = new Date();

  // 如果锁定时间已过，解除锁定
  if (now > lockedUntil) {
    await execute(
      'UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ?',
      [userId]
    );
    return { locked: false };
  }

  // 账号被锁定
  const remainingMinutes = Math.ceil((lockedUntil - now) / (60 * 1000));
  return {
    locked: true,
    lockedUntil,
    message: `账号已被锁定，请${remainingMinutes}分钟后再试`
  };
}

/**
 * 记录登录失败
 * @param {number} userId - 用户ID
 * @returns {Promise<{locked: boolean, attempts: number}>} 是否已锁定和当前失败次数
 */
export async function recordFailedLogin(userId) {
  // 增加失败次数
  await execute(
    'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
    [userId]
  );

  // 获取当前失败次数
  const users = await query(
    'SELECT failed_login_attempts FROM users WHERE id = ?',
    [userId]
  );

  const failedAttempts = users[0]?.failed_login_attempts || 0;

  // 如果达到最大失败次数，锁定账号
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    await execute(
      'UPDATE users SET locked_until = ? WHERE id = ?',
      [lockedUntil, userId]
    );
    return { locked: true, attempts: failedAttempts };
  }

  return { locked: false, attempts: failedAttempts };
}

/**
 * 清除登录失败记录（登录成功时调用）
 * @param {number} userId - 用户ID
 */
export async function clearFailedLogin(userId) {
  await execute(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
    [userId]
  );
}

export default {
  checkAccountLock,
  recordFailedLogin,
  clearFailedLogin,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MS
};

