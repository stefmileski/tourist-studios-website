export const project = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'projectNumber', title: 'Project Number', type: 'number', validation: (R: any) => R.required() },
    { name: 'client', title: 'Client', type: 'string' },
    { name: 'year', title: 'Year', type: 'number' },
    { name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'string' }],
      options: { list: ['Film', 'Photography', 'Direction', 'Campaign', 'Real Estate', 'Fashion', 'Post Production'] } },
    { name: 'services', title: 'Services', type: 'array', of: [{ type: 'string' }] },
    { name: 'description', title: 'Description', type: 'text', rows: 4 },
    { name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } },
    { name: 'gallery', title: 'Gallery', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] },
    { name: 'videoUrl', title: 'Vimeo URL', type: 'url' },
    { name: 'featured', title: 'Featured on Homepage', type: 'boolean', initialValue: false },
  ],
  orderings: [{ title: 'Project Number', name: 'projectNumberDesc', by: [{ field: 'projectNumber', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'client', media: 'coverImage', number: 'projectNumber' },
    prepare: ({ title, subtitle, media, number }: any) => ({
      title: `${String(number).padStart(3,'0')} — ${title}`,
      subtitle,
      media,
    }),
  },
}
