import { getCollection, type CollectionEntry } from 'astro:content';
import { pathInLang, type Lang } from '../i18n/ui';

export type Post = CollectionEntry<'blog'>;

export function postSlug(post: Post, lang: Lang): string {
  return post.id.slice(lang.length + 1);
}

export function postPath(slug: string, lang: Lang): string {
  return pathInLang(`/blog/${slug}/`, lang);
}

/** The posts of one language, newest first. */
export async function postsOf(lang: Lang): Promise<Post[]> {
  const posts = await getCollection('blog', ({ id }) => id.startsWith(`${lang}/`));
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** A post lives at the same address in both languages, so each needs its translation. */
export async function postPaths(lang: Lang) {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  const posts = await postsOf(lang);
  const translated = new Set((await postsOf(other)).map((post) => postSlug(post, other)));
  const alone = posts.map((post) => postSlug(post, lang)).filter((slug) => !translated.has(slug));
  if (alone.length) {
    throw new Error(`blog (${lang}): without a translation in ${other}: [${alone}]`);
  }
  return posts.map((post) => ({ params: { slug: postSlug(post, lang) }, props: { post } }));
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CL' : 'en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date);
}
