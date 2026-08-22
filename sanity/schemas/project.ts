// Every film is unlisted on Vimeo, so a URL only plays when it carries its
// privacy hash: https://vimeo.com/{id}/{hash}. A hash-less URL 404s for
// visitors — a working-looking entry in the Studio and a dead film on the site.
const VIMEO_URL = /^https:\/\/(?:www\.)?vimeo\.com\/(\d+)(?:\/([0-9a-zA-Z]+))?\/?$/

// Blocks anything that is not a vimeo.com video URL.
const vimeoShapeRule = (value: string | undefined) => {
  if (!value) return true
  return VIMEO_URL.test(value.trim())
    ? true
    : 'Must be a Vimeo video URL, e.g. https://vimeo.com/1234567890/abc123def4'
}

// Flags a missing privacy hash. A warning rather than an error, so a video
// that really is public can still be saved deliberately.
const vimeoHashRule = (value: string | undefined) => {
  if (!value) return true
  const match = VIMEO_URL.exec(value.trim())
  if (!match) return true // the shape rule already reports this
  return match[2]
    ? true
    : 'No privacy hash. Unlisted films need https://vimeo.com/{id}/{hash} or the embed will 404 for visitors.'
}

const vimeoValidation = (R: any) => [R.custom(vimeoShapeRule), R.custom(vimeoHashRule).warning()]

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
    // Every film is unlisted on Vimeo, so a URL only plays when it carries its
    // privacy hash: https://vimeo.com/{id}/{hash}. A hash-less URL 404s for
    // visitors, which looks like a working entry in the Studio and a dead film
    // on the site — hence the check below.
    { name: 'videoUrl', title: 'Vimeo URL', type: 'url',
      description: 'Full Vimeo URL including the privacy hash, e.g. https://vimeo.com/1234567890/abc123def4',
      validation: vimeoValidation },
    // Films created before the field was renamed store their URL here, and 93
    // of the 122 published films still do. The site reads videoUrl first and
    // falls back to this, so both must stay visible in the Studio — otherwise
    // those films show an empty URL field and their real link cannot be seen
    // or corrected. Do not delete without migrating the data onto videoUrl.
    { name: 'vimeoUrl', title: 'Vimeo URL (legacy field)', type: 'url',
      description: 'Older films keep their URL here. The site uses this only when Vimeo URL above is empty. Prefer filling in Vimeo URL for new films.',
      validation: vimeoValidation },
    { name: 'vimeoId', title: 'Vimeo ID (legacy field)', type: 'string',
      description: 'Numeric Vimeo ID, without the privacy hash. Kept in step with the URL above; not used for playback.' },
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
  // videoUrl used to be .required(), but most films carry their URL in the
  // legacy vimeoUrl field instead — a per-field requirement marked those 93
  // documents invalid. The requirement belongs at the document level: one of
  // the two must be present, which is exactly what the site's coalesce needs.
  validation: (R: any) =>
    R.custom((doc: any) =>
      doc?.videoUrl || doc?.vimeoUrl
        ? true
        : { message: 'A film needs a Vimeo URL — fill in either Vimeo URL or the legacy field.', paths: [['videoUrl']] },
    ),
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
