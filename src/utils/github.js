/**
 * GitHub Issues API 集成
 * 用于文章评论区功能
 */

// GitHub仓库配置（需要在环境变量或配置中设置）
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'your-username/my-secure-blog'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

/**
 * 获取文章的GitHub Issue
 * 通过文章ID查找对应的Issue
 */
export async function getArticleIssue(articleId) {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub Token未配置，无法获取评论')
    return null
  }

  try {
    // 搜索包含文章ID的Issue
    const searchUrl = `https://api.github.com/search/issues?q=repo:${GITHUB_REPO}+label:article-${articleId}+state:open`
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status}`)
    }

    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0]
    }
    return null
  } catch (error) {
    console.error('获取Issue失败:', error)
    return null
  }
}

/**
 * 创建文章的GitHub Issue（用于评论区）
 */
export async function createArticleIssue(articleId, articleTitle) {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub Token未配置，无法创建评论')
    return null
  }

  try {
    const issueUrl = `https://api.github.com/repos/${GITHUB_REPO}/issues`
    const response = await fetch(issueUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `[文章评论] ${articleTitle}`,
        body: `这是文章 "${articleTitle}" 的评论区。\n\n文章ID: ${articleId}\n\n---\n\n请在下方发表您的评论。`,
        labels: [`article-${articleId}`, 'article-comment']
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`创建Issue失败: ${errorData.message || response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('创建Issue失败:', error)
    return null
  }
}

/**
 * 获取Issue的评论
 */
export async function getIssueComments(issueNumber) {
  if (!GITHUB_TOKEN) {
    return []
  }

  try {
    const commentsUrl = `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`
    const response = await fetch(commentsUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`获取评论失败: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('获取评论失败:', error)
    return []
  }
}

/**
 * 获取或创建文章的Issue
 */
export async function getOrCreateArticleIssue(articleId, articleTitle) {
  let issue = await getArticleIssue(articleId)
  
  if (!issue) {
    issue = await createArticleIssue(articleId, articleTitle)
  }
  
  return issue
}

/**
 * 获取Issue的评论数量
 */
export async function getIssueCommentsCount(issueNumber) {
  const comments = await getIssueComments(issueNumber)
  return comments.length
}

