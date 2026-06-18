# Content model & migration guide

This site is built as a **design layer** (`styles.css`) + a **content model** (`content.json`) + **templates** (the HTML). Content is fully separated from design, so it's ready to drop into a static-site generator (Astro or Eleventy recommended) with a Git-based headless CMS (Decap) or a hosted one (Sanity).

This doc is the map from what's here now → the deployed, CMS-managed site.

---

## 1. Files in this project

| File | Role | In the SSG it becomes… |
|---|---|---|
| `index.html` | The full page, hand-authored as the **visual reference / template source** | Your layout + page templates |
| `styles.css` | All styling. Palette lives in CSS variables at the top (`:root`); a labeled "Ochre turned up" block and a "Responsive" block are at the bottom | The global stylesheet (drop in as-is) |
| `content.json` | **All content**, as structured data | Your content collections + singletons |
| `image-slot.js` | Drag-and-drop image placeholder used for the Social tiles (author-fills) | Replace with real uploaded images (`socialWork[].image`) |
| `assets/` | Images + PDFs | Move to the SSG's static/public dir or the CMS media library |
| `CONTENT-MODEL.md` | This file | — |

---

## 2. Page tree (parent → child)

```
/                 Home            — hero + highlights pulled from collections
/writing/         Writing index   — loops `clips` + `documents`
/creative/        Creative index  — loops `essays`
/creative/:id/    Essay (CHILD)   — the only internal child pages (essays[].id is the slug)
/about/           About           — `about` singleton
/contact/         Contact         — `contact` singleton
```

**Key decisions already made:**
- **Clips link OUT** to the publishing paper (`clips[].url`). No child pages — zero clickthrough friction. The "Behind the story" reporter's note (`clips[].note`) lives inline on the card instead.
- **Documents are PDF downloads** (`documents[].file`). No child pages.
- **Essays are the only internal child pages.** Each `essays[]` entry has an `id` that becomes the URL slug. (The essay body isn't written yet — add a `body` field in markdown when you write them.)

---

## 3. The data model (`content.json`)

Two kinds of entries: **singletons** (one of each) and **collections** (lists → loops).

### Singletons
- `site` — name, domain, role, instagram, `nav[]`, `colophon[]`
- `hero` — `eyebrow`, `headline`, `emphasis`, `lede`, `meta[]`, `portrait{image,caption}`
- `sections` — per-section eyebrow `num`, `title`, optional `emphasis`/`sub`/`intro`
- `about` — `fieldPhoto{}`, `paragraphs[]`, `sidebar[{label,value}]`
- `contact` — `heading`, `emphasis`, `headshot`, `pitch`, `email`, `pressKit{}`, `elsewhere[]`, `onFile[]`

### Collections
| Collection | Item shape (key fields) |
|---|---|
| `clips` | `id, date, publication, url, title, deck, thumbnail, tags[], note` |
| `documents` | `id, type, year, shortTitle, title, publisher, abstract, file, filesize` |
| `fieldFrames` | `id, image, caption, orientation` (`"wide"` \| `"regular"`) — the drifting tideline |
| `essays` | `id, category, period, title, excerpt, image, illustrated, url` (+ add `body` for child pages) |
| `socialWork` | `id, label, platform, image` |

### Conventions
- **`emphasis`** — the headline/heading is plain text; `emphasis` is the exact substring the template renders in italic ochre (e.g. headline `"…places & ecologies…"`, emphasis `"ecologies"`). The template wraps the first occurrence. Keeps markup out of the data.
- **`note`** (clips) — an **array of paragraphs**, or `null` when there's no reporter's note. When present, the template renders the expandable "Behind the story" `<details>`; when `null`, only the tags show. This is how each clip opts in.
- **`url` = `"https://example.com/REPLACE-…"`** — every clip needs its real published-article URL filled in.
- **`fieldFrames`** are rendered **twice in a row** in the template purely to make the marquee loop seamlessly — store each frame **once**; the template/loop handles duplication.
- **`socialWork[].image: null`** — these are placeholders today (drag-drop slots). Set each to a real path once the graphics exist.

---

## 4. How it maps to an SSG (for the engineer)

**Astro example.** Each collection → a content collection; each item → a `.md`/`.json`/`.mdx` file (or a CMS entry). Singletons → a single data file or CMS "singleton".

```
src/
  content/
    clips/         (one entry per clips[] item; frontmatter = the fields)
    documents/
    essays/        → also generates /creative/[id] child pages
    fieldFrames/
    socialWork/
  data/
    site.json  hero.json  sections.json  about.json  contact.json
  layouts/
    Base.astro   (the <head>, nav, footer, links styles.css)
  pages/
    index.astro          (Home: import collections, render highlights)
    writing/index.astro  (getCollection('clips') + getCollection('documents'))
    creative/index.astro (getCollection('essays'))
    creative/[id].astro   (one page per essay)
    about.astro  contact.astro
  styles/
    styles.css   (this file, unchanged)
```

The repeated card markup in `index.html` (a `.clip`, a `.docrow`, a `.snap`, a `.frame`, a `.soctile`) is the **template body** for each loop — copy it into the corresponding `.astro` component and swap the literal text for the field values.

**CMS:** point Decap/Sanity at the same collections. Editing a clip in the dashboard → commit/rebuild → deploy on Netlify/Vercel. That's the "manage in real time" loop.

---

## 5. Reskinning / design refresh
All color lives in CSS variables in `:root` at the top of `styles.css` (`--blue`, `--ochre`, `--bg`, etc.). A palette change is editing those few tokens. The bottom of the file has the labeled **"Ochre turned up"** accent layer and the **"Responsive"** breakpoints — both safe to adjust in isolation.

---

## 6. Pre-launch checklist
- [ ] Fill every `clips[].url` with the real published-article link
- [ ] Replace placeholder reporter's notes (`clips[].note`) with real reflections; set `null` where there's none
- [ ] Add real PDFs to `assets/docs/` (filenames already wired in `documents[].file`)
- [ ] Provide real Social graphics → set `socialWork[].image`
- [ ] Write essay bodies + add a `body` field; wire `/creative/:id`
- [ ] Real social/profile URLs in `contact.elsewhere` and `site.instagram`
- [ ] Confirm location consistency (hero says Minneapolis; some captions say St. Petersburg)
