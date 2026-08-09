import { client, projectsQuery } from '@/lib/sanity'
import { getVimeoMeta, mapWithConcurrency, vimeoPlayerSrc } from '@/lib/vimeo'
import styles from './page.module.css'
import type { Metadata } from 'next'
import { WorkGrid, type WorkProject } from './work-grid'

export const revalidate = 0

export const metadata: Metadata = { title: 'Work — Tourist Studios' }

async function getProjects() {
  try { return await client.fetch(projectsQuery) } catch { return [] }
}

// Helper to format project number (01, 02, etc.)
function formatProjectNumber(index: number, total: number): string {
  const digits = total.toString().length
  return index.toString().padStart(digits, '0')
}

export default async function WorkPage() {
  const allProjects = await getProjects() as WorkProject[]

  // Enrich with Vimeo thumbnail + a muted low-res hover preview starting a
  // quarter of the way in, where the action is. oEmbed lookups are cached for
  // a day; failures fall back to the year placeholder.
  const enriched: WorkProject[] = await mapWithConcurrency(allProjects, 10, async (p) => {
    const meta = await getVimeoMeta(p.videoUrl)
    const previewStart = meta.duration ? Math.floor(meta.duration * 0.25) : 0
    return {
      ...p,
      thumbnailUrl: meta.thumbnailUrl,
      previewStart,
      previewSrc: vimeoPlayerSrc(p.videoUrl, {
        background: true,
        startAt: previewStart,
        quality: '360p',
      }),
    }
  })

  const projectNumbers = new Map(
    enriched.map((p, index) => [
      p._id,
      formatProjectNumber(index + 1, enriched.length)
    ])
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Work</h1>
        <p className={styles.count}>
          <span className={styles.mono}>{enriched.length}</span> films
        </p>
      </header>

      <WorkGrid projects={enriched} projectNumbers={projectNumbers} />
    </div>
  )
}
