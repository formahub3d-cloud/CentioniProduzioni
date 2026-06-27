import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections.
 *
 * These schemas are the single source of truth for the shape of content.
 * The Sveltia CMS config (`public/admin/config.yml`, Fase 2) mirrors these
 * fields exactly so editors can only fill structured, validated fields and
 * can never break the layout.
 */

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      // Cover image lives in the shared media folder (src/assets/media).
      // Optional so a post can exist without one.
      cover: image().optional(),
      excerpt: z.string(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

/**
 * Works = the video covers shown on the home page. Each item is a cover image
 * that links out to an EXTERNAL video (Vimeo / YouTube / client page). There is
 * no internal detail page by design — the cover is the link.
 */
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      cover: image(),
      // External destination (the cover links here).
      video: z.string().url(),
      // Optional context shown under the title.
      role: z.string().optional(),
      year: z.number().int().optional(),
      // Manual ordering in the grid (lower = first).
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, works };
