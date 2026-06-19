import { defineType, defineField } from 'sanity';

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({
      name: 'emphasis',
      type: 'string',
      description: 'Substring of the headline rendered ochre-italic (first occurrence).',
    }),
    defineField({ name: 'lede', type: 'text', rows: 3 }),
    defineField({ name: 'meta', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'portrait',
      type: 'object',
      fields: [
        defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
        defineField({ name: 'caption', type: 'string' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Hero' }) },
});
