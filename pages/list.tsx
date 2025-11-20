
import Link from 'next/link'
import { getBlockTitle } from 'notion-utils'

import type { PageProps } from '@/lib/types'
import { rootNotionPageId } from '@/lib/config'
import { getPage } from '@/lib/notion'


// This is the shape of the data we'll be fetching for our list.
interface Post {
  id: string
  title: string
}

// Extend PageProps to include our new `posts` prop.
interface ListPageProps extends PageProps {
  posts: Post[]
}

export const getStaticProps = async () => {
  const pageId = rootNotionPageId
  const recordMap = await getPage(pageId)

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
        posts.push({ id, title })
      }
    }
  }

  const props = { posts }
  return {
    props,
    revalidate: 10
  }
}

// The React component to render the list of posts.
export default function ListPage({ posts }: ListPageProps) {
  return (
    // We can reuse the NotionPage component for a consistent layout,
    // or create a completely new one. For simplicity, we'll add to it.
    // A proper implementation might involve a new root component.
    <div>
      <header>
        <h1>Blog Posts</h1>
      </header>
      <main>
        {posts?.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/${post.id}`}>
                  {post.title}
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
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        li a {
          text-decoration: none;
          color: #333;
          font-size: 1.2rem;
        }
        li a:hover {
          color: #0070f3;
        }
      `}</style>
    </div>
  )
}
