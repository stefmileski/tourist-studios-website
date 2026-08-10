import type { Metadata } from 'next'
import Link from 'next/link'
import { client, postsQuery } from '@/lib/sanity'
import styles from './page.module.css'

export const revalidate = 60
export const metadata: Metadata = { title: 'Journal' }

const DEMO_POSTS = [
  { _id: '1', title: 'On shooting real estate in under 3 hours', slug: 'real-estate-shooting', publishedAt: '2024-11-01', excerpt: 'The systems we use to turn around clean, client-ready real estate content without burning a full day.' },
  { _id: '2', title: 'Why we stopped using gimbals', slug: 'no-gimbals', publishedAt: '2024-09-12', excerpt: 'A note on controlled movement, intentional shake, and why most branded content looks the same.' },
  { _id: '3', title: 'The brief is the creative', slug: 'brief-is-creative', publishedAt: '2024-07-04', excerpt: 'Unpacking why the best work we\'ve done started with the most honest conversations about what something needs to say.' },
]

async function getPosts() {
  try { return await client.fetch(postsQuery) } catch { return DEMO_POSTS }
}

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Journal</h1>
        <p className={styles.sub}>Notes on making things.</p>
      </header>
      <div className={styles.posts}>
        {posts.map((p: any) => (
          <Link key={p._id} href={`/blog/${p.slug}`} className={styles.post}>
            <span className={styles.date}>
              {new Date(p.publishedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <h2 className={styles.postTitle}>{p.title}</h2>
            <p className={styles.excerpt}>{p.excerpt}</p>
            <span className={styles.read}>Read →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
