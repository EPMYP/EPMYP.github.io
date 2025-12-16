// 导入marked库（Markdown转HTML）和highlight.js（代码高亮）
import marked from 'marked';
import hljs from 'highlight.js';
// 导入代码高亮样式
import 'highlight.js/styles/github-dark.css';

// 配置marked解析器选项
marked.setOptions({
  renderer: new marked.Renderer(), // 使用默认渲染器
  // 代码高亮处理函数
  highlight: (code, lang) => {
    // 如果指定了语言且highlight.js支持该语言，则使用指定语言高亮
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    // 否则自动检测语言
    return hljs.highlightAuto(code).value;
  },
  breaks: true, // 支持换行符转换为<br>
  gfm: true, // 支持GitHub Flavored Markdown
  tables: true, // 支持表格
  smartLists: true, // 优化列表渲染
  smartypants: true // 优化标点符号（如引号、破折号）
});

/**
 * Markdown转HTML函数
 * @param content Markdown格式的字符串
 * @returns 转换后的HTML字符串
 * @description 将用户输入的Markdown内容转换为可直接渲染的HTML
 */
export const markdownToHtml = (content: string): string => {
  return marked.parse(content);
};

/**
 * 提取文章摘要函数
 * @param content 文章内容（Markdown或HTML）
 * @param length 摘要长度（默认150字）
 * @returns 提取后的文章摘要
 * @description 自动移除HTML和Markdown标签，提取纯文本作为摘要
 */
export const extractExcerpt = (content: string, length: number = 150): string => {
  // 第一步：移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  // 第二步：移除Markdown特殊标签（# * ` [] () {} <> ! 等）
  const cleanText = plainText
    .replace(/[#*`[\](){}<>!]/g, '')
    .replace(/\s+/g, ' '); // 多个空格替换为单个空格
  
  // 第三步：截取指定长度，超出部分加省略号
  return cleanText.length > length 
    ? cleanText.substring(0, length) + '...' 
    : cleanText;
};

/**
 * 解析标签字符串函数
 * @param tags 逗号分隔的标签字符串（如："Vue,前端,JavaScript"）
 * @returns 标签数组（去重、去空）
 * @description 将用户输入的标签字符串转换为规范的标签数组
 */
export const parseTags = (tags: string): string[] => {
  return tags.split(',') // 按逗号分割
    .map(tag => tag.trim()) // 去除每个标签的前后空格
    .filter(tag => tag) // 过滤空标签
    .filter((tag, index, self) => self.indexOf(tag) === index); // 去重
};