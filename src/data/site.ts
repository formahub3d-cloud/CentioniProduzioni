/**
 * Site-wide configuration — single source of truth.
 *
 * Metadata + navigation only. The visual design (palette, fonts, motion)
 * lives in `src/styles/global.css` design tokens.
 */
export const SITE = {
  /** Canonical production URL. Updated when the real domain is connected (Fase 3). */
  url: 'https://centioniproduzioni.it',
  /** Short site / brand name. */
  name: 'Centioni Produzioni',
  /** Default <title> suffix and OG site name. */
  title: 'Centioni Produzioni',
  /** Default meta description / homepage subtitle. */
  description:
    'Il canale ufficiale dei contenuti video, dei progetti e delle novità di Niccolò Centioni.',
  /** Brand / organization behind the site. */
  author: 'Centioni Produzioni',
  /** The person behind the brand — used in JSON-LD. */
  person: 'Niccolò Centioni',
  /** Default Open Graph locale. */
  locale: 'it_IT',
  /** Language attribute for <html>. */
  lang: 'it',
  /** Contact email shown on the Contatti page / footer. */
  email: 'info@centioniproduzioni.it',
} as const;

/**
 * Contact form endpoint.
 * Uses Web3Forms (https://web3forms.com) — works on a fully static site with
 * just a free access key, no backend. Replace the access key in Fase 3.
 */
export const CONTACT = {
  endpoint: 'https://api.web3forms.com/submit',
  // TODO (Fase 3): incollare qui la access key gratuita di Web3Forms.
  accessKey: 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY',
} as const;

/** Primary navigation — order matters. */
export const NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Produzioni Video', href: '/produzioni' },
  { label: 'News', href: '/news' },
  { label: 'Chi Siamo', href: '/chi-siamo' },
  { label: 'Contatti', href: '/contatti' },
];

/**
 * Social / external links (footer + Contatti).
 * Sostituire gli # con gli URL reali dei canali ufficiali.
 */
export const SOCIAL: { label: string; href: string }[] = [
  { label: 'YouTube', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
];
