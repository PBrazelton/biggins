# Phase 2 runbook — wiring up Sanity

This branch (`sanity-cms`) re-platforms the site's content layer from in-repo files
to **Sanity**. The code is complete; these are the steps only you can do (they need
accounts/tokens). `main` stays on the Phase-1 setup and keeps deploying until you
merge this branch, so nothing is at risk while you work through this.

## 1. Create the Sanity project (human)
1. Go to <https://sanity.io> → create a project. Note the **Project ID**.
2. Create a dataset named **`production`**, visibility **Public** (portfolio content is public).
3. Create a write token: **manage.sanity.io → API → Tokens → Add token → Editor**. Copy it.
   (Used once for the migration; never committed.)

## 2. Configure env (human)
```bash
cp .env.example .env                 # root: front-end + migration
cp studio/.env.example studio/.env   # studio
```
Fill in:
- root `.env`: `SANITY_PROJECT_ID`, `SANITY_DATASET=production`, `SANITY_WRITE_TOKEN`
- `studio/.env`: `SANITY_STUDIO_PROJECT_ID` (same id), `SANITY_STUDIO_DATASET=production`

Both `.env` files are git-ignored. The write token lives **only** in root `.env`.

## 3. Install
```bash
npm install              # root (Astro front-end + migration script)
cd studio && npm install && cd ..
```

## 4. Migrate content + assets (one time)
```bash
node --env-file=.env scripts/migrate-to-sanity.mjs
```
Idempotent (deterministic `_id` + `createOrReplace`) — safe to re-run. It uploads every
image/PDF referenced by `content.json` (from `_source/`), parses the human dates into a
`publishedAt` sort key, and writes all docs + singletons. It prints a summary and flags any
unparseable dates (e.g. "Summer"/"Autumn" essay periods → `publishedAt` left null; reorder
those essays by hand in the Studio if needed).

## 5. Verify locally
```bash
npm run dev                 # http://localhost:4321 — now reading from Sanity
cd studio && npx sanity dev # http://localhost:3333 — the Studio, locally
```

## 6. Deploy the Studio (the part Amelie uses)
```bash
cd studio
npx sanity login      # first time
npx sanity deploy     # publishes to https://ameliebrazelton.sanity.studio
```
(Change `studioHost` in `studio/sanity.cli.ts` if that hostname is taken.) Amelie logs in
with Google, edits in forms, crops images via hotspot, writes essay bodies in rich text.

## 7. Point Vercel at Sanity (human)
In the Vercel project → **Settings → Environment Variables**, add (Production + Preview):
- `SANITY_PROJECT_ID = <your id>`
- `SANITY_DATASET = production`

Do **not** add the write token to Vercel — the build only reads.

## 8. Publish → deploy webhook (human)
- Vercel project → **Settings → Git → Deploy Hooks** → create one, copy the URL.
- Sanity **manage → API → Webhooks → Create**:
  - URL = the Vercel deploy hook
  - Trigger on **create / update / delete**, dataset `production`
  - (No projection/filter needed.)

Now: Amelie hits **Publish** → Sanity pings Vercel → site rebuilds (~1–2 min).

## 9. Merge + cut over
Once the dev preview looks right and a test publish rebuilds Vercel:
```bash
git checkout main && git merge sanity-cms && git push
```
Then Phase 3 (DNS) per `MIGRATION-NOTES.md`.

---

### What changed in the code (for reference)
- **Studio** in `studio/` — schemas (`studio/schemaTypes/`), singletons pinned in
  `studio/structure.ts`, deployable standalone.
- **Migration** in `scripts/migrate-to-sanity.mjs`.
- **Front-end** reads Sanity via `src/lib/sanity.ts` (client + `imageUrl`),
  `src/lib/queries.ts` (GROQ), `src/lib/portableText.ts` (essay bodies). Components keep
  their exact markup and the four conventions; only field access changed.
- The Phase-1 in-repo data layer (`src/content`, `src/data`, `src/assets`, the image map,
  `astro:assets`) was removed — Sanity is the source of truth now. `content.json` stays as
  the migration source; the original media library remains under `_source/`.
