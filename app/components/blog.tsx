import Link from "./locale-link";
import { Breadcrumbs, fill } from "./ui";
import { CopyLinkButton } from "./copy-link-button";
import { PostImg } from "./post-body";
import type { PostImage } from "../lib/post-types";
import type { TocEntry } from "../lib/post-blocks";
import type { Post, PostSummary } from "../lib/posts";
import { localDate, RTL_LOCALES, type Locale } from "../lib/i18n";
import { getLocale, getT } from "../lib/messages";
import { blogMessages } from "../lib/messages/blog";

/* Blog building blocks: cards, the post header and cover, sharing, the table
   of contents and page navigation. Server components, apart from the copy
   button. Labels follow the page's language; a post's own words (title,
   excerpt, headings) are English everywhere and say so with EN. */

/** On a post's own English words, inside a page in another language. */
export const EN = { lang: "en", dir: "ltr" } as const;

/** On a label in the page's language, inside a post's English column. */
export const inLocale = (locale: Locale) =>
  ({ lang: locale, dir: RTL_LOCALES.includes(locale) ? "rtl" : "ltr" }) as const;

/* Dates in Irish time: the server runs in UTC, and a post published just
   after midnight in summer would otherwise show the day before. */
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Dublin",
});
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" });

export const formatPostDate = (d: Date, locale: Locale = "en") => localDate(locale, dateFmt.format(d));

/** Edited on a later day than it was published? Then the post says so. */
export function wasUpdated(post: Pick<PostSummary, "publishedAt" | "updatedAt">) {
  return dayKey.format(post.updatedAt) > dayKey.format(post.publishedAt);
}

async function Meta({ post }: { post: PostSummary }) {
  const [t, locale] = await Promise.all([getT(blogMessages), getLocale()]);
  return (
    <>
      <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt, locale)}</time>
      <span aria-hidden="true"> · </span>
      {t.minRead.replace("{n}", String(post.readingMinutes))}
    </>
  );
}

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-500";

export async function PostCard({ post, headingLevel = 2 }: { post: PostSummary; headingLevel?: 2 | 3 }) {
  const t = await getT(blogMessages);
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
      <p className={`mt-5 ${eyebrow}`}>{t.categories[post.category]}</p>
      <Heading {...EN} className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-balance text-ink transition-colors duration-200 group-hover:text-primary-600">
        {post.title}
      </Heading>
      <p {...EN} className="mt-2 line-clamp-2 text-[15px] leading-6 text-muted">{post.excerpt}</p>
      <p className="mt-3 text-xs text-muted">
        <Meta post={post} />
      </p>
    </Link>
  );
}

/** The newest post, large, at the top of the blog. */
export async function FeaturedPost({ post }: { post: PostSummary }) {
  const t = await getT(blogMessages);
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
          {t.latest} <span aria-hidden="true">·</span> {t.categories[post.category]}
        </p>
        <h2 {...EN} className="mt-4 font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-balance text-ink transition-colors duration-200 group-hover:text-primary-600 sm:text-4xl lg:text-[2.75rem]">
          {post.title}
        </h2>
        <p {...EN} className="mt-4 line-clamp-3 text-lg leading-8 text-ink-body">{post.excerpt}</p>
        <p className="mt-5 text-sm text-muted">
          <Meta post={post} />
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
          {t.readPost}
          <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
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
export async function ShareLinks({ url, title, centered = false }: { url: string; title: string; centered?: boolean }) {
  const [t, locale] = await Promise.all([getT(blogMessages), getLocale()]);
  const u = encodeURIComponent(url);
  const services = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];
  return (
    <div {...inLocale(locale)} className={`flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}>
      <span className="me-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.share}</span>
      <CopyLinkButton url={url} className={chip} labels={{ copy: t.copyLink, copied: t.copied }} />
      {services.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={chip}>
          {s.label}
        </a>
      ))}
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${u}`} className={chip}>
        {t.email}
      </a>
    </div>
  );
}

export async function PostHeader({
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
  const [t, locale] = await Promise.all([getT(blogMessages), getLocale()]);
  const category = t.categories[post.category];
  return (
    <header>
      <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-10 text-center sm:px-8 sm:pb-12 sm:pt-14">
        <div className="animate-fade-up flex justify-center">
          <Breadcrumbs
            tone="light"
            items={[
              { label: t.home, href: "/" },
              { label: t.insights, href: "/blog" },
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
        <h1 {...EN} className="animate-fade-up mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-ink [animation-delay:100ms] sm:text-5xl lg:text-[3.5rem]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p {...EN} className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-8 text-balance text-ink-body [animation-delay:140ms] sm:text-xl">
            {post.excerpt}
          </p>
        )}
        <p className="animate-fade-up mt-4 text-xs text-muted [animation-delay:160ms]">
          {t.byline}
          {wasUpdated(post) && (
            <>
              {" "}
              <span aria-hidden="true">·</span>{" "}
              {fill(t.updated, {
                date: <time dateTime={post.updatedAt.toISOString()}>{formatPostDate(post.updatedAt, locale)}</time>,
              })}
            </>
          )}
          {pages > 1 && (
            <>
              {" "}
              <span aria-hidden="true">·</span>{" "}
              {t.pageOf.replace("{page}", String(page)).replace("{pages}", String(pages))}
            </>
          )}
          {locale !== "en" && (
            <>
              {" "}
              <span aria-hidden="true">·</span> {t.postInEnglish}
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
export async function TableOfContents({
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
  const [t, locale] = await Promise.all([getT(blogMessages), getLocale()]);
  const ui = inLocale(locale);
  const multiPage = entries.some((e) => e.page !== entries[0]?.page);
  const list = (
    <ol className="mt-3 space-y-0.5 border-s border-line">
      {entries.map((e) => (
        <li key={e.anchor}>
          <a
            href={tocHref(e, slug, page)}
            className={`-ms-px block border-s border-transparent py-1 leading-snug text-muted transition-colors duration-200 hover:border-primary-500 hover:text-ink ${
              e.level === 3 ? "ps-7" : "ps-4"
            }`}
          >
            {e.text}
            {multiPage && e.page !== page && (
              <span {...ui} className="ms-1.5 text-[11px] text-muted">{t.pageShort.replace("{n}", String(e.page))}</span>
            )}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "side") {
    return (
      <nav aria-label={t.onThisPage} className="text-[13px]">
        <p {...ui} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">{t.onThisPage}</p>
        {list}
      </nav>
    );
  }
  return (
    <details className="group mb-2 border border-line bg-surface-muted/50 px-5 py-4 text-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
        <span {...ui}>{t.onThisPage}</span>
        <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <nav aria-label={t.onThisPage}>{list}</nav>
    </details>
  );
}

/** Previous / numbered / next links for a post split by page breaks. */
export async function PageNav({ slug, page, pages }: { slug: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  const [t, locale] = await Promise.all([getT(blogMessages), getLocale()]);
  const href = (p: number) => (p > 1 ? `/blog/${slug}?page=${p}` : `/blog/${slug}`);
  return (
    <nav {...inLocale(locale)} aria-label={t.postPages} className="mt-14 border-t border-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {page > 1 ? (
          <Link href={href(page - 1)} className="text-sm font-semibold text-primary-600 hover:text-primary-500">
            <span aria-hidden="true" className="inline-block rtl:-scale-x-100">←</span> {t.previousPage}
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
            {t.nextPage} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
