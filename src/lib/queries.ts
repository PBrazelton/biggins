import { client } from './sanity';

// --- projection fragments (GROQ). Aliases keep the Phase-1 component field
//     names (date/period/id/slug) so the markup stays identical. ---
const CLIP = `{
  "id": slug.current,
  title, emphasis, "date": displayDate, publication, url, deck, credit, tags, note, thumbnail
}`;

const DOCUMENT = `{
  title, shortTitle, type, year, "date": displayDate, publisher, abstract, filesize,
  "fileUrl": file.asset->url
}`;

const ESSAY_CARD = `{
  "slug": slug.current, title, category, "period": displayPeriod, excerpt, image, illustrated
}`;

const ESSAY_FULL = `{
  "slug": slug.current, title, emphasis, category, "period": displayPeriod, excerpt, image, illustrated, body
}`;

const FIELD_FRAME = `{ "id": _id, caption, image, orientation }`;
const SOCIAL = `{ "id": _id, label, platform, image }`;

const HERO = `{ eyebrow, headline, emphasis, lede, meta, portrait }`;
const SECTIONS = `{ writing, research, field, creative, social, about }`;
const ABOUT = `{ fieldPhoto, paragraphs, sidebar }`;
const CONTACT = `{ heading, emphasis, headshot, pitch, email, pressKit, elsewhere, onFile }`;
const SITE = `{ name, domain, role, instagram, nav, colophon }`;

// --- queries ---
export const siteQuery = `*[_type=="site"][0]${SITE}`;

export const homeQuery = `{
  "hero": *[_type=="hero"][0]${HERO},
  "sections": *[_type=="sections"][0]${SECTIONS},
  "clips": *[_type=="clip"]|order(publishedAt desc)[0...3]${CLIP},
  "essays": *[_type=="essay"]|order(publishedAt desc)[0...3]${ESSAY_CARD},
  "fieldFrames": *[_type=="fieldFrame"]|order(order asc)${FIELD_FRAME},
  "socialWork": *[_type=="socialWork"]|order(order asc)${SOCIAL}
}`;

export const writingQuery = `{
  "sections": *[_type=="sections"][0]${SECTIONS},
  "clips": *[_type=="clip"]|order(publishedAt desc)${CLIP},
  "documents": *[_type=="document"]|order(publishedAt desc)${DOCUMENT}
}`;

export const creativeQuery = `{
  "sections": *[_type=="sections"][0]${SECTIONS},
  "essays": *[_type=="essay"]|order(publishedAt desc)${ESSAY_CARD}
}`;

export const essaysAllQuery = `*[_type=="essay"]${ESSAY_FULL}`;
export const aboutQuery = `{ "sections": *[_type=="sections"][0]${SECTIONS}, "about": *[_type=="about"][0]${ABOUT} }`;
export const contactQuery = `*[_type=="contact"][0]${CONTACT}`;

export const fetchSite = () => client.fetch(siteQuery);
export const fetchHome = () => client.fetch(homeQuery);
export const fetchWriting = () => client.fetch(writingQuery);
export const fetchCreative = () => client.fetch(creativeQuery);
export const fetchEssays = () => client.fetch(essaysAllQuery);
export const fetchAbout = () => client.fetch(aboutQuery);
export const fetchContact = () => client.fetch(contactQuery);
