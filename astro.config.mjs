import { defineConfig } from 'astro/config';
import { SITE_URL } from './site.config.mjs';

export default defineConfig({
  site: SITE_URL,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
