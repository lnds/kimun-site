import { SITE_URL } from '../../site.config.mjs';

export const links = {
  site: SITE_URL,
  github: {
    kimun: 'https://github.com/lnds/kimun',
    releases: 'https://github.com/lnds/kimun/releases',
    kalku: 'https://github.com/lnds/kalku',
  },
  crate: 'https://crates.io/crates/kimun',
  blog: 'https://lnds.net',
  install: {
    cargo: 'cargo install kimun',
    brew: 'brew install lnds/kimun/kimun',
  },
  video: {
    es: { src: '/video/kimun-explicado.mp4', poster: '/video/poster-es.jpg' },
    en: { src: '/video/kimun-explained.mp4', poster: '/video/poster-en.jpg' },
  },
} as const;
