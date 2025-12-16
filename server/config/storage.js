import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../data');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // 目录已存在，忽略错误
  }
}

// 初始化数据目录（延迟执行，避免顶层await问题）
let dataDirInitialized = false;
async function initDataDirIfNeeded() {
  if (!dataDirInitialized) {
    await ensureDataDir();
    dataDirInitialized = true;
  }
}

/**
 * 文件存储工具类
 */
class FileStorage {
  constructor(filename) {
    this.filepath = join(DATA_DIR, `${filename}.json`);
    this.data = null;
  }

  async load() {
    // 确保数据目录已初始化
    await initDataDirIfNeeded();
    
    try {
      const content = await fs.readFile(this.filepath, 'utf8');
      // 处理空文件
      if (!content || content.trim() === '') {
        this.data = [];
        await this.save();
        return this.data;
      }
      this.data = JSON.parse(content);
      // 确保返回的是数组
      if (!Array.isArray(this.data)) {
        console.warn(`⚠️  警告: ${this.filepath} 数据格式不正确，重置为空数组`);
        this.data = [];
        await this.save();
      }
      return this.data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在，创建空数组
        this.data = [];
        await this.save();
        return this.data;
      } else if (error instanceof SyntaxError) {
        // JSON解析错误，重置文件
        console.error(`❌ JSON解析错误: ${this.filepath}`, error.message);
        this.data = [];
        await this.save();
        return this.data;
      }
      throw error;
    }
  }

  async save() {
    // 确保数据目录已初始化
    await initDataDirIfNeeded();
    await fs.writeFile(this.filepath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  async getAll() {
    await this.load();
    return this.data;
  }

  async findById(id) {
    await this.load();
    return this.data.find(item => item.id === id);
  }

  async findOne(query) {
    await this.load();
    return this.data.find(item => {
      return Object.keys(query).every(key => {
        // 邮箱字段不区分大小写匹配
        if (key === 'email' && item[key] && query[key]) {
          return item[key].toLowerCase() === query[key].toLowerCase();
        }
        return item[key] === query[key];
      });
    });
  }

  async find(query = {}) {
    await this.load();
    if (Object.keys(query).length === 0) {
      return this.data;
    }
    return this.data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async create(item) {
    await this.load();
    // 确保ID唯一且为数字
    const maxId = this.data.length > 0 
      ? Math.max(...this.data.map(i => (typeof i.id === 'number' ? i.id : 0))) 
      : 0;
    const newItem = {
      ...item,
      id: item.id || (maxId + 1),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.push(newItem);
    await this.save();
    return newItem;
  }

  async update(id, updates) {
    await this.load();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    this.data[index] = {
      ...this.data[index],
      ...updates,
      id: this.data[index].id, // 保持ID不变
      updated_at: new Date().toISOString()
    };
    await this.save();
    return this.data[index];
  }

  async delete(id) {
    await this.load();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    this.data.splice(index, 1);
    await this.save();
    return true;
  }

  async count(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

// 导出存储实例
export const usersStorage = new FileStorage('users');
export const articlesStorage = new FileStorage('articles');
export const paymentConfigsStorage = new FileStorage('payment_configs');
export const donationsStorage = new FileStorage('donations');
export const oauthProvidersStorage = new FileStorage('oauth_providers');
export const systemConfigsStorage = new FileStorage('system_configs');

// 初始化函数（创建默认管理员账户等）
export async function initStorage() {
  await ensureDataDir();
  
  // 检查是否有用户，如果没有则创建默认管理员
  const users = await usersStorage.getAll();
  if (users.length === 0) {
    const bcrypt = await import('bcryptjs');
    const defaultPassword = process.env.ADMIN_PASSWORD || '4ztvavncDY#ZDKbP.)0FukJ&D4W)myFO*RzHloV7WpmMuP$4FD;LOhTVOU={D[h(';
    const passwordHash = await bcrypt.default.hash(defaultPassword, 10);
    
    await usersStorage.create({
      username: 'Admin',
      email: 'Admin@center.com',
      password_hash: passwordHash,
      role: 'admin',
      email_verified: true
    });
    
    console.log('✅ 默认管理员账户已创建');
    console.log('   用户名: Admin');
    console.log(`   密码: ${defaultPassword}`);
    console.log('   请登录后立即修改密码！');
  }
  
  console.log('✅ 文件存储系统初始化完成');
}

