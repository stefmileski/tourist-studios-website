import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { project } from './sanity/schemas/project'
import { post, settings } from './sanity/schemas/index'

export default defineConfig({
  name: 'tourist-studios',
  title: 'Tourist Studios CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem().title('Projects').schemaType('project').child(S.documentTypeList('project')),
            S.listItem().title('Journal').schemaType('post').child(S.documentTypeList('post')),
            S.divider(),
            S.listItem().title('Settings').schemaType('settings').child(S.document().schemaType('settings').documentId('settings')),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: [project, post, settings] },
})
