import { defineType, defineField } from 'sanity';

export const site = defineType({
  name: 'site',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'domain', type: 'string' }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ name: 'instagram', type: 'string' }),
    defineField({
      name: 'nav',
      title: 'Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'href', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),
    defineField({
      name: 'colophon',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Footer lines.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
