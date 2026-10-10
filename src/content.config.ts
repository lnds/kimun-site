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

export const collections = { docs };
