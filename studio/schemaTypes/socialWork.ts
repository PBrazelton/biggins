import { defineType, defineField } from 'sanity';

export const socialWork = defineType({
  name: 'socialWork',
  title: 'Social work',
  type: 'document',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'platform', type: 'string', description: 'e.g. "Instagram", "Facebook · IG".' }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. If empty, a neutral placeholder block is shown.',
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Position in the grid (lower = earlier).',
    }),
  ],
  orderings: [
    { title: 'Grid order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'label', subtitle: 'platform', media: 'image' },
  },
});
