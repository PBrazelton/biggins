import { defineType, defineField } from 'sanity';

export const fieldFrame = defineType({
  name: 'fieldFrame',
  title: 'Field frame',
  type: 'document',
  fields: [
    defineField({ name: 'caption', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'orientation',
      type: 'string',
      options: { list: ['wide', 'regular'], layout: 'radio' },
      initialValue: 'regular',
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Position in the drifting tideline marquee (lower = earlier).',
    }),
  ],
  orderings: [
    { title: 'Marquee order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'caption', subtitle: 'orientation', media: 'image' },
  },
});
