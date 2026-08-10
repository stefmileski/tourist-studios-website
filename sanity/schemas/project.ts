export const project = {
  name: 'project',
  title: 'Film / Project',
  type: 'document',
  fields: [
    { name: 'title', title: 'Film Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'URL Slug', type: 'slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'year', title: 'Year', type: 'number', validation: (R: any) => R.required().min(1990).max(2030) },
    { name: 'category', title: 'Category', type: 'string', validation: (R: any) => R.required(),
      options: {
        list: [
          { title: 'Commercial/Brand', value: 'Commercial/Brand' },
          { title: 'Product', value: 'Product' },
          { title: 'Fashion', value: 'Fashion' },
          { title: 'Art/Cultural', value: 'Art/Cultural' },
          { title: 'Documentary', value: 'Documentary' },
          { title: 'Narrative', value: 'Narrative' },
          { title: 'Music/Art', value: 'Music/Art' },
          { title: 'Music/Branded', value: 'Music/Branded' },
          { title: 'Comedy', value: 'Comedy' },
          { title: 'Branded', value: 'Branded' },
          { title: 'Architecture/Design', value: 'Architecture/Design' },
          { title: 'Automotive/TVC', value: 'Automotive/TVC' },
          { title: 'Event/Sport', value: 'Event/Sport' },
          { title: 'Lifestyle/Editorial', value: 'Lifestyle/Editorial' },
        ]
      }
    },
    { name: 'client', title: 'Client/Project', type: 'string' },
    { name: 'videoUrl', title: 'Vimeo URL', type: 'url', description: 'Full Vimeo URL (e.g., https://vimeo.com/1234567890)', validation: (R: any) => R.required() },
    { name: 'description', title: 'Description', type: 'text', rows: 3 },
    { name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true } },
    { name: 'gallery', title: 'Gallery Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] },
    { name: 'services', title: 'Services', type: 'array', of: [{ type: 'string' }],
      options: { layout: 'tags' } },
    { name: 'featured', title: 'Featured on Homepage', type: 'boolean', initialValue: false },
    { name: 'homepageOrder', title: 'Homepage Order', type: 'number',
      description: 'Position on the homepage (1 = first). Films with a number come before films without; ties fall back to newest year first.',
      hidden: ({ document }: any) => !document?.featured },
  ],
  orderings: [
    { title: 'Year (Newest)', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] },
    { title: 'Title (A-Z)', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'client', media: 'heroImage', year: 'year', category: 'category' },
    prepare: ({ title, subtitle, media, year, category }: any) => ({
      title: `${year ? `[${year}]` : ''} ${title}`,
      subtitle: `${subtitle || 'No client'} — ${category || 'Uncategorized'}`,
      media,
    }),
  },
}
