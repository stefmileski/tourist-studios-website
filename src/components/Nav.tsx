'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Wordmark from './Wordmark'
import styles from './Nav.module.css'

const links = [
  { href: '/work',    label: 'Work' },
  { href: '/about',   label: 'About' },
  { href: '/blog',    label: 'Journal' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <nav className={`${styles.nav} ${isHome ? styles.dark : styles.light}`}>
      <Link href="/" className={styles.logo} aria-label="Tourist Studios — Home">
        <Wordmark
          color="var(--crimson)"
          width={120}
          stacked={false}
        />
      </Link>
      <ul className={styles.links}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`${styles.link} ${pathname.startsWith(href) ? styles.active : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/contact" className={styles.cta}>
        Start a project →
      </Link>
    </nav>
  )
}
