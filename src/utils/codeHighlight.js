import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

/**
 * 配置代码高亮
 */
export function initCodeHighlight() {
  // 注册常用语言
  hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
  hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript'));
  hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
  hljs.registerLanguage('java', require('highlight.js/lib/languages/java'));
  hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'));
  hljs.registerLanguage('c', require('highlight.js/lib/languages/c'));
  hljs.registerLanguage('go', require('highlight.js/lib/languages/go'));
  hljs.registerLanguage('rust', require('highlight.js/lib/languages/rust'));
  hljs.registerLanguage('php', require('highlight.js/lib/languages/php'));
  hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
  hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'));
  hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
  hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'));
  hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
  hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
  hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'));
  hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
  hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'));
  hljs.registerLanguage('vue', require('highlight.js/lib/languages/xml'));
  hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'));
}

/**
 * 高亮代码块
 */
export function highlightCode(element) {
  if (!element) return;
  
  const codeBlocks = element.querySelectorAll('pre code');
  codeBlocks.forEach((block) => {
    hljs.highlightElement(block);
  });
}

/**
 * 为marked添加代码高亮支持
 */
export function markedHighlight(code, lang) {
  if (!lang) {
    return `<pre><code>${code}</code></pre>`;
  }
  
  try {
    const highlighted = hljs.highlight(code, { language: lang }).value;
    return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
  } catch (err) {
    return `<pre><code>${code}</code></pre>`;
  }
}

