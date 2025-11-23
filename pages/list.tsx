import Image from 'next/legacy/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { getBlockTitle, formatDate } from 'notion-utils'

import { Footer } from '@/components/Footer'
import { rootNotionPageId } from '@/lib/config'
import { getPageHeader, getPosts } from '@/lib/get-page-data'
import { getPage } from '@/lib/notion'
import type { PageProps } from '@/lib/types'

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
  uniqueTags: string[]
}

export const getStaticProps = async () => {
  const pageId = rootNotionPageId
  const recordMap = await getPage(pageId)

  const keys = Object.keys(recordMap.block)
  const rootPageKey = keys[0]
  let pageTitle = 'Blog Posts'
  let pageHeader: string[] = []

  if (rootPageKey) {
    pageHeader = getPageHeader(recordMap, rootPageKey)
    const rootPageBlock = recordMap.block[rootPageKey]?.value

    if (rootPageBlock) {
      pageTitle = getBlockTitle(rootPageBlock, recordMap)
    }
  }

  const posts: Post[] = getPosts(recordMap, pageId)

  const props = {
    posts,
    pageTitle,
    pageHeader,
    uniqueTags: [] as string[]
  }

  const collection = Object.values(recordMap.collection)[0]?.value
  if (collection) {
    const schema = collection.schema
    const tagsProperty = Object.values(schema).find(
      (p) => p.name === 'Tags' && p.type === 'multi_select'
    )
    if (tagsProperty && tagsProperty.options) {
      props.uniqueTags = ['All', ...tagsProperty.options.map((o) => o.value)]
    }
  }

  return {
    props,
    revalidate: 10
  }
}
// The React component to render the list of posts.
export default function ListPage({
  posts,
  pageTitle,
  pageHeader,
  uniqueTags
}: ListPageProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('All')

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest'))
  }

  const sortedAndFilteredPosts = useMemo(() => {
    let filtered = posts

    if (selectedTag !== 'All') {
      filtered = filtered.filter(
        (post) => post.tags && post.tags.includes(selectedTag)
      )
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerCaseQuery) ||
          post.description?.toLowerCase().includes(lowerCaseQuery) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(lowerCaseQuery))
      )
    }

    const sorted = [...filtered]
    switch (sortOrder) {
      case 'oldest':
        sorted.sort((a, b) => (a.publishedDate || 0) - (b.publishedDate || 0))
        break
      default: // newest
        sorted.sort((a, b) => (b.publishedDate || 0) - (a.publishedDate || 0))
        break
    }
    return sorted
  }, [posts, sortOrder, searchQuery, selectedTag])

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
      <div className='controls-wrapper'>
        <select
          className='tag-filter-select'
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <div className='search-input-wrapper relative sm:block'>
          <FaSearch className='search-icon absolute left-2.5 top-[13px] h-4 w-4 text-slate-400' />
          <input
            type='text'
            placeholder='Search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='search-input h-9 w-[200px] pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20'
          />
        </div>
        <button className='sort-button' onClick={toggleSortOrder}>
          <span className='sort-button-text'>{'최신순'}</span>
          <span style={{ marginLeft: '0.5em' }}>
            {sortOrder === 'newest' ? '↓' : '↑'}
          </span>
        </button>
      </div>
      <hr className='divider' />
      <main>
        {sortedAndFilteredPosts?.length > 0 ? (
          <ul className='posts-list'>
            {sortedAndFilteredPosts.map((post) => (
              <li key={post.id} className='post-item'>
                <Link href={`/${post.id}`} legacyBehavior>
                  <a className='post-link'>
                    <div className='post-content'>
                      <h2 className='post-title'>{post.title}</h2>
                      {post.description && (
                        <p className='post-description'>{post.description}</p>
                      )}
                      <div className='post-footer'>
                        {post.tags && (
                          <div className='post-tags'>
                            {post.tags.map((tag) => (
                              <span className='tag' key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.publishedDate && (
                          <div className='post-date'>
                            {formatDate(post.publishedDate, {
                              month: 'long'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {post.coverImage && (
                      <div className='cover-image-wrapper'>
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          layout='fill'
                          objectFit='cover'
                          sizes='(max-width: 640px) 100vw, 252px'
                        />
                      </div>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className='no-posts'>No posts found.</p>
        )}
      </main>

      <Footer />

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

        .controls-wrapper {
          display: flex;
          justify-content: flex-start; /* Changed from space-between */
          align-items: center;
          margin-top: 0.43rem;
          margin-bottom: 0;
          gap: 0.5rem; /* Changed from 1rem */
          flex-wrap: wrap; /* Allow wrapping on smaller screens */
        }

        .search-input-wrapper {
          position: relative;
          /* hidden sm:block will be handled by utility classes directly on the div */
        }

        .search-icon {
          color: var(
            --fg-color-2
          ); /* Using existing fg-color-2 for icon color */
          height: 1rem; /* h-4 */
          width: 1rem; /* w-4 */
          line-height: 1; /* top-2.5 approximately centers it */
        }

        .search-input {
          height: 42px; /* Set explicit height to match other controls */
          width: 300px; /* w-[200px] */
          padding: 0.5rem 1rem 0.5rem 2.5rem; /* Adjust padding to center text and make space for icon */
          background-color: var(
            --search-bg-color
          ); /* Maintain custom background */
          border: 1px solid var(--border-color); /* border-slate-200, use existing border-color */
          border-radius: 4px; /* default roundedness */
          color: var(--fg-color);
          /* focus-visible:ring-blue-500/20 will be handled by global styles or a custom class if needed */
        }
        .search-input::placeholder {
          color: var(--fg-color-3);
        }

        .search-input::placeholder {
          color: var(--fg-color-3);
        }

        .sort-button {
          padding: 0.5rem 1rem;
          background-color: transparent;
          border: 1px solid var(--border-color-2);
          color: var(--fg-color-2);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-button:hover {
          background-color: var(--bg-color-1);
          border-color: var(--fg-color-link-hover);
          color: var(--fg-color-link-hover);
        }

        .tag-filter-select {
          width: 150px;
          appearance: none;
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          background-image: var(--dropdown-arrow);
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          background-color: transparent;
          border: 1px solid var(--border-color-2);
          color: var(--fg-color-2);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tag-filter-select:hover {
          background-color: var(--bg-color-1);
          border-color: var(--fg-color-link-hover);
          color: var(--fg-color-link-hover);
        }

        .divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 0.5rem 0 1rem 0;
        }

        .posts-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .post-item {
          padding: 0.75rem 0;
          transition: background-color 0.15s ease;
        }

        .post-item:hover {
          background-color: var(--bg-color-1);
        }

        .post-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: stretch; /* Changed from center to stretch */
          justify-content: space-between;
          min-height: 150px;
        }

        .cover-image-wrapper {
          position: relative;
          width: 252px; /* Reduced to 70% of 360px */
          height: 151px; /* Reduced to 70% of 216px */
          margin-left: 2rem;
          overflow: hidden !important;
          border: 1px solid var(--border-color);
          background-color: var(--bg-color-1);
          border-radius: 8px;
          flex-shrink: 0; /* Prevent from shrinking */
        }

        .post-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-left: 0.75rem;
        }
        .post-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .post-title {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: normal;
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
          letter-spacing: normal;
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
          background: transparent;
          border: none;
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

          .post-link {
            flex-direction: column; /* Stack image and text vertically */
            min-height: auto; /* Remove min-height for stacked layout */
          }

          .post-content {
            order: 1; /* Place content after image */
            padding-left: 0; /* Remove specific padding for mobile if desired for full width */
          }

          .cover-image-wrapper {
            order: 0; /* Place image before content */
            width: 100%; /* Image takes full width */
            height: 0;
            padding-bottom: 60%; /* Maintain aspect ratio */
            margin: 0 auto 1rem auto; /* Center image and add bottom margin */
          }
          .controls-wrapper {
            justify-content: flex-start; /* Left align */
            gap: 0.5rem;
          }
          .sort-button {
            /* width: 44px; / Make it a small square */
            padding: 0.5rem; /* Adjust padding for square button */
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sort-button-text {
            display: none; /* Hide text */
          }
          .sort-button span[style] {
            margin-left: 0 !important;
          }
          .tag-filter-select {
            width: 100px; /* Reduce width further */
            padding: 0.5rem 1rem; /* Adjust padding for smaller width */
          }
          .search-input-wrapper {
            flex-grow: 1;
          }
          .search-input {
            width: 100%;
          }
          /* .search-input and .search-icon revert to desktop styles */
        }
      `}</style>
    </div>
  )
}
