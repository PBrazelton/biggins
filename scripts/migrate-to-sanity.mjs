#!/usr/bin/env node
/**
 * One-time, idempotent migration of content.json + local assets into Sanity.
 *
 * Run locally (never in CI) with the write token:
 *   node --env-file=.env scripts/migrate-to-sanity.mjs
 *
 * Requires in .env: SANITY_PROJECT_ID, SANITY_DATASET=production, SANITY_WRITE_TOKEN
 * Uses deterministic _ids + createOrReplace, so re-running overwrites (no dupes).
 */
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN. Set them in .env and run with `node --env-file=.env`.');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_WRITE_TOKEN,
  apiVersion: '2024-10-01',
  useCdn: false,
});

// The full-res originals live under _source/ (git-ignored); fall back to the
// optimized copies in src/ if a path isn't there.
const ASSET_BASES = ['_source', 'src', '.'];
const resolveAsset = (p) => {
  for (const base of ASSET_BASES) {
    const full = `${base}/${p}`;
    if (existsSync(full)) return full;
  }
  return null;
};

const content = JSON.parse(readFileSync('content.json', 'utf8'));

// --- asset upload with per-path cache -------------------------------------
const assetCache = new Map();
const stats = { images: 0, files: 0, unparsedDates: [] };

async function uploadAsset(kind, path) {
  if (!path) return null;
  if (assetCache.has(path)) return assetCache.get(path);
  const full = resolveAsset(path);
  if (!full) {
    console.warn(`  ! asset not found on disk: ${path}`);
    assetCache.set(path, null);
    return null;
  }
  const asset = await client.assets.upload(kind, createReadStream(full), { filename: basename(full) });
  if (kind === 'image') stats.images++;
  else stats.files++;
  assetCache.set(path, asset._id);
  return asset._id;
}

const imageField = async (path) => {
  const id = await uploadAsset('image', path);
  return id ? { _type: 'image', asset: { _ref: id } } : undefined;
};
const fileField = async (path) => {
  const id = await uploadAsset('file', path);
  return id ? { _type: 'file', asset: { _ref: id } } : undefined;
};

// --- date parsing: human string -> ISO (or null) --------------------------
function toISO(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    stats.unparsedDates.push(str);
    return null;
  }
  return d.toISOString();
}

// drop undefined keys so we don't write empty image/file objects
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

// --- build + write --------------------------------------------------------
async function run() {
  const docs = [];

  // clips
  for (const c of content.clips) {
    docs.push(clean({
      _id: `clip-${c.id}`,
      _type: 'clip',
      title: c.title,
      slug: { _type: 'slug', current: c.id },
      displayDate: c.date,
      publishedAt: toISO(c.date),
      publication: c.publication,
      url: c.url,
      deck: c.deck,
      thumbnail: await imageField(c.thumbnail),
      credit: c.credit,
      tags: c.tags,
      note: c.note ?? undefined, // null -> unset (opt-in stays opt-in)
    }));
  }

  // documents
  for (const d of content.documents) {
    docs.push(clean({
      _id: `paper-${d.id}`,
      _type: 'paper',
      title: d.title,
      shortTitle: d.shortTitle,
      type: d.type,
      year: d.year,
      displayDate: d.date,
      publishedAt: toISO(d.date || d.year),
      publisher: d.publisher,
      abstract: d.abstract,
      file: await fileField(d.file),
      filesize: d.filesize,
    }));
  }

  // essays — body left empty (Amelie writes it in Studio)
  for (const e of content.essays) {
    docs.push(clean({
      _id: `essay-${e.id}`,
      _type: 'essay',
      title: e.title,
      slug: { _type: 'slug', current: e.id },
      category: e.category,
      displayPeriod: e.period,
      publishedAt: toISO(e.period),
      excerpt: e.excerpt,
      image: await imageField(e.image),
      illustrated: !!e.illustrated,
      body: [],
    }));
  }

  // fieldFrames — stored once; order preserves the marquee sequence
  for (let i = 0; i < content.fieldFrames.length; i++) {
    const f = content.fieldFrames[i];
    docs.push(clean({
      _id: `fieldFrame-${f.id}`,
      _type: 'fieldFrame',
      caption: f.caption,
      image: await imageField(f.image),
      orientation: f.orientation,
      order: i,
    }));
  }

  // socialWork — image may be null (placeholder)
  for (let i = 0; i < content.socialWork.length; i++) {
    const s = content.socialWork[i];
    docs.push(clean({
      _id: `social-${s.id}`,
      _type: 'socialWork',
      label: s.label,
      platform: s.platform,
      image: await imageField(s.image),
      order: i,
    }));
  }

  // singletons
  const h = content.hero;
  docs.push(clean({
    _id: 'hero', _type: 'hero',
    eyebrow: h.eyebrow, headline: h.headline, emphasis: h.emphasis, lede: h.lede, meta: h.meta,
    portrait: clean({ image: await imageField(h.portrait.image), caption: h.portrait.caption }),
  }));

  docs.push({ _id: 'site', _type: 'site', ...content.site });

  docs.push({ _id: 'sections', _type: 'sections', ...content.sections });

  const a = content.about;
  docs.push(clean({
    _id: 'about', _type: 'about',
    fieldPhoto: clean({ image: await imageField(a.fieldPhoto.image), caption: a.fieldPhoto.caption, location: a.fieldPhoto.location }),
    paragraphs: a.paragraphs,
    sidebar: a.sidebar,
  }));

  const ct = content.contact;
  docs.push(clean({
    _id: 'contact', _type: 'contact',
    heading: ct.heading, emphasis: ct.emphasis,
    headshot: await imageField(ct.headshot),
    pitch: ct.pitch, email: ct.email, pressKit: ct.pressKit, elsewhere: ct.elsewhere, onFile: ct.onFile,
  }));

  // write everything in one transaction (idempotent via createOrReplace)
  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();

  // summary
  const byType = docs.reduce((m, d) => ((m[d._type] = (m[d._type] || 0) + 1), m), {});
  console.log('\n✓ Migration complete.');
  console.log(`  images uploaded: ${stats.images}`);
  console.log(`  files  uploaded: ${stats.files}`);
  console.log('  documents written:', JSON.stringify(byType));
  if (stats.unparsedDates.length) {
    console.log(`  ⚠ unparsed dates (publishedAt left null): ${[...new Set(stats.unparsedDates)].join(', ')}`);
  }
}

run().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
