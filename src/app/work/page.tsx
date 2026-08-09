import { client, projectsQuery } from '@/lib/sanity'
import styles from './page.module.css'
import type { Metadata } from 'next'
import { WorkGrid } from './work-grid'

export const revalidate = 0

async function getProjects() {
  try { return await client.fetch(projectsQuery) } catch { return [] }
}

interface WorkProject {
  _id: string
  title: string
  year: number
  category: string
  client?: string
  vimeoId: string
  vimeoUrl: string
  slug: string
  heroImage?: string
  tags?: string[]
}

// Helper to format project number (001, 002, etc.)
function formatProjectNumber(index: number, total: number): string {
  const digits = total.toString().length
  return index.toString().padStart(digits, '0')
}

export default async function WorkPage() {
  const allProjects = await getProjects() as WorkProject[]

  // Create a map of project ID to formatted number based on sorted position
  const projectNumbers = new Map(
    allProjects.map((p, index) => [
      p._id,
      formatProjectNumber(index + 1, allProjects.length)
    ])
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Work</h1>
        <p className={styles.count}>
          <span className={styles.mono}>{allProjects.length}</span> films
        </p>
      </header>

      <WorkGrid projects={allProjects} projectNumbers={projectNumbers} />
    </div>
  )
}
