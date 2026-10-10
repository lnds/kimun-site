import type { APIRoute } from 'astro';
import { t, pathInLang, type Lang } from '../i18n/ui';
import { docGroups, docPath, docsOf } from '../lib/docs';
import { links } from '../lib/links';

const url = (path: string, lang: Lang) => `${links.site}${pathInLang(path, lang)}`;

// The pages of the documentation of one language, as a list of links.
async function docLinks(lang: Lang): Promise<string> {
  const docs = await docsOf(lang);
  return docGroups
    .flatMap(({ slugs }) => slugs)
    .map((slug) => {
      const { title, description } = docs.get(slug)!.data;
      return `- [${title}](${links.site}${docPath(slug, lang)}): ${description}`;
    })
    .join('\n');
}

export const GET: APIRoute = async () => {
  const text = `# Kimün

> Kimün (\`km\`) is a command-line tool that measures the health of a codebase: an overall grade from A++ to F--, static metrics (lines of code, duplication, cyclomatic and cognitive complexity, Halstead, maintainability index, code smells, dependencies), what git history tells (hotspots, churn, ownership, temporal coupling, file age) and the impact of a change before it is merged. Written in Rust, MIT licensed. The site kimun.tools is available in Spanish (root paths) and English (paths under /en/).

Every command takes a path and answers for a machine with \`--format json\`. \`km ai skill claude\` installs a skill that teaches a coding agent to run \`km\` and read its output.

Install with \`${links.install.cargo}\` or \`${links.install.brew}\`.

## Site

- [Home (en)](${url('/', 'en')}): what Kimün measures, with real output, the explainer video and the list of commands.
- [Get started (en)](${url('/get-started/', 'en')}): installation, the first measurement and what to look at next.
- [The name (en)](${url('/about/', 'en')}): what "kimün" means and who Madu, the mascot, is.
- [${t('en')('docs.title')} (en)](${url('/docs/', 'en')}): the index of the reference.

## Documentation

${await docLinks('en')}

## Español

- [Inicio (es)](${url('/', 'es')}): qué mide Kimün, con salida real, el video y la lista de comandos.
- [Empezar (es)](${url('/get-started/', 'es')}): instalación, la primera medición y qué mirar después.
- [El nombre (es)](${url('/about/', 'es')}): qué significa «kimün» y quién es Madu, la mascota.
- [${t('es')('docs.title')} (es)](${url('/docs/', 'es')}): el índice de la referencia.

## Documentación en español

${await docLinks('es')}

## Source

- [GitHub · lnds/kimun](${links.github.kimun}): source code, issues and releases.
- [crates.io · kimun](${links.crate}): the published crate.

## Video

- [Kimün explained (en)](${links.site}${links.video.en.src}): two minutes, narrated by Madu.
- [Kimün explicado (es)](${links.site}${links.video.es.src}): dos minutos, narrado por Madu.
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
