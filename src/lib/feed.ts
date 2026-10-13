import { t, pathInLang, type Lang } from '../i18n/ui';
import { postPath, postSlug, postsOf } from './blog';
import { links } from './links';

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function feedPath(lang: Lang): string {
  return pathInLang('/blog/rss.xml', lang);
}

/** The posts of one language as an RSS feed: title, summary and link. */
export async function feed(lang: Lang): Promise<Response> {
  const tt = t(lang);
  const items = (await postsOf(lang)).map((post) => {
    const link = `${links.site}${postPath(postSlug(post, lang), lang)}`;
    return `    <item>
      <title>${escape(post.data.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escape(post.data.description)}</description>
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(tt('blog.title'))}</title>
    <link>${links.site}${pathInLang('/blog/', lang)}</link>
    <description>${escape(tt('blog.lead'))}</description>
    <language>${lang}</language>
${items.join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
