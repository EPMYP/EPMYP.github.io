/**
 * MySQL数据库配置
 * 支持MySQL 5.7+及其他兼容数据库（如MariaDB、TiDB等）
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'secure_blog',
  charset: 'utf8mb4',
  // 连接池配置
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 支持MySQL 5.7+
  supportBigNumbers: true,
  bigNumberStrings: false,
  dateStrings: false,
  // 时区设置
  timezone: '+00:00'
};

// 创建连接池
let pool = null;

/**
 * 获取数据库连接池
 * @returns {Promise<mysql.Pool>} 数据库连接池
 */
export async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    
    // 测试连接
    try {
      const connection = await pool.getConnection();
      console.log('✅ 数据库连接成功');
      connection.release();
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }
  return pool;
}

/**
 * 执行SQL查询
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
export async function query(sql, params = []) {
  const pool = await getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * 执行SQL更新（INSERT/UPDATE/DELETE）
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Object>} 执行结果
 */
export async function execute(sql, params = []) {
  const pool = await getPool();
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * 开始事务
 * @returns {Promise<mysql.PoolConnection>} 事务连接
 */
export async function beginTransaction() {
  const pool = await getPool();
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * 提交事务
 * @param {mysql.PoolConnection} connection - 事务连接
 */
export async function commit(connection) {
  await connection.commit();
  connection.release();
}

/**
 * 回滚事务
 * @param {mysql.PoolConnection} connection - 事务连接
 */
export async function rollback(connection) {
  await connection.rollback();
  connection.release();
}

/**
 * 关闭数据库连接池
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ 数据库连接池已关闭');
  }
}

export default { getPool, query, execute, beginTransaction, commit, rollback, closePool };

