/**
 * AI摘要生成工具
 * 支持多种AI服务：OpenAI、Claude等
 */

export async function generateSummary(content, title) {
  try {
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    
    if (aiProvider === 'openai' && process.env.AI_API_KEY) {
      return await generateOpenAISummary(content, title);
    }
    
    // 如果没有配置AI服务，使用简单的文本摘要
    return generateSimpleSummary(content, title);
  } catch (error) {
    console.error('AI摘要生成失败:', error);
    return generateSimpleSummary(content, title);
  }
}

async function generateOpenAISummary(content, title) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的文章摘要生成助手。请为文章生成简洁、准确的摘要，突出文章的核心内容和重点。'
        },
        {
          role: 'user',
          content: `文章标题：${title}\n\n文章内容：\n${content.substring(0, 4000)}\n\n请生成一段150-200字的摘要。`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || generateSimpleSummary(content, title);
}

function generateSimpleSummary(content, title) {
  // 简单的文本摘要：提取前200个字符
  const text = content.replace(/[#*`\[\]()]/g, '').replace(/\n+/g, ' ').trim();
  const summary = text.substring(0, 200);
  
  if (text.length > 200) {
    return summary + '...';
  }
  return summary;
}

export async function extractHighlights(content) {
  try {
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    
    if (aiProvider === 'openai' && process.env.AI_API_KEY) {
      return await extractOpenAIHighlights(content);
    }
    
    // 简单的高亮提取：提取标题和列表项
    return extractSimpleHighlights(content);
  } catch (error) {
    console.error('高亮提取失败:', error);
    return extractSimpleHighlights(content);
  }
}

async function extractOpenAIHighlights(content) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个内容分析助手。请从文章中提取3-5个关键要点，以简洁的列表形式返回。'
        },
        {
          role: 'user',
          content: `请从以下文章中提取关键要点：\n\n${content.substring(0, 4000)}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API错误: ${response.status}`);
  }

  const data = await response.json();
  const highlights = data.choices[0]?.message?.content?.trim();
  
  if (highlights) {
    return highlights.split('\n').filter(line => line.trim()).slice(0, 5);
  }
  
  return extractSimpleHighlights(content);
}

function extractSimpleHighlights(content) {
  // 提取Markdown标题和列表项
  const lines = content.split('\n');
  const highlights = [];
  
  for (const line of lines) {
    if (line.startsWith('##') || line.startsWith('###')) {
      const text = line.replace(/^#+\s*/, '').trim();
      if (text) highlights.push(text);
    } else if (line.startsWith('-') || line.startsWith('*')) {
      const text = line.replace(/^[-*]\s*/, '').trim();
      if (text) highlights.push(text);
    }
    
    if (highlights.length >= 5) break;
  }
  
  return highlights.slice(0, 5);
}

