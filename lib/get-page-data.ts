import type { ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getPageProperty, getTextContent } from 'notion-utils'

import { mapImageUrl } from './map-image-url'

interface Post {
  id: string
  title: string
  publishedDate?: number
  description?: string
  tags?: string[]
  coverImage?: string | null
}

export function getPageHeader(
  recordMap: ExtendedRecordMap,
  rootPageBlockId: string
) {
  const pageHeader: string[] = []
  const rootPageBlock = recordMap.block[rootPageBlockId]?.value

  if (rootPageBlock) {
    if (rootPageBlock.content) {
      for (const blockId of rootPageBlock.content) {
        const block = recordMap.block[blockId]?.value
        if (block?.type === 'collection_view') {
          break
        }
        if (block && block.type === 'text' && block.properties?.title) {
          pageHeader.push(getTextContent(block.properties.title))
        }
      }
    }
  }

  return pageHeader
}

export function getPosts(
  recordMap: ExtendedRecordMap,
  rootPageId: string
): Post[] {
  const posts: Post[] = []
  for (const id in recordMap.block) {
    const block = recordMap.block[id]?.value
    // Check if the block is a page, belongs to a collection, and is not the root page itself.
    if (
      block &&
      block.type === 'page' &&
      block.parent_table === 'collection' &&
      block.id !== rootPageId
    ) {
      const title = getBlockTitle(block, recordMap)
      if (title) {
        const publishedDate = getPageProperty<number>(
          'Published',
          block,
          recordMap
        )
        const description = getPageProperty<string>(
          'Description',
          block,
          recordMap
        )
        const tags = getPageProperty<string[]>('Tags', block, recordMap)
        const coverImage =
          mapImageUrl((block as any).format?.page_cover, block) || null

        posts.push({ id, title, publishedDate, description, tags, coverImage })
      }
    }
  }
  return posts
}