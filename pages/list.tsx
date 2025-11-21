
import type { PageBlock } from 'notion-types'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { formatDate, getBlockTitle, getPageProperty } from 'notion-utils'

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
}

export const getStaticProps = async () => {
  const pageId = rootNotionPageId
  const recordMap = await getPage(pageId)

  const keys = Object.keys(recordMap.block)
  const rootPageKey = keys[0]
  let pageTitle = 'Blog Posts'
  if (rootPageKey) {
    const rootPageBlock = recordMap.block[rootPageKey]?.value
    pageTitle = rootPageBlock ? getBlockTitle(rootPageBlock, recordMap) : 'Blog Posts'
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
        const publishedDate = getPageProperty<number>('Published', block, recordMap)
        const description = getPageProperty<string>('Description', block, recordMap)
        const tags = getPageProperty<string[]>('Tags', block, recordMap)
        const coverImage = mapImageUrl((block as PageBlock).format?.page_cover, block) || null

        posts.push({ id, title, publishedDate, description, tags, coverImage })
      }
    }
  }

  // Sort posts by date
  posts.sort((a, b) => (b.publishedDate || 0) - (a.publishedDate || 0))

  const props = { posts, pageTitle }
  return {
    props,
    revalidate: 10
  }
}
// The React component to render the list of posts.
export default function ListPage({ posts, pageTitle }: ListPageProps) {
  return (
    // We can reuse the NotionPage component for a consistent layout,
    // or create a completely new one. For simplicity, we'll add to it.
    // A proper implementation might involve a new root component.
    <div>
      <header>
        <h1>{pageTitle}</h1>
      </header>
      <main>
        {posts?.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/${post.id}`} legacyBehavior>
                  <a>
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
                    <div className='title'>{post.title}</div>
                    {post.publishedDate && (
                      <div className='date'>
                        Published on{' '}
                        {formatDate(post.publishedDate, { month: 'long' })}
                      </div>
                    )}
                    {post.description && (
                      <div className='description'>{post.description}</div>
                    )}
                    {post.tags && (
                      <div className='tags'>
                        {post.tags.map((tag) => (
                          <span className='tag' key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts found.</p>
        )}
      </main>
      <style jsx>{`
        div {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
          font-family: sans-serif;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 1.5rem 0;
          border-bottom: 1px solid #eee;
        }
        li a {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        li a:hover .title {
          color: #0070f3;
        }
        .cover-image-wrapper {
          position: relative;
          width: 100%;
          height: 200px; /* Adjust height as needed */
          margin-bottom: 1rem;
          border-radius: 8px;
          overflow: hidden;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .date {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .description {
          margin-bottom: 1rem;
          color: #444;
        }
        .tags {
          display: flex;
          gap: 0.5rem;
        }
        .tag {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #eee;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  )
}
