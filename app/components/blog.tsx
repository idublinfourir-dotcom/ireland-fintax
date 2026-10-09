import Link from "next/link";
import { Breadcrumbs } from "./ui";
import { CopyLinkButton } from "./copy-link-button";
import { PostImg } from "./post-body";
import { POST_CATEGORY_LABELS, type PostImage } from "../lib/post-types";
import type { TocEntry } from "../lib/post-blocks";
import type { Post, PostSummary } from "../lib/posts";

/* Blog building blocks: cards, the post header and cover, sharing, the table
   of contents and page navigation. Server components, apart from the copy
   button. */

/* Dates in Irish time: the server runs in UTC, and a post published just
   after midnight in summer would otherwise show the day before. */
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Dublin",
});
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" });

export const formatPostDate = (d: Date) => dateFmt.format(d);

/** Edited on a later day than it was published? Then the post says so. */
export function wasUpdated(post: Pick<PostSummary, "publishedAt" | "updatedAt">) {
  return dayKey.format(post.updatedAt) > dayKey.format(post.publishedAt);
}

function Meta({ post }: { post: PostSummary }) {
  return (
    <>
      <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      {post.readingMinutes} min read
    </>
  );
}

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-500";

export function PostCard({ post, headingLevel = 2 }: { post: PostSummary; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
    >
      <div className="aspect-[3/2] overflow-hidden bg-surface-muted">
        <PostImg
          image={post.cover}
          width={900}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 ease-snappy group-hover:scale-[1.03]"
        />
      </div>
      <p className={`mt-5 ${eyebrow}`}>{POST_CATEGORY_LABELS[post.category]}</p>
      <Heading className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-balance text-ink transition-colors duration-200 group-hover:text-primary-600">
        {post.title}
      </Heading>
      <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-muted">{post.excerpt}</p>
      <p className="mt-3 text-xs text-muted">
        <Meta post={post} />
      </p>
    </Link>
  );
}

/** The newest post, large, at the top of the blog. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12"
    >
      <div className="aspect-[16/10] overflow-hidden bg-surface-muted">
        <PostImg
          image={post.cover}
          width={1400}
          alt=""
          eager
          className="h-full w-full object-cover transition-transform duration-300 ease-snappy group-hover:scale-[1.02]"
        />
      </div>
      <div>
        <p className={eyebrow}>
          Latest <span aria-hidden="true">·</span> {POST_CATEGORY_LABELS[post.category]}
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-balance text-ink transition-colors duration-200 group-hover:text-primary-600 sm:text-4xl lg:text-[2.75rem]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-3 text-lg leading-8 text-ink-body">{post.excerpt}</p>
        <p className="mt-5 text-sm text-muted">
          <Meta post={post} />
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
          Read the post
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

const chip =
  "inline-flex h-8 cursor-pointer items-center border border-line bg-surface px-3 text-xs font-semibold text-ink-body transition-colors duration-200 hover:border-ink/30 hover:text-ink";

/** Share links: plain links to each service's own share page, so no third
    party script ever loads on the site. */
export function ShareLinks({ url, title, centered = false }: { url: string; title: string; centered?: boolean }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const services = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];
  return (
    <div className={`flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}>
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Share</span>
      <CopyLinkButton url={url} className={chip} />
      {services.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={chip}>
          {s.label}
        </a>
      ))}
      <a href={`mailto:?subject=${t}&body=${u}`} className={chip}>
        Email
      </a>
    </div>
  );
}

export function PostHeader({
  post,
  url,
  page,
  pages,
}: {
  post: Post;
  url: string;
  page: number;
  pages: number;
}) {
  const category = POST_CATEGORY_LABELS[post.category];
  return (
    <header>
      <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-10 text-center sm:px-8 sm:pb-12 sm:pt-14">
        <div className="animate-fade-up flex justify-center">
          <Breadcrumbs
            tone="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: category, href: `/blog?category=${post.category}` },
            ]}
          />
        </div>
        <p className={`animate-fade-up mt-8 [animation-delay:60ms] ${eyebrow}`}>
          <Link href={`/blog?category=${post.category}`} className="hover:text-primary-600">
            {category}
          </Link>
          <span aria-hidden="true" className="text-muted"> · </span>
          <span className="text-muted">
            <Meta post={post} />
          </span>
        </p>
        <h1 className="animate-fade-up mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-ink [animation-delay:100ms] sm:text-5xl lg:text-[3.5rem]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-8 text-balance text-ink-body [animation-delay:140ms] sm:text-xl">
            {post.excerpt}
          </p>
        )}
        <p className="animate-fade-up mt-4 text-xs text-muted [animation-delay:160ms]">
          By Ireland Fintax
          {wasUpdated(post) && (
            <>
              {" "}
              <span aria-hidden="true">·</span> Updated{" "}
              <time dateTime={post.updatedAt.toISOString()}>{formatPostDate(post.updatedAt)}</time>
            </>
          )}
          {pages > 1 && (
            <>
              {" "}
              <span aria-hidden="true">·</span> Page {page} of {pages}
            </>
          )}
        </p>
        <div className="animate-fade-up mt-7 [animation-delay:200ms]">
          <ShareLinks url={url} title={post.title} centered />
        </div>
      </div>
    </header>
  );
}

/** The cover, wide under the header. */
export function PostCover({ image }: { image: PostImage }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="aspect-[16/9] overflow-hidden bg-surface-muted sm:aspect-[2/1]">
        <PostImg image={image} width={1920} alt="" eager className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function tocHref(entry: TocEntry, slug: string, page: number) {
  if (entry.page === page) return `#${entry.anchor}`;
  return `/blog/${slug}${entry.page > 1 ? `?page=${entry.page}` : ""}#${entry.anchor}`;
}

/** "On this page": a sticky list beside the text on wide screens, a
    collapsible box above it everywhere else. */
export function TableOfContents({
  entries,
  slug,
  page,
  variant,
}: {
  entries: TocEntry[];
  slug: string;
  page: number;
  variant: "side" | "inline";
}) {
  const multiPage = entries.some((e) => e.page !== entries[0]?.page);
  const list = (
    <ol className="mt-3 space-y-0.5 border-l border-line">
      {entries.map((e) => (
        <li key={e.anchor}>
          <a
            href={tocHref(e, slug, page)}
            className={`-ml-px block border-l border-transparent py-1 leading-snug text-muted transition-colors duration-200 hover:border-primary-500 hover:text-ink ${
              e.level === 3 ? "pl-7" : "pl-4"
            }`}
          >
            {e.text}
            {multiPage && e.page !== page && (
              <span className="ml-1.5 text-[11px] text-muted/80">p. {e.page}</span>
            )}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "side") {
    return (
      <nav aria-label="On this page" className="text-[13px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">On this page</p>
        {list}
      </nav>
    );
  }
  return (
    <details className="group mb-2 border border-line bg-surface-muted/50 px-5 py-4 text-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
        On this page
        <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <nav aria-label="On this page">{list}</nav>
    </details>
  );
}

/** Previous / numbered / next links for a post split by page breaks. */
export function PageNav({ slug, page, pages }: { slug: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (p: number) => (p > 1 ? `/blog/${slug}?page=${p}` : `/blog/${slug}`);
  return (
    <nav aria-label="Post pages" className="mt-14 border-t border-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {page > 1 ? (
          <Link href={href(page - 1)} className="text-sm font-semibold text-primary-600 hover:text-primary-500">
            <span aria-hidden="true">←</span> Previous page
          </Link>
        ) : (
          <span />
        )}
        <ol className="flex items-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <li key={p}>
              {p === page ? (
                <span
                  aria-current="page"
                  className="grid h-9 w-9 place-items-center bg-navy-900 text-sm font-semibold text-white tabular-nums"
                >
                  {p}
                </span>
              ) : (
                <Link
                  href={href(p)}
                  className="grid h-9 w-9 place-items-center border border-line text-sm font-semibold text-ink-body tabular-nums transition-colors duration-200 hover:border-ink/30 hover:text-ink"
                >
                  {p}
                </Link>
              )}
            </li>
          ))}
        </ol>
        {page < pages ? (
          <Link
            href={href(page + 1)}
            className="inline-flex h-10 items-center gap-2 bg-primary-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600"
          >
            Next page <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
