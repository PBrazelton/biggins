// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://ameliebrazelton.com',
  // Images are optimized per-call via <Image>/getImage (WebP, quality ~80,
  // capped at ~1600px) in src/lib/images.ts and the card components.
});
