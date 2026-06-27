/**
 * Site-wide configuration — single source of truth.
 *
 * Edit these values to change the metadata used across the whole site
 * (SEO tags, sitemap, JSON-LD, header/footer). The visual design
 * (palette, fonts, atmosphere) lives in `src/styles/global.css` and the
 * design tokens there — this file is content/metadata only.
 */
export const SITE = {
  /** Canonical production URL. Updated when the real domain is connected (Fase 3). */
  url: 'https://centioniproduzioni.it',
  /** Short site / brand name. */
  name: 'Centioni Produzioni',
  /** Default <title> suffix and OG site name. */
  title: 'Centioni Produzioni — Portfolio & Blog',
  /** Default meta description (used when a page provides none). */
  description:
    'Portfolio e blog di Centioni Produzioni: progetti, lavori e racconti dietro le quinte.',
  /** Author / person behind the site — used in JSON-LD. */
  author: 'Centioni Produzioni',
  /** Default Open Graph locale. */
  locale: 'it_IT',
  /** Language attribute for <html>. */
  lang: 'it',
} as const;

/** Primary navigation — order matters. */
export const NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

/** Social / external links shown in the footer. Add or remove freely. */
export const SOCIAL: { label: string; href: string }[] = [
  // { label: 'Instagram', href: 'https://instagram.com/…' },
  // { label: 'YouTube', href: 'https://youtube.com/@…' },
];
