export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export const defaultLang = 'es';

export type Lang = keyof typeof languages;

export const ui = {
  es: {
    'site.title': 'Kimün · conocimiento sobre tu código',
    'site.description':
      'Kimün (km) mide la salud de tu código desde la terminal: una nota general, complejidad, duplicación, hotspots, dueños del código y el impacto de cada cambio.',

    'nav.features': 'Qué mide',
    'nav.video': 'Video',
    'nav.commands': 'Comandos',
    'nav.start': 'Empezar',
    'nav.name': 'El nombre',

    'theme.toggle': 'Cambiar entre claro y oscuro',

    'hero.pill': 'Mira a Madu explicarlo en dos minutos y medio',
    'hero.title.line1': 'Conocimiento sobre tu código,',
    'hero.title.line2': 'desde la terminal.',
    'hero.lead':
      'Kimün mide la salud de un proyecto con un solo comando: te da una nota, te dice qué archivos necesitan atención y cuánto alcanza cada cambio antes de fusionarlo.',
    'hero.cta.start': 'Empezar',
    'hero.cta.video': 'Ver el video',
    'hero.whyName': '¿por qué este nombre?',
    'hero.madu.alt': 'Madu, la mascota de Kimün: una pudú con un cintillo rosado',
    'hero.real': 'salida real: kimün midiéndose a sí mismo',

    'install.copy': 'Copiar',
    'install.copied': 'Copiado',

    'video.eyebrow': 'Video',
    'video.title': 'Kimün explicado por Madu',
    'video.body':
      'Dos minutos y medio para ver qué mide, cómo se usa y por qué importa. Madu es machi: la que guarda el conocimiento de su pueblo.',
    'video.other': 'Watch it in English',
    'video.unsupported': 'Tu navegador no reproduce este video. Puedes descargarlo:',

    'features.eyebrow': 'Qué mide',
    'features.title': 'Seis formas de conocer tu código',
    'features.intro':
      'Cada una responde una pregunta distinta, y todas salen del mismo programa.',
    'features.score.title': 'Una nota para el proyecto',
    'features.score.body':
      'De A++ a F--, calculada con cinco dimensiones: complejidad cognitiva, duplicación, indentación, esfuerzo de Halstead y tamaño de los archivos. Y la lista de archivos que conviene mirar primero.',
    'features.static.title': 'Un comando para cada medida',
    'features.static.body':
      'Líneas de código en más de cuarenta lenguajes, código duplicado, complejidad ciclomática y cognitiva, índice de mantenibilidad, malos olores y dependencias entre archivos.',
    'features.history.title': 'La historia, leída desde git',
    'features.history.body':
      'Hotspots: archivos complejos que cambian seguido. Mapa de conocimiento: quién domina cada archivo. Acoplamiento temporal: archivos que cambian siempre juntos, aunque el código no lo diga.',
    'features.impact.title': 'El impacto de un cambio',
    'features.impact.body':
      'Antes de fusionar, pregunta qué alcanza tu cambio: qué archivos llaman a las funciones que tocaste, cuáles tienen tests y dónde probablemente falta uno.',
    'features.impact.note':
      'El radio a nivel de funciones funciona hoy para Elixir, JavaScript/TypeScript y Kaikai.',
    'features.gate.title': 'Una compuerta en CI',
    'features.gate.body':
      'Compara tu rama con la principal. Si un archivo empeora o crece el código duplicado, el cambio no pasa.',
    'features.agents.title': 'Hecho para agentes de código',
    'features.agents.body':
      'Todos los comandos pueden responder en JSON, y con un comando instalas una skill para que tu agente mida antes de cambiar.',

    'commands.eyebrow': 'Comandos',
    'commands.title': 'Todo lo que trae km',
    'commands.intro': 'Cada comando acepta una ruta y, con --format json, responde para una máquina.',
    'commands.group.static': 'Métricas estáticas',
    'commands.group.git': 'Historia en git',
    'commands.group.tools': 'Herramientas',
    'cmd.score': 'La nota general del proyecto, de A++ a F--',
    'cmd.loc': 'Líneas de código, comentarios y blancos por lenguaje',
    'cmd.dups': 'Código duplicado entre archivos',
    'cmd.cycom': 'Complejidad ciclomática por archivo y por función',
    'cmd.cogcom': 'Complejidad cognitiva por archivo y por función',
    'cmd.indent': 'Complejidad por indentación',
    'cmd.hal': 'Métricas de Halstead',
    'cmd.mi': 'Índice de mantenibilidad, en dos variantes (mi y miv)',
    'cmd.smells': 'Malos olores: funciones largas, números mágicos, deuda pendiente',
    'cmd.deps': 'Dependencias entre archivos y sus ciclos',
    'cmd.report': 'Un informe con todas las métricas juntas',
    'cmd.hotspots': 'Archivos complejos que cambian seguido',
    'cmd.churn': 'Cuánto cambia cada archivo',
    'cmd.knowledge': 'Quién domina cada archivo, y dónde hay riesgo',
    'cmd.authors': 'Resumen por autor',
    'cmd.tc': 'Archivos que cambian juntos',
    'cmd.impact': 'Qué alcanza un cambio o un pull request',
    'cmd.age': 'Archivos activos, quietos o congelados',
    'cmd.init': 'Crea un .kimun.toml calibrado para tu proyecto',
    'cmd.ai': 'Skill y análisis para agentes de código',
    'cmd.completions': 'Autocompletado para tu shell',

    'cta.title': '¿Lo probamos?',
    'cta.body':
      'Se instala con un comando y no necesita configuración. Parte con km score en la carpeta de tu proyecto.',
    'cta.docs': 'Ver la documentación',

    'start.eyebrow': 'Empezar',
    'start.title': 'Instala kimün y mide tu primer proyecto',
    'start.lead': 'Un binario llamado km, sin dependencias ni configuración.',
    'start.install.title': 'Instalar',
    'start.install.cargo': 'Con Cargo, desde crates.io:',
    'start.install.brew': 'Con Homebrew, en macOS y Linux:',
    'start.install.bin':
      'También hay binarios listos para macOS, Linux y Windows en la página de versiones.',
    'start.install.releases': 'Ver las versiones',
    'start.first.title': 'La primera medición',
    'start.first.body':
      'Entra a la carpeta de tu proyecto y pide la nota. Kimün respeta tu .gitignore y no necesita un repositorio git para las métricas estáticas.',
    'start.next.title': 'Qué mirar después',
    'start.next.hotspots': 'Dónde conviene mejorar primero: archivos complejos que cambian seguido.',
    'start.next.impact': 'Qué alcanza tu rama antes de fusionarla.',
    'start.next.gate': 'La compuerta para tu integración continua.',
    'start.next.skill': 'La skill para que tu agente use km.',
    'start.config.title': 'Configuración',
    'start.config.body':
      'No hace falta, pero con km init obtienes un .kimun.toml calibrado para tu proyecto, donde puedes ajustar umbrales y exclusiones.',
    'start.docs.title': 'Documentación completa',
    'start.docs.body': 'Cada comando, con sus opciones y ejemplos, está en el README del repositorio.',

    'about.eyebrow': 'El nombre',
    'about.title': 'Kimün y Madu',
    'about.lead': 'De dónde viene el nombre, y quién es la pudú que lo acompaña.',
    'about.name.title': 'Kimün',
    'about.name.p1':
      'Kimün significa «conocimiento» o «sabiduría» en mapudungun, la lengua del pueblo mapuche.',
    'about.name.p2':
      'El nombre dice lo que la herramienta busca: que conozcas tu código antes de cambiarlo. El comando es km, sus dos consonantes.',
    'about.madu.title': 'Madu',
    'about.madu.p1':
      'Madu es una pudú, el ciervo más pequeño del mundo, que vive en los bosques del sur de Chile y Argentina.',
    'about.madu.p2':
      'Es machi: en el pueblo mapuche, la machi guarda el conocimiento, sana y aconseja. Lleva un cintillo rosado en la cabeza, a la manera del trarilonko.',
    'about.kalku.title': 'Kalku, de la misma familia',
    'about.kalku.p1':
      'Madu es hermana de Kalku, la mascota de kalku, una herramienta de pruebas de mutación. Kalku rompe el código a propósito para saber si tus tests lo notan; Madu mide y recuerda.',
    'about.kalku.link': 'Conoce kalku',

    'footer.tagline': 'Conocimiento sobre tu código.',
    'footer.copy': 'Por Eduardo Díaz. Licencia MIT.',
  },
  en: {
    'site.title': 'Kimün · knowledge about your code',
    'site.description':
      'Kimün (km) measures the health of your code from the terminal: an overall grade, complexity, duplication, hotspots, code ownership and the impact of every change.',

    'nav.features': 'What it measures',
    'nav.video': 'Video',
    'nav.commands': 'Commands',
    'nav.start': 'Get started',
    'nav.name': 'The name',

    'theme.toggle': 'Switch between light and dark',

    'hero.pill': 'Watch Madu explain it in two and a half minutes',
    'hero.title.line1': 'Knowledge about your code,',
    'hero.title.line2': 'from the terminal.',
    'hero.lead':
      'Kimün measures the health of a project with one command: it gives you a grade, tells you which files need attention, and how far each change reaches before you merge it.',
    'hero.cta.start': 'Get started',
    'hero.cta.video': 'Watch the video',
    'hero.whyName': 'why this name?',
    'hero.madu.alt': 'Madu, the mascot of Kimün: a pudú wearing a pink headband',
    'hero.real': 'real output: kimün measuring itself',

    'install.copy': 'Copy',
    'install.copied': 'Copied',

    'video.eyebrow': 'Video',
    'video.title': 'Kimün, explained by Madu',
    'video.body':
      'Two and a half minutes on what it measures, how you use it and why it matters. Madu is a machi: the one who holds the knowledge of her people.',
    'video.other': 'Míralo en español',
    'video.unsupported': 'Your browser cannot play this video. You can download it:',

    'features.eyebrow': 'What it measures',
    'features.title': 'Six ways to know your code',
    'features.intro': 'Each one answers a different question, and they all come from the same program.',
    'features.score.title': 'A grade for the project',
    'features.score.body':
      'From A++ to F--, out of five dimensions: cognitive complexity, duplication, indentation, Halstead effort and file size. Plus the list of files worth looking at first.',
    'features.static.title': 'A command for each measure',
    'features.static.body':
      'Lines of code in more than forty languages, duplicated code, cyclomatic and cognitive complexity, maintainability index, code smells and dependencies between files.',
    'features.history.title': 'The history, read from git',
    'features.history.body':
      'Hotspots: complex files that change often. Knowledge map: who owns each file. Temporal coupling: files that always change together, even when the code does not say so.',
    'features.impact.title': 'The impact of a change',
    'features.impact.body':
      'Before you merge, ask what your change reaches: which files call the functions you touched, which of them have tests, and where one is probably missing.',
    'features.impact.note':
      'The function-level radius works today for Elixir, JavaScript/TypeScript and Kaikai.',
    'features.gate.title': 'A gate in CI',
    'features.gate.body':
      'It compares your branch with the main one. If a file gets worse or duplicated code grows, the change does not pass.',
    'features.agents.title': 'Built for coding agents',
    'features.agents.body':
      'Every command can answer in JSON, and one command installs a skill so your agent measures before it changes anything.',

    'commands.eyebrow': 'Commands',
    'commands.title': 'Everything km brings',
    'commands.intro': 'Every command takes a path and, with --format json, answers for a machine.',
    'commands.group.static': 'Static metrics',
    'commands.group.git': 'History in git',
    'commands.group.tools': 'Tools',
    'cmd.score': 'The overall grade of the project, from A++ to F--',
    'cmd.loc': 'Lines of code, comments and blanks by language',
    'cmd.dups': 'Duplicated code across files',
    'cmd.cycom': 'Cyclomatic complexity per file and per function',
    'cmd.cogcom': 'Cognitive complexity per file and per function',
    'cmd.indent': 'Indentation complexity',
    'cmd.hal': 'Halstead metrics',
    'cmd.mi': 'Maintainability index, in two variants (mi and miv)',
    'cmd.smells': 'Code smells: long functions, magic numbers, pending debt',
    'cmd.deps': 'Dependencies between files and their cycles',
    'cmd.report': 'One report with every metric together',
    'cmd.hotspots': 'Complex files that change often',
    'cmd.churn': 'How much each file changes',
    'cmd.knowledge': 'Who owns each file, and where the risk is',
    'cmd.authors': 'Summary by author',
    'cmd.tc': 'Files that change together',
    'cmd.impact': 'What a change or a pull request reaches',
    'cmd.age': 'Active, stale or frozen files',
    'cmd.init': 'Creates a .kimun.toml calibrated for your project',
    'cmd.ai': 'Skill and analysis for coding agents',
    'cmd.completions': 'Completions for your shell',

    'cta.title': 'Shall we try it?',
    'cta.body':
      'It installs with one command and needs no configuration. Start with km score in the folder of your project.',
    'cta.docs': 'Read the documentation',

    'start.eyebrow': 'Get started',
    'start.title': 'Install kimün and measure your first project',
    'start.lead': 'One binary called km, with no dependencies and no configuration.',
    'start.install.title': 'Install',
    'start.install.cargo': 'With Cargo, from crates.io:',
    'start.install.brew': 'With Homebrew, on macOS and Linux:',
    'start.install.bin':
      'There are also ready-made binaries for macOS, Linux and Windows on the releases page.',
    'start.install.releases': 'See the releases',
    'start.first.title': 'The first measurement',
    'start.first.body':
      'Go to the folder of your project and ask for the grade. Kimün respects your .gitignore and needs no git repository for static metrics.',
    'start.next.title': 'What to look at next',
    'start.next.hotspots': 'Where to improve first: complex files that change often.',
    'start.next.impact': 'What your branch reaches before you merge it.',
    'start.next.gate': 'The gate for your continuous integration.',
    'start.next.skill': 'The skill that lets your agent use km.',
    'start.config.title': 'Configuration',
    'start.config.body':
      'None is needed, but km init gives you a .kimun.toml calibrated for your project, where you can tune thresholds and exclusions.',
    'start.docs.title': 'Full documentation',
    'start.docs.body': 'Every command, with its options and examples, is in the README of the repository.',

    'about.eyebrow': 'The name',
    'about.title': 'Kimün and Madu',
    'about.lead': 'Where the name comes from, and who the pudú beside it is.',
    'about.name.title': 'Kimün',
    'about.name.p1':
      'Kimün means "knowledge" or "wisdom" in Mapudungun, the language of the Mapuche people.',
    'about.name.p2':
      'The name says what the tool is after: that you know your code before you change it. The command is km, its two consonants.',
    'about.madu.title': 'Madu',
    'about.madu.p1':
      'Madu is a pudú, the smallest deer in the world, which lives in the forests of southern Chile and Argentina.',
    'about.madu.p2':
      'She is a machi: among the Mapuche, the machi holds the knowledge, heals and advises. She wears a pink band around her head, in the manner of the trarilonko.',
    'about.kalku.title': 'Kalku, of the same family',
    'about.kalku.p1':
      'Madu is the sister of Kalku, the mascot of kalku, a mutation testing tool. Kalku breaks code on purpose to learn whether your tests notice; Madu measures and remembers.',
    'about.kalku.link': 'Meet kalku',

    'footer.tagline': 'Knowledge about your code.',
    'footer.copy': 'By Eduardo Díaz. MIT license.',
  },
} as const;

export type Key = keyof (typeof ui)['es'];

export function t(lang: Lang) {
  return (key: Key) => ui[lang][key] ?? ui[defaultLang][key];
}

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg === 'en') return 'en';
  return 'es';
}

export function pathInLang(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'es') return clean === '/' ? '/' : clean;
  return clean === '/' ? '/en/' : `/en${clean}`;
}
