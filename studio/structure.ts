import type { StructureResolver } from 'sanity/structure';

// Types that must have exactly one instance (fixed _id == type name).
export const SINGLETONS = [
  { id: 'site', title: 'Site settings' },
  { id: 'hero', title: 'Hero' },
  { id: 'sections', title: 'Section headers' },
  { id: 'about', title: 'About page' },
  { id: 'contact', title: 'Contact' },
];
export const SINGLETON_IDS = new Set(SINGLETONS.map((s) => s.id));

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // --- Singletons (pinned, fixed document id, not creatable) ---
      ...SINGLETONS.map((s) =>
        S.listItem()
          .title(s.title)
          .id(s.id)
          .child(S.document().schemaType(s.id).documentId(s.id).title(s.title))
      ),
      S.divider(),
      // --- Collections (newest first where dated) ---
      S.documentTypeListItem('clip')
        .title('Clips')
        .child(
          S.documentTypeList('clip')
            .title('Clips')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),
      S.documentTypeListItem('essay')
        .title('Essays')
        .child(
          S.documentTypeList('essay')
            .title('Essays')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),
      S.documentTypeListItem('document')
        .title('Documents (PDFs)')
        .child(
          S.documentTypeList('document')
            .title('Documents')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),
      S.documentTypeListItem('fieldFrame')
        .title('Field frames')
        .child(
          S.documentTypeList('fieldFrame')
            .title('Field frames')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      S.documentTypeListItem('socialWork')
        .title('Social work')
        .child(
          S.documentTypeList('socialWork')
            .title('Social work')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
    ]);
