import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://zmoog.dev/",
  author: "Maurizio Branca",
  desc: "Little projects and uncomplicated write-ups",
  title: "Practical Nerdery",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en",
  langTag: ["en-EN"],
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/zmoog/",
    linkTitle: `${SITE.author} on Github`,
    active: true,
  },
  {
    name: "Mastodon",
    href: "https://mastodon.online/@zmoog",
    linkTitle: `${SITE.author} on Mastodon`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/zmoog",
    linkTitle: `${SITE.author} on Twitter`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/mauriziobranca",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: false,
  },
  {
    name: "Mail",
    href: "mailto:maurizio.branca@gmail.com",
    linkTitle: `Send an email to ${SITE.author}`,
    active: false,
  },
  {
    name: "RSS",
    href: "/rss.xml",
    linkTitle: "RSS Feed",
    active: false,
  },
];
