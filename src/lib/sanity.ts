import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = import.meta.env.SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET ?? process.env.SANITY_DATASET ?? 'production';

if (!projectId) {
  throw new Error(
    'SANITY_PROJECT_ID is not set. Copy .env.example to .env and fill it in (see RUNBOOK.md).'
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-10-01',
  useCdn: true, // public dataset, read-only at build — CDN is fine and fast
});

const builder = imageUrlBuilder(client);
export const urlFor = (source: SanityImageSource) => builder.image(source);

/**
 * Optimized image URL via Sanity's CDN (WebP, q80, capped width). Replaces the
 * Phase-1 astro:assets pipeline; same ~7MB served weight. Returns undefined for
 * a missing/empty image so callers can fall back (e.g. social placeholders).
 */
export function imageUrl(source: SanityImageSource | null | undefined, width = 1200): string | undefined {
  if (!source || !(source as any).asset) return undefined;
  return urlFor(source).width(width).auto('format').quality(80).url();
}
