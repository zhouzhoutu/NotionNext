import BLOG from '@/blog.config'
import { cleanCache } from '@/lib/cache/local_file_cache'

/**
 * On-Demand Revalidation API
 *
 * 使用方式：
 *   POST /api/revalidate
 *   Authorization: Bearer <REVALIDATION_TOKEN>
 *   Body: { "path": "/article/my-post" }        - 刷新单个页面
 *   Body: { "paths": ["/", "/article/post-1"] }  - 批量刷新
 *   Body: { "all": true }                        - 全站刷新
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method Not Allowed. Use POST.'
    })
  }

  const token = process.env.REVALIDATION_TOKEN || BLOG.REVALIDATION_TOKEN
  if (!token) {
    return res.status(503).json({
      ok: false,
      message: 'Revalidation is disabled: REVALIDATION_TOKEN not set'
    })
  }

  const authHeader = req.headers.authorization || ''
  const receivedToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.body?.token || ''

  if (receivedToken !== token) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' })
  }

  const { path, paths, all } = req.body || {}

  try {
    if (all) {
      cleanCache()
      const results = []
      try {
        await res.revalidate('/')
        results.push({ path: '/', revalidated: true })
      } catch (error) {
        results.push({ path: '/', revalidated: false, error: error.message })
      }

      return res.status(200).json({
        ok: true,
        message:
          'Full site cache cleared. Homepage revalidated. Other pages will refresh on next visit.',
        results
      })
    }

    const targetPaths = paths || (path ? [path] : ['/'])
    const results = []

    for (const p of targetPaths) {
      const normalizedPath = normalizePath(p)
      try {
        await res.revalidate(normalizedPath)
        results.push({ path: normalizedPath, revalidated: true })
      } catch (error) {
        results.push({
          path: normalizedPath,
          revalidated: false,
          error: error.message
        })
      }
    }

    return res.status(200).json({
      ok: true,
      message: `Revalidated ${results.filter(r => r.revalidated).length}/${results.length} paths`,
      results
    })
  } catch (error) {
    console.error('[revalidate] Error:', error)
    return res.status(500).json({
      ok: false,
      message: 'Revalidation failed',
      error: error.message
    })
  }
}

function normalizePath(p) {
  if (!p || typeof p !== 'string') return '/'
  let normalized = p.trim()
  if (!normalized.startsWith('/')) normalized = '/' + normalized
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}
