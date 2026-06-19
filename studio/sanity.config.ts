import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { structure, SINGLETON_IDS } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'amelie',
  title: 'Amelie Brazelton',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Hide singleton types from the global "create new" menu so Amelie can't
    // make duplicates — they're only reachable via the pinned structure items.
    templates: (templates) => templates.filter((t) => !SINGLETON_IDS.has(t.schemaType)),
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !SINGLETON_IDS.has(item.templateId))
        : prev,
    // Singletons can't be deleted/duplicated from the document menu.
    actions: (prev, { schemaType }) =>
      SINGLETON_IDS.has(schemaType)
        ? prev.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action!))
        : prev,
  },
});
