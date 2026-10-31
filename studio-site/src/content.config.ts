import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updateDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    icon: z.string().optional(),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    cover: z.string().default("primary"),
    icon: z.string().default("box"),
    status: z.enum(["online", "building", "beta"]),
    stack: z.array(z.string()).default([]),
    metrics: z
      .array(z.object({ icon: z.string().optional(), label: z.string() }))
      .default([]),
    links: z
      .object({
        site: z.string().url().optional(),
        repo: z.string().url().optional(),
      })
      .optional(),
    related: z.string().optional(), // 关联复盘文章 slug
    order: z.number().default(99),
  }),
});

const learning = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/learning" }),
  schema: z.object({
    week: z.number(),
    date: z.coerce.date(),
    title: z.string(),
    highlights: z.array(z.string()).default([]),
    links: z
      .array(
        z.object({
          slug: z.string().optional(),
          url: z.string().optional(),
          text: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = { blog, products, learning };
