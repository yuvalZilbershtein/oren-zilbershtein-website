import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

// Fields left empty in YAML come through as null, so treat empty as "not set".
const text = z.string().nullish();

// One folder per place: src/content/places/<place>/index.md + that place's photos.
const places = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/places' }),
  schema: z.object({
    name: z.string(),
    city: text,
    country: text,
    year: z.union([z.number(), z.string()]).nullish(),
    type: text,
    summary: text,
    services: z
      .array(z.string())
      .nullish()
      .transform((list) => list ?? []),
    cover: text,
    order: z.number().nullish(),
    captions: z
      .record(z.string(), z.string())
      .nullish()
      .transform((map) => map ?? {}),
  }),
});

const testimonials = defineCollection({
  loader: file('src/content/testimonials.yaml', {
    // The file is a plain list (no ids to manage), so number the entries here.
    parser: (source) =>
      ((parse(source) as Record<string, unknown>[] | null) ?? []).map((item, i) => ({
        id: String(i + 1),
        ...item,
      })),
  }),
  schema: z.object({
    quote: z.string(),
    name: text,
    role: text,
    business: text,
    location: text,
    place: text,
  }),
});

export const collections = { places, testimonials };
