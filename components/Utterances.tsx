import * as React from 'react'

import { useDarkMode } from '@/lib/use-dark-mode'

export function Utterances({ repo }: { repo: string }) {
  const { isDarkMode } = useDarkMode()
  const theme = isDarkMode ? 'github-dark' : 'github-light'
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'

    script.setAttribute('repo', repo)
    script.setAttribute('issue-term', 'url')
    script.setAttribute('theme', theme)

    ref.current.append(script)
  }, [repo, theme])

  return <div ref={ref} />
}
