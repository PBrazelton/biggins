#!/usr/bin/env node
/**
 * Convert each essay's HTML body (.essay-body in her creative/*.html) to
 * Portable Text and write it to the matching Sanity `essay` doc.
 *   node --env-file=.env scripts/import-essay-bodies.mjs
 * Idempotent: patches body on essay-<slug>. Inline images are uploaded + referenced.
 */
import { createClient } from '@sanity/client';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) { console.error('Missing env'); process.exit(1); }
const client = createClient({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, token: SANITY_WRITE_TOKEN, apiVersion: '2024-10-01', useCdn: false });

const SLUGS = [
  'birth-control', 'dating-at-eckerd', 'sea-salt-eatery', 'anna-maria-island',
  'te-amo-sempre-filha', 'red-tide-summer', 'hello-again', 'questions-for-a-bisexual', 'because-minneapolis',
];
const HTML_DIR = '/tmp/pn/creative';
const ASSET_DIR = '/tmp/pn/assets';

// block content schema matching essay.body (block + image)
const schema = Schema.compile({
  name: 'default',
  types: [{ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }],
});
const blockContentType = schema.get('body');

// upload an inline body image (src like "../assets/x.jpg") -> asset _id
const imgCache = new Map();
async function uploadBodyImage(src) {
  if (imgCache.has(src)) return imgCache.get(src);
  const rel = src.replace(/^(\.\.\/)+/, ''); // ../assets/x.jpg -> assets/x.jpg
  const full = `${ASSET_DIR}/${rel}`;
  if (!existsSync(full)) { console.warn('  ! body image missing:', src); imgCache.set(src, null); return null; }
  const a = await client.assets.upload('image', createReadStream(full), { filename: basename(full) });
  imgCache.set(src, a._id);
  return a._id;
}

async function run() {
  let tx = client.transaction();
  let total = 0;
  for (const slug of SLUGS) {
    const path = `${HTML_DIR}/${slug}.html`;
    if (!existsSync(path)) { console.warn('  ! missing', path); continue; }
    const dom = new JSDOM(readFileSync(path, 'utf8'));
    const el = dom.window.document.querySelector('.essay-body');
    if (!el) { console.warn('  ! no .essay-body in', slug); continue; }

    // pre-upload any inline images so the deserialize rule can map them sync
    const refMap = {};
    for (const img of el.querySelectorAll('img')) {
      const src = img.getAttribute('src');
      const id = await uploadBodyImage(src);
      if (id) refMap[src] = id;
    }

    const blocks = htmlToBlocks(el.innerHTML, blockContentType, {
      parseHtml: (html) => new JSDOM(html).window.document,
      rules: [
        {
          deserialize(node, next, block) {
            if (node.tagName && node.tagName.toLowerCase() === 'img') {
              const ref = refMap[node.getAttribute('src')];
              return ref ? block({ _type: 'image', asset: { _ref: ref } }) : undefined;
            }
            return undefined;
          },
        },
      ],
    });

    const blockCount = blocks.filter((b) => b._type === 'block').length;
    const imgCount = blocks.filter((b) => b._type === 'image').length;
    console.log(`  ${slug.padEnd(24)} -> ${blocks.length} blocks (${blockCount} text, ${imgCount} image)`);
    tx = tx.patch(`essay-${slug}`, { set: { body: blocks } });
    total++;
  }
  await tx.commit();
  console.log(`\n✓ imported bodies for ${total} essays`);
}
run().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
