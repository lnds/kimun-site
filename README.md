# kimun-site

The website of [Kimün](https://github.com/lnds/kimun), in Spanish and English.

Built with [Astro](https://astro.build). Spanish lives at the root and English under `/en/`.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview
```

## Before the first deploy

Set the address of the site in `site.config.mjs`. Canonical links and the social card are built from it.

## Where things are

- `src/i18n/ui.ts`: every text of the site, in both languages.
- `src/lib/output.ts`: the terminal output shown on the pages.
- `src/lib/links.ts`: external links, install commands and the videos.
- `src/styles/global.css`: colors and shared styles, for the light and dark themes.
- `public/video/`: the explainer videos and their posters.
- `public/madu*.png`: Madu, the mascot, whole and as an icon.

To make English the default language, swap `defaultLocale` in `astro.config.mjs` and move the pages of `src/pages/en/` to the root.
