import type { Metadata } from "next";
import { REVIEWER } from "../../lib/reviewer";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Container, SectionHeading } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { JsonLd } from "../../components/json-ld";
import { PostBlocks } from "../../components/post-body";
import {
  EN,
  inLocale,
  PageNav,
  PostCard,
  PostCover,
  PostHeader,
  ShareLinks,
  TableOfContents,
} from "../../components/blog";
import { getPublishedPost, getRelatedPosts, type Post } from "../../lib/posts";
import { headingAnchors, splitPages, tableOfContents } from "../../lib/post-blocks";
import { imageUrl } from "../../lib/post-types";
import { site } from "../../lib/content";
import { DEFAULT_LOCALE, type Locale } from "../../lib/i18n";
import { getLocale, getT } from "../../lib/messages";
import { blogMessages, type BlogMessages } from "../../lib/messages/blog";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ page?: string | string[] }>;

const sourceDate = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Where a news-agent post came from. Rendered from the post's stored origin,
 * like the disclaimer, so no edit can drop it: the links and each licence's
 * attribution are what the CC BY terms ask for, and the last line says plainly
 * that AI drafted it and a person checked it.
 */
function PostSources({ sources, t, locale }: { sources: NonNullable<Post["sources"]>; t: BlogMessages; locale: Locale }) {
  const attributions = [...new Set(sources.map((s) => s.attribution).filter(Boolean))];
  return (
    <section aria-labelledby="post-sources" className="mb-10">
      <h2 {...inLocale(locale)} id="post-sources" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {t.sources}
      </h2>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-500"
            >
              {s.title}
            </a>
            <span className="text-muted">
              {" "}
              ({s.publisher}
              {s.publishedAt && `, ${sourceDate.format(s.publishedAt)}`})
            </span>
          </li>
        ))}
      </ul>
      {attributions.map((a) => (
        <p key={a} className="mt-3 text-xs leading-5 text-muted">
          {a}
        </p>
      ))}
      <p {...inLocale(locale)} className="mt-3 text-xs leading-5 text-muted">
        {t.aiNote}
      </p>
    </section>
  );
}

/* generateMetadata and the page both need the post; cache() makes that one
   database read per request instead of two. */
const loadPost = cache(getPublishedPost);

/** The page number asked for, or 1. */
async function pageFrom(searchParams: Search) {
  const raw = (await searchParams).page;
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isSafeInteger(n) && n > 1 ? n : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const post = await loadPost((await params).slug);
  if (!post) return {};
  const page = await pageFrom(searchParams);
  const path = `/blog/${post.slug}${page > 1 ? `?page=${page}` : ""}`;
  // An uploaded cover is a site path; Open Graph wants an absolute address.
  const cover = imageUrl(post.cover, 1200);
  return {
    title: page > 1 ? `${post.title} (page ${page})` : post.title,
    description: post.excerpt,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: path,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [cover.startsWith("/") ? `${site.url}${cover}` : cover],
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const post = await loadPost((await params).slug);
  // Drafts, unpublished posts and unknown slugs all end here alike.
  if (!post) notFound();

  const pages = splitPages(post.blocks);
  const page = await pageFrom(searchParams);
  if (page > pages.length) notFound();

  const anchors = headingAnchors(post.blocks);
  const toc = tableOfContents(post.blocks);
  const showToc = toc.length >= 2;
  const url = `${site.url}/blog/${post.slug}`;
  const [related, locale, t] = await Promise.all([getRelatedPosts(post), getLocale(), getT(blogMessages)]);
  const ui = inLocale(locale);

  /* The post is English in every language (CHROME_ONLY_PATHS): its column is
     lang="en" dir="ltr", and the labels inside it carry the page's language
     back. Header, cards and the call to action are in the page's language. */
  // The article for search engines; the author is the site, which names no firm.
  const coverUrl = imageUrl(post.cover, 1200);
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: coverUrl.startsWith("/") ? `${site.url}${coverUrl}` : coverUrl,
    inLanguage: "en",
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
  };
  return (
    <>
      <JsonLd data={article} />
      <div>
        <article>
          <PostHeader post={post} url={url} page={page} pages={pages.length} />
          {page === 1 && <PostCover image={post.cover} />}

          <div {...EN} className="relative pb-6 pt-12 sm:pt-16">
            {/* Wide screens: the contents sit in the left margin, beside the
                reading column, and stay in view while reading. */}
            {showToc && (
              <aside className="absolute inset-y-0 inset-s-0 hidden w-[calc((100%-56rem)/2)] xl:block">
                <div className="sticky top-28 ms-auto max-w-[14rem] ps-6 pe-8">
                  <TableOfContents entries={toc} slug={post.slug} page={page} variant="side" />
                </div>
              </aside>
            )}

            <div className="post-grid [&>:first-child]:mt-0">
              {showToc && (
                <div className="xl:hidden">
                  <TableOfContents entries={toc} slug={post.slug} page={page} variant="inline" />
                </div>
              )}

              <PostBlocks blocks={pages[page - 1]} anchors={anchors} />

              <PageNav slug={post.slug} page={page} pages={pages.length} />

              <div className="mt-14 border-t border-line pt-8">
                {post.sources && post.sources.length > 0 && <PostSources sources={post.sources} t={t} locale={locale} />}
                <ShareLinks url={url} title={post.title} />
                <p {...ui} className="mt-8 text-sm leading-6 text-muted">{t.disclaimer}</p>
                <p {...ui} className="mt-2 text-sm leading-6 text-muted">{t.reviewed.replace("{reviewer}", REVIEWER)}</p>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-10 border-t border-line bg-surface-muted">
            <Container className="py-16 sm:py-20">
              <SectionHeading eyebrow={t.keepReading} title={t.moreFromBlog} />
              <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} headingLevel={3} />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}
      </div>

      {/* This heading is English only; other languages keep the shared one. */}
      <ContactCta>{locale === DEFAULT_LOCALE ? "Still have a question?" : undefined}</ContactCta>
    </>
  );
}
