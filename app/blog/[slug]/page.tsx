import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Container, SectionHeading } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { PostBlocks } from "../../components/post-body";
import {
  PageNav,
  PostCard,
  PostCover,
  PostHeader,
  ShareLinks,
  TableOfContents,
} from "../../components/blog";
import { getPublishedPost, getRelatedPosts, type Post } from "../../lib/posts";
import { headingAnchors, splitPages, tableOfContents } from "../../lib/post-blocks";
import { imageUrl, POST_DISCLAIMER } from "../../lib/post-types";
import { site } from "../../lib/content";
import { DEFAULT_LOCALE } from "../../lib/i18n";
import { getLocale } from "../../lib/messages";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ page?: string | string[] }>;

const sourceDate = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Where a news-agent post came from. Rendered from the post's stored origin,
 * like POST_DISCLAIMER, so no edit can drop it: the links and each licence's
 * attribution are what the CC BY terms ask for, and the last line says plainly
 * that AI drafted it and a person checked it.
 */
function PostSources({ sources }: { sources: NonNullable<Post["sources"]> }) {
  const attributions = [...new Set(sources.map((s) => s.attribution).filter(Boolean))];
  return (
    <section aria-labelledby="post-sources" className="mb-10">
      <h2 id="post-sources" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        Sources
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
      <p className="mt-3 text-xs leading-5 text-muted">
        Drafted with the help of AI from the official sources above, then checked and edited by a person before
        publishing.
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
  const [related, locale] = await Promise.all([getRelatedPosts(post), getLocale()]);

  /* lang="en": the post is English even under /ga, /es or /pt, where the
     header, footer and call to action are not (CHROME_ONLY_PATHS). */
  return (
    <>
      <div lang="en">
        <article>
          <PostHeader post={post} url={url} page={page} pages={pages.length} />
          {page === 1 && <PostCover image={post.cover} />}

          <div className="relative pb-6 pt-12 sm:pt-16">
            {/* Wide screens: the contents sit in the left margin, beside the
                reading column, and stay in view while reading. */}
            {showToc && (
              <aside className="absolute inset-y-0 left-0 hidden w-[calc((100%-56rem)/2)] xl:block">
                <div className="sticky top-28 ml-auto max-w-[14rem] pl-6 pr-8">
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
                {post.sources && post.sources.length > 0 && <PostSources sources={post.sources} />}
                <ShareLinks url={url} title={post.title} />
                <p className="mt-8 text-sm leading-6 text-muted">{POST_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-10 border-t border-line bg-surface-muted">
            <Container className="py-16 sm:py-20">
              <SectionHeading eyebrow="Keep reading" title="More from the blog" />
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
