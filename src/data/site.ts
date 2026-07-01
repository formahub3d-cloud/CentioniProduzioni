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
  /** Homepage <title> and OG site name. */
  title: 'Centioni Produzioni — Produzioni video di Niccolò Centioni',
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
  /** Default social-share image (root-relative, in /public). */
  ogImage: '/og-default.jpg',
} as const;

/**
 * Contact form endpoint.
 * Uses Web3Forms (https://web3forms.com) — works on a fully static site with
 * just a free access key, no backend.
 *
 * La access key va impostata come variabile di build su Cloudflare Pages
 * (`PUBLIC_WEB3FORMS_KEY`), così non finisce hardcoded nel repo. Finché è vuota,
 * il form invita a scrivere via email invece di fallire silenziosamente.
 */
export const CONTACT = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
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
 *
 * L'URL YouTube ha un default reale ma resta sovrascrivibile con la variabile
 * di build `PUBLIC_YOUTUBE_URL` su Cloudflare Pages. Eventuali voci senza URL
 * valido vengono filtrate (niente link morti).
 */
const YOUTUBE_URL =
  import.meta.env.PUBLIC_YOUTUBE_URL ?? 'https://www.youtube.com/channel/UC6533iFPsUI9mx7R8iBTwSg';

export const SOCIAL: { label: string; href: string }[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/centioniproduzioni.it' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1BpVdDoW3f/' },
  { label: 'YouTube', href: YOUTUBE_URL },
].filter((s) => /^https?:\/\//.test(s.href));
