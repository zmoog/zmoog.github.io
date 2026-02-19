import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";
import { slugify, sortPostsByDate } from "@utils";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const tils = await getCollection("tils", ({ data }) => !data.draft);

  const sortedPosts = sortPostsByDate(posts);
  const sortedTils = sortPostsByDate(tils);

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: context.site ?? SITE.website,
    items: [
      ...sortedPosts.map(post => ({
        link: `/posts/${slugify(post)}/`,
        title: post.data.title,
        description: post.data.description,
        pubDate: new Date(post.data.pubDatetime),
      })),
      ...sortedTils.map(til => ({
        link: `/tils/${slugify(til)}/`,
        title: til.data.title,
        description: til.data.description,
        pubDate: new Date(til.data.pubDatetime),
      })),
    ],
  });
}
