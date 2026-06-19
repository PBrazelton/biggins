import { defineType, defineField } from 'sanity';

export const clip = defineType({
  name: 'clip',
  title: 'Clip',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'emphasis',
      type: 'string',
      description: 'Optional. Substring of the title rendered ochre-italic (first occurrence).',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'displayDate',
      title: 'Display date',
      type: 'string',
      description: 'Human string shown on the card, e.g. "Apr 8, 2026".',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at (sort key)',
      type: 'datetime',
      description: 'Used only for ordering — the card shows "Display date".',
    }),
    defineField({ name: 'publication', type: 'string' }),
    defineField({
      name: 'url',
      title: 'Article URL',
      type: 'url',
      validation: (r) => r.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({ name: 'deck', type: 'text', rows: 3 }),
    defineField({ name: 'thumbnail', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'credit', type: 'string', description: 'e.g. "Photo · Amelie Brazelton".' }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'note',
      title: 'Reporter’s note ("Behind the story")',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
      description: 'Optional. One entry per paragraph. Leave empty to show only the tags.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publication', media: 'thumbnail' },
  },
});
