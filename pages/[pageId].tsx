import { type GetStaticProps } from 'next'
import { useEffect, useState } from 'react'

import { NotionPage } from '@/components/NotionPage'
import { domain, isDev } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { type PageProps, type Params } from '@/lib/types'

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params?.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: 60 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMap = await getSiteMap()

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId
      }
    })),
    // paths: [],
    fallback: true
  }

  console.log(staticPaths.paths)
  return staticPaths
}

export default function NotionDomainDynamicPage(props: PageProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    if (props.pageId) {
      const sessionStorageKey = `viewed-${props.pageId}`;
      const hasViewedInSession = sessionStorage.getItem(sessionStorageKey);

      const fetchAndUpdateViews = async (method: 'GET' | 'POST') => {
        try {
          const res = await fetch(`/api/views/${props.pageId}`, { method });
          const data: any = await res.json();
          setViews(data.views);
          if (method === 'POST') {
            sessionStorage.setItem(sessionStorageKey, 'true');
          }
        } catch (err) {
          console.error('Error fetching or updating views:', err);
        }
      };

      if (!hasViewedInSession) {
        // First view in this session, increment and get count
        void fetchAndUpdateViews('POST');
      } else {
        // Already viewed in this session, just get count
        void fetchAndUpdateViews('GET');
      }
    }
  }, [props.pageId]);
  return <NotionPage {...props} views={views} />
}
