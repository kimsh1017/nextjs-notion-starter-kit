import Image from 'next/legacy/image'
import Link from 'next/link'
import {
  formatDate,
  getBlockTitle,
  getPageProperty,
  getTextContent
} from 'notion-utils'

import type { PageProps } from '@/lib/types'
import { rootNotionPageId } from '@/lib/config'
import { mapImageUrl } from '@/lib/map-image-url'
import { getPage } from '@/lib/notion'

// This is the shape of the data we'll be fetching for our list.
interface Post {
  id: string
  title: string
  publishedDate?: number
  description?: string
  tags?: string[]
  coverImage?: string | null
}

// Extend PageProps to include our new `posts` prop.
interface ListPageProps extends PageProps {
  posts: Post[]
  pageTitle: string
  pageHeader?: string[]
}

export const getStaticProps = async () => {
  const pageId = rootNotionPageId
  const recordMap = await getPage(pageId)

  const keys = Object.keys(recordMap.block)
  const rootPageKey = keys[0]
  let pageTitle = 'Blog Posts'
  const pageHeader: string[] = []

  if (rootPageKey) {
    const rootPageBlock = recordMap.block[rootPageKey]?.value

    if (rootPageBlock) {
      pageTitle = getBlockTitle(rootPageBlock, recordMap)

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
  }

  const posts: Post[] = []
  for (const id in recordMap.block) {
    const block = recordMap.block[id]?.value
    // Check if the block is a page, belongs to a collection, and is not the root page itself.
    if (
      block &&
      block.type === 'page' &&
      block.parent_table === 'collection' &&
      block.id !== pageId
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

  // Sort posts by date
  posts.sort((a, b) => (b.publishedDate || 0) - (a.publishedDate || 0))

  const props = { posts, pageTitle, pageHeader }
  return {
    props,
    revalidate: 10
  }
}
// The React component to render the list of posts.
export default function ListPage({
  posts,
  pageTitle,
  pageHeader
}: ListPageProps) {
  return (
    <div className='blog-container'>
      <header className='blog-header'>
        <h1>{pageTitle}</h1>
        {pageHeader &&
          pageHeader.map((header, index) => (
            <p className='page-header' key={index}>
              {header}
            </p>
          ))}
      </header>
      <main>
        {posts?.length > 0 ? (
          <ul className='posts-list'>
            {posts.map((post) => (
              <li key={post.id} className='post-item'>
                <Link href={`/${post.id}`} legacyBehavior>
                  <a className='post-link'>
                    {post.coverImage && (
                      <div className='cover-image-wrapper'>
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          layout='fill'
                          objectFit='cover'
                        />
                      </div>
                    )}
                    <div className='post-content'>
                      <h2 className='post-title'>{post.title}</h2>
                      {post.publishedDate && (
                        <div className='post-date'>
                          Published on{' '}
                          {formatDate(post.publishedDate, { month: 'long' })}
                        </div>
                      )}
                      {post.description && (
                        <p className='post-description'>
                          {post.description}
                        </p>
                      )}
                      {post.tags && (
                        <div className='post-tags'>
                          {post.tags.map((tag) => (
                            <span className='tag' key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className='no-posts'>No posts found.</p>
        )}
      </main>

      <style jsx>{`
        .blog-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 2rem;
          background-color: var(--bg-color);
          color: var(--fg-color);
          min-height: 100vh;
        }

        .blog-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .blog-header h1 {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          color: var(--fg-color);
          line-height: 1.2;
        }

        .page-header {
          margin: 0.5rem 0 0;
          font-size: 1rem;
          color: var(--fg-color-3);
          line-height: 1.6;
          letter-spacing: -0.01em;
          font-weight: 400;
        }

        .posts-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .post-item {
          padding: 2rem 0;
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.15s ease;
        }

        .post-item:hover {
          background-color: var(--bg-color-1);
        }

        .post-item:first-child {
          padding-top: 0;
        }

        .post-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .cover-image-wrapper {
          position: relative;
          width: 100%;
          height: 240px;
          margin-bottom: 1.25rem;
          overflow: hidden !important; /* Added !important */
          border: 1px solid var(--border-color);
          background-color: var(--bg-color-1);
          border-radius: 8px;
        }

        .post-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .post-title {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--fg-color);
          transition: color 0.15s ease;
          line-height: 1.3;
          margin: 0;
        }

        .post-link:hover .post-title {
          color: var(--fg-color-link-hover);
        }

        .post-date {
          font-size: 0.813rem;
          color: var(--fg-color-3);
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .post-description {
          color: var(--fg-color-2);
          line-height: 1.6;
          letter-spacing: -0.01em;
          font-size: 0.938rem;
        }

        .post-tags {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }

        .tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: transparent;
          border: 1px solid var(--border-color-2);
          font-size: 0.75rem;
          color: var(--fg-color-2);
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.15s ease;
        }

        .tag:hover {
          border-color: var(--fg-color-link-hover);
          color: var(--fg-color-link-hover);
        }

        .no-posts {
          padding: 4rem 0;
          text-align: center;
          color: var(--fg-color-3);
          font-size: 1rem;
        }

        @media (max-width: 640px) {
          .blog-container {
            padding: 1.5rem;
          }

          .blog-header h1 {
            font-size: 1.75rem;
          }

          .page-header {
            font-size: 0.938rem;
          }

          .post-title {
            font-size: 1.25rem;
          }

          .cover-image-wrapper {
            height: 180px;
          }
        }
      `}</style>
    </div>
  )
}