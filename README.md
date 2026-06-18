# ameliebrazelton.com

Portfolio site for Amelie Brazelton (environmental journalist), built with
[Astro](https://astro.build). Converted from a static Claude Design export into
a data-driven, multi-page site with images optimized through Astro's pipeline.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output -> dist/
npm run preview  # serve the built site
```

## How it's structured

Content is fully separated from design (see `CONTENT-MODEL.md`, the authoritative map).

- **Design** — `src/styles/styles.css` is the original design system, dropped in
  unchanged. `src/styles/site.css` adds only a `.fullbleed` layout utility (no
  visual change; lets full-bleed sections live inside a single `<main>`).
- **Content** — `content.json` is the source of truth. It's split into:
  - `src/content/*.json` — collections (`clips`, `documents`, `essays`,
    `fieldFrames`, `socialWork`), loaded via Astro's `file()` loader with zod
    schemas in `src/content.config.ts`.
  - `src/data/*.json` — singletons (`site`, `hero`, `sections`, `about`, `contact`).
- **Templates** — `src/layouts/Base.astro`, the card components in
  `src/components/`, and the routes in `src/pages/`.

### Pages

```
/                 hero + highlights (latest clips, the tideline, essays, social)
/writing/         clips[] + documents[]
/creative/        essays[]
/creative/[id]/   one page per essay (essays[].id = slug)
/about/  /contact/
```

## Images

Source images referenced by `content.json` live in `src/assets/` and are resolved
through `src/lib/imageMap.ts` (explicit static imports) so Astro emits **only**
optimized WebP — globbing the folder would ship every original. Inline
`background-image` elements are routed through `getImage()` (see `src/lib/images.ts`).
PDFs are downloads, served as-is from `public/assets/docs/`.

To add or change a referenced image: drop it in `src/assets/` and regenerate the
map — the generator logic lives in the project history; the map is a plain list
keyed by `assets/<filename>`.

## Notes

- The original Claude Design export (HTML templates, full media library, the
  `.zip`) is kept under `_source/` for reference and is **git-ignored**.
- Known content gaps are tracked in `CONTENT-MODEL.md` §6 (essay bodies, real
  social graphics, some placeholder links).
