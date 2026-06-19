import { defineType, defineField } from 'sanity';

// Schema name is "document" (the academic-paper type). Exported as
// `documentType` to avoid shadowing the global `document`.
export const documentType = defineType({
  name: 'document',
  title: 'Document (PDF)',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'shortTitle',
      type: 'string',
      description: 'Short title shown on the document card face.',
    }),
    defineField({ name: 'type', title: 'Kind', type: 'string', description: 'e.g. "Paper".' }),
    defineField({ name: 'year', type: 'string' }),
    defineField({
      name: 'displayDate',
      title: 'Display date',
      type: 'string',
      description: 'Human string shown on the card, e.g. "Nov 2023".',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at (sort key)',
      type: 'datetime',
    }),
    defineField({ name: 'publisher', type: 'string' }),
    defineField({ name: 'abstract', type: 'text', rows: 5 }),
    defineField({
      name: 'file',
      title: 'PDF',
      type: 'file',
      options: { accept: '.pdf' },
    }),
    defineField({
      name: 'filesize',
      type: 'string',
      description: 'Human label, e.g. "PDF · 13 pages".',
    }),
  ],
  preview: {
    select: { title: 'shortTitle', subtitle: 'publisher' },
  },
});
