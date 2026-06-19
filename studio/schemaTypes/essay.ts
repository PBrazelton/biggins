import { defineType, defineField } from 'sanity';

export const essay = defineType({
  name: 'essay',
  title: 'Essay',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'emphasis',
      type: 'string',
      description: 'Optional. Substring of the title rendered ochre-italic.',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'The URL: /creative/<slug>/. Avoid changing it once published.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'category', type: 'string', description: 'e.g. "Creative nonfiction".' }),
    defineField({
      name: 'displayPeriod',
      title: 'Display period',
      type: 'string',
      description: 'Human string shown on the card, e.g. "Apr 2026" or "Summer".',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at (sort key)',
      type: 'datetime',
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'illustrated',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Essay body',
      type: 'array',
      description: 'The full essay. Rich text — this is your long-form writing surface.',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' },
  },
});
