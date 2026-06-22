#!/usr/bin/env node
/**
 * Phase 2.1 — load Amelie's FULL content (extracted from her HTML pages) into
 * Sanity: all 36 articles (Writing index), 9 essays (Creative), 3 social
 * galleries, and the updated Contact. Idempotent (deterministic _id +
 * createOrReplace). Reads /tmp/pn/extracted.json + staged images in /tmp/pn/assets.
 *
 *   node --env-file=.env scripts/migrate-full-content.mjs
 */
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) { console.error('Missing env'); process.exit(1); }
const client = createClient({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, token: SANITY_WRITE_TOKEN, apiVersion: '2024-10-01', useCdn: false });

const ex = JSON.parse(readFileSync('/tmp/pn/extracted.json', 'utf8'));
const ASSET_DIR = '/tmp/pn/assets';
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)));
const slugId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

const assetCache = new Map();
const stats = { img: 0, file: 0 };
// returns the uploaded asset { _id, url } (or undefined)
async function uploadAsset(kind, relPath) {
  if (!relPath) return undefined;
  if (assetCache.has(relPath)) return assetCache.get(relPath);
  const full = `${ASSET_DIR}/${relPath}`;
  if (!existsSync(full)) { console.warn('  ! missing asset', relPath); return undefined; }
  const a = await client.assets.upload(kind, createReadStream(full), { filename: basename(full) });
  kind === 'image' ? stats.img++ : stats.file++;
  const out = { _id: a._id, url: a.url };
  assetCache.set(relPath, out);
  return out;
}
const imgRef = (a) => (a ? { _type: 'image', asset: { _ref: a._id } } : undefined);
const fileRef = (a) => (a ? { _type: 'file', asset: { _ref: a._id } } : undefined);
const upload = async (kind, p) => imgRef(await uploadAsset(kind, p)); // back-compat for image fields
function toISO(s) { const d = new Date(s); return isNaN(d) ? undefined : d.toISOString(); }

async function run() {
  // 1) preserve rich data (thumbnail/credit/note) from existing clips, keyed by url
  const existingClips = await client.fetch(`*[_type=="clip"]{url, credit, note, "thumb": thumbnail}`);
  const richByUrl = Object.fromEntries(existingClips.filter((c) => c.url).map((c) => [c.url, c]));

  // 2) wipe clips + essays (full replace); keep papers, socialWork
  await client.delete({ query: `*[_type=="clip"]` });
  await client.delete({ query: `*[_type=="essay"]` });
  await client.delete({ query: `*[_type=="socialGallery"]` });

  const tx = () => client.transaction();
  const docs = [];

  // 3) CLIPS (articles only; the 2 docs stay as `paper`)
  const articles = ex.clips.filter((c) => !c.isDoc);
  articles.forEach((c, i) => {
    const rich = richByUrl[c.url];
    docs.push(clean({
      _id: `clip-${slugId(c.title)}`,
      _type: 'clip',
      title: c.title,
      slug: { _type: 'slug', current: slugId(c.title) },
      group: c.year,
      order: i,
      displayDate: c.date,
      publishedAt: toISO(c.date),
      publication: c.publication,
      url: c.url,
      deck: c.deck,
      tags: c.tags,
      // carry over rich treatment for the originally-featured pieces
      thumbnail: rich?.thumb,
      credit: rich?.credit,
      note: rich?.note,
    }));
  });

  // 4) ESSAYS (Creative notebook)
  for (let i = 0; i < ex.essays.length; i++) {
    const e = ex.essays[i];
    docs.push(clean({
      _id: `essay-${e.slug}`,
      _type: 'essay',
      title: e.title,
      slug: { _type: 'slug', current: e.slug },
      category: e.category,
      displayPeriod: e.period,
      publishedAt: toISO(e.period),
      order: i,
      excerpt: e.excerpt,
      image: await upload('image', e.image),
      illustrated: false,
      body: [],
    }));
  }

  // 5) SOCIAL GALLERIES
  for (let g = 0; g < ex.galleries.length; g++) {
    const gal = ex.galleries[g];
    const frames = [];
    for (const f of gal.frames) {
      frames.push(clean({ _type: 'frame', _key: slugId(f.title) || `f${frames.length}`, image: await upload('image', f.image), title: f.title, kind: f.type, alt: f.alt }));
    }
    docs.push(clean({
      _id: `gallery-${gal.slug}`,
      _type: 'socialGallery',
      client: gal.name,
      slug: gal.slug,
      cnum: gal.cnum,
      description: gal.description,
      roles: gal.roles,
      igUrl: gal.igUrl,
      igHandle: (gal.igHandle || '').replace(/\s*↗\s*$/, ''),
      order: g,
      frames,
    }));
  }

  // 6) CONTACT update (from contact.html) + résumé + portrait
  const contact = await client.fetch(`*[_id=="contact"][0]`);
  const resume = await uploadAsset('file', 'assets/docs/resume.pdf');
  const portrait = await uploadAsset('image', 'assets/contact-portrait.jpg');
  docs.push(clean({
    ...contact,
    _id: 'contact',
    _type: 'contact',
    email: 'amelie@brazelton.net',
    pitch: 'Open to assignments, communications work, and a good conversation about coastal resilience in communities.',
    headshot: imgRef(portrait) || contact.headshot,
    // pressKit now points at the uploaded résumé file's CDN url
    pressKit: { label: 'Download résumé ↓', url: resume ? resume.url : (contact.pressKit?.url || '#') },
  }));

  // 7) site nav — add Social
  const site = await client.fetch(`*[_id=="site"][0]`);
  const nav = [
    { _key: 'writing', label: 'Writing', href: '/writing/' },
    { _key: 'creative', label: 'Creative', href: '/creative/' },
    { _key: 'social', label: 'Social', href: '/social/' },
    { _key: 'about', label: 'About', href: '/about/' },
    { _key: 'contact', label: 'Contact', href: '/contact/' },
  ];
  docs.push({ ...site, _id: 'site', _type: 'site', nav });

  let t = tx();
  for (const d of docs) t = t.createOrReplace(d);
  await t.commit();

  const byType = docs.reduce((m, d) => ((m[d._type] = (m[d._type] || 0) + 1), m), {});
  console.log('✓ full-content migration complete');
  console.log('  images uploaded:', stats.img, '| files:', stats.file);
  console.log('  written:', JSON.stringify(byType));
  console.log('  articles:', articles.length, '| essays:', ex.essays.length, '| galleries:', ex.galleries.length);
}
run().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
