import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// Each collection is loaded from a single JSON array sliced out of the original
// content.json. The `file()` loader keys each entry by its `id` field.

const clips = defineCollection({
  loader: file('src/content/clips.json'),
  schema: z.object({
    id: z.string(),
    date: z.string(),
    publication: z.string(),
    url: z.string(),
    title: z.string(),
    deck: z.string(),
    thumbnail: z.string(),
    credit: z.string(),
    tags: z.array(z.string()),
    // opt-in reporter's note: array of paragraphs, or null when there's none
    note: z.array(z.string()).nullable(),
  }),
});

const documents = defineCollection({
  loader: file('src/content/documents.json'),
  schema: z.object({
    id: z.string(),
    type: z.string(),
    year: z.string(),
    shortTitle: z.string(),
    title: z.string(),
    publisher: z.string(),
    date: z.string(),
    abstract: z.string(),
    file: z.string(),
    filesize: z.string(),
  }),
});

const fieldFrames = defineCollection({
  loader: file('src/content/fieldFrames.json'),
  schema: z.object({
    id: z.string(),
    image: z.string(),
    caption: z.string(),
    orientation: z.enum(['wide', 'regular']),
  }),
});

const essays = defineCollection({
  loader: file('src/content/essays.json'),
  schema: z.object({
    id: z.string(),
    category: z.string(),
    period: z.string(),
    title: z.string(),
    excerpt: z.string(),
    image: z.string(),
    illustrated: z.boolean(),
    // markdown body path — not written yet for several essays (content gap)
    body: z.string().optional(),
    url: z.string(),
  }),
});

const socialWork = defineCollection({
  loader: file('src/content/socialWork.json'),
  schema: z.object({
    id: z.string(),
    label: z.string(),
    platform: z.string(),
    // null today — placeholders until real graphics are wired in
    image: z.string().nullable(),
  }),
});

export const collections = { clips, documents, fieldFrames, essays, socialWork };
