// components/Navbar.tsx
import Link from 'next/link'
import siteConfig from 'site.config'

import styles from './Navbar.module.css'

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <Link href='/list' className={styles.navbarBrand}>
          {siteConfig.name}
        </Link>
      </div>
      <div className={styles.navbarRight}>
        {/* Future navigation items can go here */}
      </div>
    </nav>
  )
}
