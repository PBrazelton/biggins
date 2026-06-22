import { defineType, defineField, defineArrayMember } from 'sanity';

export const socialGallery = defineType({
  name: 'socialGallery',
  title: 'Social gallery',
  type: 'document',
  description: 'A client/org social-media gallery (Design for the feed).',
  fields: [
    defineField({ name: 'client', title: 'Client / org', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'cnum', title: 'Client label', type: 'string', description: 'e.g. "Client 01 · Ongoing".' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({
      name: 'roles',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'e.g. Strategy, Graphic design, Scheduling.',
    }),
    defineField({ name: 'igUrl', title: 'Instagram URL', type: 'url' }),
    defineField({ name: 'igHandle', title: 'Instagram handle', type: 'string', description: 'e.g. @sparkwellness' }),
    defineField({ name: 'order', type: 'number', description: 'Order on the Social page (lower first).' }),
    defineField({
      name: 'frames',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'frame',
          fields: [
            defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'kind', title: 'Type', type: 'string', description: 'e.g. Announcement, Carousel.' }),
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'kind', media: 'image' } },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Page order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'client', subtitle: 'igHandle' } },
});
