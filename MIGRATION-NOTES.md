# Portfolio migration — triage & plan

Cleaned bundle prepared from `Portfolio.zip` (the Claude Design export).
Pairs with Claude Design's own `CONTENT-MODEL.md` (kept in this folder — read it; it's the map).

## What the 207 MB actually was

| Bucket | Size | Verdict |
|---|---|---|
| `uploads/` (raw source dump: camera images, a nested 11 MB zip, stray PDFs, old drafts, "direction" prompt files) | ~142 MB | **Deleted.** The real site references *none* of it. |
| `assets/` (the curated, in-use image + PDF library) | ~77 MB | **Kept** — but unoptimized. |
| Root-level source (HTML templates, CSS, `content.json`, JS) | <1 MB | **Kept.** This is the site. |

After Astro's build pipeline (WebP, max ~1600px, q80) the 72 MB of images
serve at **~6.6 MB — a 91% reduction.** The final site is single-digit MB.

## Two facts that change the plan

1. **It's a static HTML/CSS site**, not a React/Next build. Clean and portable.
2. **Content is already separated from design.** Claude Design split everything into
   `content.json` (all copy, as structured data), `styles.css` (all design, via CSS
   variables), and the HTML files (templates). That's the exact architecture Astro+Sanity
   wants — so there is **no "HTML rip" phase to do.** The content is already ripped.

## Phase plan

**Phase 1 — Scaffold Astro from this bundle.** (one Claude Code session)
- `styles.css` drops in unchanged (global stylesheet).
- Each HTML template's repeated card markup (`.clip`, `.docrow`, `.snap`, `.frame`,
  `.soctile`) becomes an Astro component; literal text → field values.
- `content.json` → Astro content collections + a few singleton data files.
- `assets/` → `src/assets/`, referenced through Astro's `<Image>` so it auto-optimizes.
- Deploy to a free `*.vercel.app` URL. The live WordPress site is untouched the whole time.

**Phase 2 — Add Sanity for the dashboard editing experience.** (deferred until she wants it)
- Model the same collections in Sanity; move `content.json` entries in.
- Sanity Studio becomes her "log in and publish" interface.
- Deploy hook (Vercel) + publish webhook (Sanity) = publish → rebuild → live.
- *Optional:* she can launch on Phase 1 (content in-repo) and add this later. Astro content
  collections are a fine editing surface for a few-times-a-month writer; Sanity is the
  upgrade when she wants forms-and-a-publish-button instead of editing files.

**Phase 3 — Cut over DNS.** Per the plan: drop A-record TTL a day ahead, repoint the
Namecheap A/CNAME records to Vercel (leave MX/TXT alone), verify, then cancel cPanel hosting.

## Before launch (from CONTENT-MODEL.md §6 — these are real gaps in the content)

- Several `clips[].url` are real, but confirm every one points to the published article.
- `socialWork[].image` are still null placeholders — need real graphics.
- Essay bodies aren't written yet (`essays[].body` points at markdown that needs filling).
- Hero says Minneapolis; some captions say St. Petersburg — pick one.

## Starter prompt for Claude Code

> This folder is a static site exported from Claude Design, with content already
> separated into `content.json` and design into `styles.css`. Read `CONTENT-MODEL.md` —
> it specifies the exact Astro structure (content collections per list, singleton data
> files, page tree, and which card markup maps to which loop). Scaffold a fresh Astro
> project following that map: drop `styles.css` in unchanged, port each HTML template's
> card markup into an Astro component, load `content.json` as content collections +
> singletons, and wire `assets/` through Astro's `<Image>` for optimization. Generate
> `/creative/[id]` pages from the essays collection. Don't invent content — use what's
> in `content.json`. Get it building and previewing locally first.
