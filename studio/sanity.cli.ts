import { defineCliConfig } from 'sanity/cli';

// projectId/dataset come from the studio env (SANITY_STUDIO_*) so the same
// config works for `sanity dev` and `sanity deploy`. Set them in studio/.env
// (see studio/.env.example).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineCliConfig({
  api: { projectId, dataset },
  /* Studio hostname for `sanity deploy` — becomes <studioHost>.sanity.studio.
     Change if taken. */
  studioHost: 'ameliebrazelton',
  autoUpdates: true,
});
