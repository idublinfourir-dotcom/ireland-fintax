import type { Metadata } from "next";
import Link from "../components/locale-link";
import { notFound } from "next/navigation";
import { Breadcrumbs, Container } from "../components/ui";
import { ContactCta } from "../components/sections";
import { ToolTabs } from "../components/tool-tabs";
import { FeaturedPost, PostCard } from "../components/blog";
import { listPublishedPosts } from "../lib/posts";
import { isPostCategory } from "../lib/post-types";
import { getLocale, getT } from "../lib/messages";
import { blogMessages } from "../lib/messages/blog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT(blogMessages);
  return { ...t.meta, alternates: { canonical: "/blog" } };
}

const PER_PAGE = 12;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
}) {
  const [params, t, locale] = await Promise.all([searchParams, getT(blogMessages), getLocale()]);
  const requested = first(params.category);
  const category = isPostCategory(requested) ? requested : null;
  const pageParam = Number(first(params.page));
  const page = Number.isSafeInteger(pageParam) && pageParam > 1 ? pageParam : 1;

  const { posts, total, categories } = await listPublishedPosts({
    category,
    page,
    perPage: PER_PAGE,
  });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  // A page past the end is a dead link, not an empty blog.
  if (page > pages && total > 0) notFound();

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  /* Only categories with something in them get a tab, like the Founders Hub.
     One category alone needs no switcher. */
  const tabs = [
    { href: "/blog", label: t.all },
    ...categories.map((c) => ({ href: `/blog?category=${c}`, label: t.categories[c] })),
  ];
  const currentTab = category ? `/blog?category=${category}` : "/blog";

  // The newest post leads, large, on the unfiltered first page only.
  const featured = !category && page === 1 ? posts[0] : undefined;
  const rest = featured ? posts.slice(1) : posts;

  /* The labels are in the page's language; the posts are English
     (CHROME_ONLY_PATHS), and their cards mark their own words lang="en". */
  return (
    <>
      <div>
        <section className="border-b border-line">
          <Container className="pb-4 pt-12 sm:pt-16">
            <div className="animate-fade-up">
              <Breadcrumbs tone="light" items={[{ label: t.home, href: "/" }, { label: t.insights }]} />
            </div>
            <h1 className="animate-fade-up mt-6 font-display text-5xl font-bold leading-[0.98] tracking-[-0.025em] text-ink [animation-delay:80ms] sm:text-6xl lg:text-7xl">
              {category ? t.categories[category] : t.insights}
            </h1>
            <p className="animate-fade-up mt-5 max-w-2xl text-lg leading-8 text-ink-body [animation-delay:150ms] sm:text-xl">
              {t.lede}
              {locale !== "en" && ` ${t.inEnglish}`}
            </p>
            <div className="mt-10">
              {categories.length > 1 && <ToolTabs heading={t.topics} tools={tabs} current={currentTab} />}
            </div>
          </Container>
        </section>

        <Container className="py-14 sm:py-16">
          {posts.length === 0 ? (
            <div className="border border-dashed border-line px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                {category ? t.emptyTopic : t.emptyBlog}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {category ? (
                  <>
                    {t.emptyTopicBody}{" "}
                    <Link href="/blog" className="font-semibold text-primary-600 hover:text-primary-500">
                      {t.seeAll}
                    </Link>
                  </>
                ) : (
                  t.emptyBlogBody
                )}
              </p>
            </div>
          ) : (
            <>
              {featured && <FeaturedPost post={featured} />}
              {rest.length > 0 && (
                <>
                  {featured && (
                    <h2 className="mt-16 border-t border-line pt-10 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {t.morePosts}
                    </h2>
                  )}
                  <ul className={`grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 ${featured ? "mt-8" : ""}`}>
                    {rest.map((post) => (
                      <li key={post.id}>
                        <PostCard post={post} headingLevel={featured ? 3 : 2} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {pages > 1 && (
            <nav
              aria-label={t.pagesNav}
              className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6 text-sm"
            >
              {page > 1 ? (
                <Link href={hrefFor(page - 1)} className="font-semibold text-primary-600 hover:text-primary-500">
                  <span aria-hidden="true" className="inline-block rtl:-scale-x-100">←</span> {t.newer}
                </Link>
              ) : (
                <span />
              )}
              <span className="tabular-nums text-muted">
                {t.pageOf.replace("{page}", String(page)).replace("{pages}", String(pages))}
              </span>
              {page < pages ? (
                <Link href={hrefFor(page + 1)} className="font-semibold text-primary-600 hover:text-primary-500">
                  {t.older} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </Container>
      </div>

      <ContactCta />
    </>
  );
}
