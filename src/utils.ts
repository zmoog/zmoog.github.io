import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";

export const slugifyStr = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const slugify = (post: CollectionEntry<"blog"> | CollectionEntry<"tils">) =>
  post.data.postSlug ? slugifyStr(post.data.postSlug) : slugifyStr(post.data.title);

export const slugifyAll = (arr: string[]) => arr.map(el => slugifyStr(el));

export const getReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
};

export type BlogPost = CollectionEntry<"blog">;
export type TilPost = CollectionEntry<"tils">;

export const sortPostsByDate = <T extends { data: { pubDatetime: Date; modDatetime?: Date | null } }>(
  posts: T[]
): T[] => {
  return posts.sort(
    (a, b) =>
      Math.floor(
        new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
      ) -
      Math.floor(
        new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
      )
  );
};

export const getUniqueTags = (posts: CollectionEntry<"blog">[] | CollectionEntry<"tils">[]) => {
  const tags: string[] = posts
    .flatMap(post => post.data.tags)
    .map(tag => slugifyStr(tag));
  return [...new Set(tags)].sort();
};

export const getPostsByTag = (
  posts: CollectionEntry<"blog">[],
  tag: string
) => posts.filter(post => post.data.tags.some(t => slugifyStr(t) === tag));

export const getTilsByTag = (
  posts: CollectionEntry<"tils">[],
  tag: string
) => posts.filter(post => post.data.tags.some(t => slugifyStr(t) === tag));

export function getPath(collection: string, slug: string) {
  return `/${collection}/${slug}/`;
}
