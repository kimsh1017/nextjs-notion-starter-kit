import type { NextApiRequest, NextApiResponse } from 'next'
import { redis } from '@/lib/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { pageId } = req.query

  if (!pageId || typeof pageId !== 'string') {
    return res.status(400).json({ error: 'pageId must be a string' })
  }

  try {
    if (req.method === 'POST') {
      const newViews = await redis.incr(`views:${pageId}`)
      return res.status(200).json({ views: newViews })
    } else if (req.method === 'GET') {
      const views = await redis.get(`views:${pageId}`)
      return res.status(200).json({ views: views || 0 })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error })
  }
}
