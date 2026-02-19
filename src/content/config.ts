import { defineCollection, z } from "astro:content";

const postSchema = z.object({
  author: z.string().optional(),
  pubDatetime: z.date(),
  modDatetime: z.date().optional().nullable(),
  title: z.string(),
  featured: z.boolean().optional().default(false),
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).default(["others"]),
  description: z.string().optional().default(""),
  ogImage: z
    .string()
    .optional(),
  postSlug: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof postSchema>;

const blogCollection = defineCollection({
  type: "content",
  schema: postSchema,
});

const tilsCollection = defineCollection({
  type: "content",
  schema: postSchema,
});

export const collections = {
  blog: blogCollection,
  tils: tilsCollection,
};
