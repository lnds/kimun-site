import type { APIRoute } from 'astro';
import { pathInLang } from '../i18n/ui';
import { docsOf } from '../lib/docs';
import { links } from '../lib/links';

// Every page, in both languages, each one pointing at its translation.
export const GET: APIRoute = async () => {
  const docs = await docsOf('es');
  const pages = ['/', '/get-started/', '/about/', '/docs/', ...[...docs.keys()].map((slug) => `/docs/${slug}/`)];
  const es = (page: string) => `${links.site}${pathInLang(page, 'es')}`;
  const en = (page: string) => `${links.site}${pathInLang(page, 'en')}`;
  const urls = pages.flatMap((page) =>
    [es(page), en(page)].map(
      (loc) => `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${es(page)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en(page)}"/>
  </url>`,
    ),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
