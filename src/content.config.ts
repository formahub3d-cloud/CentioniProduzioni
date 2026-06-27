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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      cover: image(),
      year: z.number().int(),
      role: z.string(),
      // External / video links (e.g. Vimeo, YouTube, client site).
      links: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url(),
          }),
        )
        .default([]),
      description: z.string(),
      // Manual ordering in the portfolio grid (lower = first).
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, projects };
