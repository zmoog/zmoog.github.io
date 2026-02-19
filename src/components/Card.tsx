import type { CollectionEntry } from "astro:content";

interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"] | CollectionEntry<"tils">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description } = frontmatter;

  const datetime = new Date(
    modDatetime && modDatetime > pubDatetime ? modDatetime : pubDatetime
  );

  const date = datetime.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h2>
        ) : (
          <h3 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h3>
        )}
      </a>
      <div className="flex items-center space-x-2 opacity-80">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block h-6 w-6 scale-90 fill-skin-base"
          aria-hidden="true"
        >
          <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
          <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
        </svg>
        <span className="sr-only">Published:</span>
        <span className="italic text-sm">
          <time dateTime={datetime.toISOString()}>{date}</time>
        </span>
      </div>
      <p>{description}</p>
    </li>
  );
}
