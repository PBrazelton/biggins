// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://ameliebrazelton.com',
  // Images are served + transformed by Sanity's CDN (see src/lib/sanity.ts), so
  // we don't use astro:assets/sharp. Passthrough avoids the sharp dependency.
  image: { service: passthroughImageService() },
});
