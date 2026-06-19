import { defineType, defineField } from 'sanity';

export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  fields: [
    defineField({ name: 'heading', type: 'string' }),
    defineField({
      name: 'emphasis',
      type: 'string',
      description: 'Substring of the heading rendered ochre-italic.',
    }),
    defineField({ name: 'headshot', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'pitch', type: 'text', rows: 3 }),
    defineField({ name: 'email', type: 'string' }),
    defineField({
      name: 'pressKit',
      type: 'object',
      fields: [
        defineField({ name: 'label', type: 'string' }),
        defineField({ name: 'url', type: 'string' }),
      ],
    }),
    defineField({
      name: 'elsewhere',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'url', type: 'url' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      // Kept as {label,url} (not bare strings) so the "On file" links keep working.
      name: 'onFile',
      title: 'On file',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'url', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Contact' }) },
});
