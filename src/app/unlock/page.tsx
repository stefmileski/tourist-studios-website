import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: { absolute: 'Private preview — Tourist Studios' },
  robots: { index: false, follow: false },
}

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await searchParams
  return (
    <div className={styles.page}>
      <form className={styles.card} method="POST" action="/api/unlock">
        <span className={styles.tag}>Private preview</span>
        <h1 className={styles.title}>Tourist Studios</h1>
        <p className={styles.sub}>This site isn&apos;t live yet. Enter the password to view.</p>
        <input type="hidden" name="from" value={params.from ?? '/'} />
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
        />
        <button className={styles.submit} type="submit">Enter →</button>
        {params.error && <p className={styles.error}>Wrong password — try again.</p>}
      </form>
    </div>
  )
}
