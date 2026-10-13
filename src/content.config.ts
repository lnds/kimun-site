import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The documentation: one folder per language, the same file names in both.
const docs = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

// The blog: laid out like the documentation, and ordered by date.
const blog = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = { docs, blog };
