/**
 * 将文本转换为URL友好的slug
 */
export default function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // 空格替换为连字符
    .replace(/[^\w\-]+/g, '')       // 移除非单词字符
    .replace(/\-\-+/g, '-')        // 多个连字符替换为单个
    .replace(/^-+/, '')            // 移除开头的连字符
    .replace(/-+$/, '');           // 移除结尾的连字符
}

