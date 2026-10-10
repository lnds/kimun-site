import { getCollection, type CollectionEntry } from 'astro:content';
import { pathInLang, type Key, type Lang } from '../i18n/ui';

export type Doc = CollectionEntry<'docs'>;

// The order of the documentation: its menu, its index and the links to the
// previous and next page all follow it.
export const docGroups: { title: Key; slugs: string[] }[] = [
  { title: 'docs.group.guide', slugs: ['install', 'configuration'] },
  {
    title: 'commands.group.static',
    slugs: ['score', 'loc', 'dups', 'cycom', 'cogcom', 'indent', 'hal', 'mi', 'miv', 'smells', 'deps', 'report'],
  },
  {
    title: 'commands.group.git',
    slugs: ['hotspots', 'churn', 'knowledge', 'authors', 'tc', 'impact', 'age'],
  },
  { title: 'commands.group.tools', slugs: ['ai'] },
  { title: 'docs.group.reference', slugs: ['languages', 'references'] },
];

// Commands documented inside the page of another subject.
const documentedIn: Record<string, string> = {
  init: 'configuration',
  completions: 'install',
};

export function docPath(slug: string, lang: Lang): string {
  return pathInLang(`/docs/${slug}/`, lang);
}

export function commandDocPath(command: string, lang: Lang): string {
  return docPath(documentedIn[command] ?? command, lang);
}

/** The pages of one language, by slug. A page left out of the order fails the build. */
export async function docsOf(lang: Lang): Promise<Map<string, Doc>> {
  const entries = await getCollection('docs', ({ id }) => id.startsWith(`${lang}/`));
  const bySlug = new Map(entries.map((entry) => [entry.id.slice(lang.length + 1), entry]));
  const ordered = docGroups.flatMap((group) => group.slugs);
  const missing = ordered.filter((slug) => !bySlug.has(slug));
  const unlisted = [...bySlug.keys()].filter((slug) => !ordered.includes(slug));
  if (missing.length || unlisted.length) {
    throw new Error(
      `docs (${lang}): without a page: [${missing}]; without a place in docGroups: [${unlisted}]`,
    );
  }
  return bySlug;
}

export async function docPaths(lang: Lang) {
  const docs = await docsOf(lang);
  return [...docs].map(([slug, entry]) => ({ params: { slug }, props: { entry } }));
}
