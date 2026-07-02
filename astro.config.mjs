// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site.ts';

// https://astro.build/config
export default defineConfig({
  // Canonical site URL — used for sitemap, canonical links and absolute OG URLs.
  // Change this once the final domain is connected (Fase 3).
  site: SITE.url,
  output: 'static',
  // Disable Astro telemetry by default for this project.
  // (Equivalent to running `astro telemetry disable`.)
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/news/tag/'),
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  vite: {
    build: {
      // Nessun asset/script inlined nell'HTML: consente alla CSP (public/_headers)
      // di usare `script-src 'self'` senza 'unsafe-inline'.
      assetsInlineLimit: 0,
    },
  },
});
