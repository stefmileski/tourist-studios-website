export const post = {
  name: 'post',
  title: 'Journal Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'publishedAt', title: 'Published', type: 'datetime' },
    { name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 },
    { name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } },
    {
      name: 'body', title: 'Body', type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' },
  },
}

export const settings = {
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'content',  title: 'Content' },
    { name: 'contact',  title: 'Contact & Social' },
    { name: 'colours',  title: 'Colours' },
  ],
  fields: [
    // ── Homepage ──────────────────────────────────────────
    {
      name: 'heroHeadline', title: 'Hero Headline', type: 'text', rows: 2, group: 'content',
      description: 'Big headline on the homepage. Use a line break to control wrapping.',
      initialValue: 'We make things\nworth watching.',
    },
    {
      name: 'heroSub', title: 'Hero Sub-copy', type: 'text', rows: 2, group: 'content',
      initialValue: 'Tourist Studios is a boutique production company.\nFilm, photography, and creative direction — Bondi to everywhere.',
    },
    {
      name: 'services', title: 'Services', type: 'array', of: [{ type: 'string' }], group: 'content',
      description: 'Shown in the homepage strip and About page. Drag to reorder.',
      initialValue: ['Commercial Film', 'Brand Photography', 'Real Estate Video', 'Creative Direction', 'Post Production'],
    },
    // ── About ─────────────────────────────────────────────
    {
      name: 'aboutLead', title: 'About — Lead Paragraph', type: 'text', rows: 4, group: 'content',
      initialValue: 'Tourist Studios is a boutique production company based in Bondi, Sydney. We make films, photographs, and campaigns for brands that care about how they look.',
    },
    {
      name: 'aboutHowWeWork', title: 'About — How We Work', type: 'text', rows: 4, group: 'content',
      initialValue: "We run lean — one director, one vision, zero committees. Every project is taken on because we believe in the brief, not to fill a roster. Sydney-based, available anywhere.",
    },
    {
      name: 'aboutClients', title: 'About — Clients Blurb', type: 'text', rows: 3, group: 'content',
      initialValue: 'We work with fashion labels, hospitality groups, wellness brands, real estate agencies, and early-stage companies who need to look like they\'ve been around forever.',
    },
    // ── Contact ───────────────────────────────────────────
    {
      name: 'contactSub', title: 'Contact — Sub-heading', type: 'string', group: 'contact',
      initialValue: 'We read every enquiry. Usually back within 24 hours.',
    },
    {
      name: 'contactAvailability', title: 'Contact — Availability', type: 'string', group: 'contact',
      initialValue: 'Nationally & internationally',
    },
    {
      name: 'contactLocation', title: 'Contact — Location', type: 'string', group: 'contact',
      initialValue: 'Bondi, Sydney NSW',
    },
    { name: 'email',     title: 'Email',         type: 'string', group: 'contact' },
    { name: 'phone',     title: 'Phone',         type: 'string', group: 'contact' },
    { name: 'instagram', title: 'Instagram URL', type: 'url',    group: 'contact' },
    { name: 'vimeo',     title: 'Vimeo URL',     type: 'url',    group: 'contact' },
    // ── Colours ───────────────────────────────────────────
    {
      name: 'colorInk', title: 'Dark Background', type: 'string', group: 'colours',
      description: 'Main dark background. Hex value e.g. #0E0C0A',
      initialValue: '#0E0C0A',
    },
    {
      name: 'colorCream', title: 'Light Background', type: 'string', group: 'colours',
      description: 'Cream / light surface colour. Hex value e.g. #ECE5D6',
      initialValue: '#ECE5D6',
    },
    {
      name: 'colorAccent', title: 'Accent / Highlight', type: 'string', group: 'colours',
      description: 'Buttons, hover states, active links. Hex value e.g. #3E0306',
      initialValue: '#3E0306',
    },
    {
      name: 'colorMid', title: 'Muted Text', type: 'string', group: 'colours',
      description: 'Secondary / muted text and UI elements. Hex value e.g. #6B6560',
      initialValue: '#6B6560',
    },
  ],
}
