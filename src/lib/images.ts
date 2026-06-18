import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { imageMap } from './imageMap';

// content.json references images by string path, e.g. "assets/portrait.jpg".
// We resolve those to ESM-imported ImageMetadata via the generated imageMap.
// (Using explicit static imports rather than import.meta.glob keeps Astro from
// emitting every source original — only the optimized transforms ship.)

/** Resolve a content.json path ("assets/x.jpg") to its imported ImageMetadata. */
export function resolveImage(path?: string | null): ImageMetadata | undefined {
  if (!path) return undefined;
  return imageMap[path.replace(/^\/+/, '')];
}

/**
 * Produce an optimized WebP URL for use as a CSS background-image.
 * The original markup paints several elements (.thumb, .frame, .portrait,
 * .snap .img, .field-photo .img) via inline background-image:url(); routing
 * those through getImage() keeps the exact CSS while still optimizing.
 */
export async function bgImage(path?: string | null, width = 1200): Promise<string | undefined> {
  const src = resolveImage(path);
  if (!src) return undefined;
  // Never upscale: cap at the source width (small source webps would otherwise
  // grow when forced to a larger display width).
  const w = Math.min(width, src.width);
  const img = await getImage({ src, width: w, quality: 80, format: 'webp' });
  return img.src;
}
