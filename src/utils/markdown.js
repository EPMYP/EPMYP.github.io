import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true, // 支持 HTML
  linkify: true, // 自动链接
  typographer: true // 排版优化
});

// 解析 Markdown 为 HTML
export const parseMarkdown = (content) => {
  if (!content) return '';
  return md.render(content);
};