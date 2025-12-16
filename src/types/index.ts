/**
 * 文章接口定义
 * @description 定义文章的数据结构，包含所有相关字段
 */
export interface Article {
  id: number; // 文章ID（唯一标识）
  title: string; // 文章标题
  content: string; // 文章明文内容（非加密文章用）
  htmlContent?: string; // 转换后的HTML内容（用于渲染）
  excerpt: string; // 文章摘要
  tags: string[]; // 标签数组
  isEncrypted: boolean; // 是否加密标识
  encryptedContent?: string; // 加密后的内容（加密文章用）
  passwordHash?: string; // 密码的SHA256哈希（用于验证密码）
  createdAt: string; // 创建时间（ISO格式）
  updatedAt: string; // 更新时间（ISO格式）
  viewCount?: number; // 阅读量（可选）
}

/**
 * 标签接口定义
 */
export interface Tag {
  id: number; // 标签ID
  name: string; // 标签名称
  count: number; // 关联文章数量
}

/**
 * 文章发布/编辑表单接口
 * @description 定义表单数据结构，用于前后端数据传输
 */
export interface ArticleForm {
  title: string; // 文章标题
  content: string; // 文章内容
  tags: string; // 标签字符串（逗号分隔）
  isEncrypted: boolean; // 是否加密
  password?: string; // 加密密码（可选）
  confirmPassword?: string; // 确认密码（可选）
  editorType: 'markdown' | 'html'; // 编辑器类型（Markdown或HTML）
}