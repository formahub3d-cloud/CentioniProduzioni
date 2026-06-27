import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections — single source of truth for the shape of content.
 * The Sveltia CMS config (Fase 2) mirrors these fields exactly, so editors
 * only fill structured, validated fields and can never break the layout.
 */

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      cover: image().optional(),
      excerpt: z.string(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

/**
 * Produzioni video. `status` drives the rendering:
 *  - 'in-corso'  → progetto attivo, può avere un embed YouTube
 *  - 'in-uscita' → "Coming Soon", con etichetta di uscita (es. "Agosto 2026")
 */
const produzioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produzioni' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      status: z.enum(['in-corso', 'in-uscita']).default('in-uscita'),
      cover: image().optional(),
      // ID del video YouTube (es. "dQw4w9WgXcQ") per l'embed click-to-load.
      youtube: z.string().optional(),
      // Eventuale link esterno alternativo (se non YouTube).
      video: z.string().url().optional(),
      // Etichetta di stato/uscita, es. "In uscita · Agosto 2026".
      releaseLabel: z.string().optional(),
      description: z.string().optional(),
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
    }),
});

export const collections = { news, produzioni };
