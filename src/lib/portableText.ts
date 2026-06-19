import { toHTML } from '@portabletext/to-html';
import { urlFor } from './sanity';

/** Render an essay's Portable Text `body` to HTML. Empty body → '' (caller
 *  shows the "coming soon" note). Inline images route through Sanity's CDN. */
export function renderBody(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return '';
  return toHTML(value as any, {
    components: {
      types: {
        image: ({ value }: any) => {
          if (!value?.asset) return '';
          const url = urlFor(value).width(1200).auto('format').quality(80).url();
          const alt = value.alt ? String(value.alt) : '';
          return `<figure style="margin:28px 0"><img src="${url}" alt="${alt}" loading="lazy" style="width:100%;height:auto;border:1px solid var(--rule)"/></figure>`;
        },
      },
    },
  });
}
