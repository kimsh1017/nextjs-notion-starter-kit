// components/Navbar.tsx
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import cs from 'classnames'
import Link from 'next/link'
import * as React from 'react'
import siteConfig from 'site.config'

import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './Navbar.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  return (
    <div
      className={cs(
        'breadcrumb',
        'button',
        !hasMounted && styles.hidden,
        styles.toggleDarkMode
      )}
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
    </div>
  )
}

export function Navbar() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <nav
      className={cs(
        styles.navbar,
        hasMounted &&
          (isDarkMode ? styles.darkModeBorder : styles.lightModeBorder)
      )}
    >
      <div className={styles.navbarContent}>
        <div className={styles.navbarLeft}>
          <Link
            href='/'
            className={cs(
              styles.navbarBrand,
              hasMounted &&
                (isDarkMode
                  ? styles.darkModeTextColor
                  : styles.lightModeTextColor)
            )}
          >
            {siteConfig.name}
          </Link>
        </div>
        <div className={styles.navbarRight}>
          <ToggleThemeButton />
        </div>
      </div>
    </nav>
  )
}
