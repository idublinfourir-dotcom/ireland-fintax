import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, Container } from "../components/ui";
import { ContactCta } from "../components/sections";
import { ToolTabs } from "../components/calculator-tabs";
import { FeaturedPost, PostCard } from "../components/blog";
import { listPublishedPosts } from "../lib/posts";
import { isPostCategory, POST_CATEGORY_LABELS } from "../lib/post-types";

export const metadata: Metadata = {
  title: "Blog: Irish tax and personal finance, explained",
  description:
    "Guides, explainers and news on Irish tax and personal finance in plain English: income tax, CGT, VAT, mortgages, investing and starting a company.",
  alternates: { canonical: "/blog" },
};

const PER_PAGE = 12;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
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
    { href: "/blog", label: "All" },
    ...categories.map((c) => ({ href: `/blog?category=${c}`, label: POST_CATEGORY_LABELS[c] })),
  ];
  const currentTab = category ? `/blog?category=${category}` : "/blog";

  // The newest post leads, large, on the unfiltered first page only.
  const featured = !category && page === 1 ? posts[0] : undefined;
  const rest = featured ? posts.slice(1) : posts;

  return (
    <>
      <section className="border-b border-line">
        <Container className="pb-4 pt-12 sm:pt-16">
          <div className="animate-fade-up">
            <Breadcrumbs tone="light" items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
          </div>
          <h1 className="animate-fade-up mt-6 font-display text-5xl font-bold leading-[0.98] tracking-[-0.025em] text-ink [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            {category ? POST_CATEGORY_LABELS[category] : "Blog"}
          </h1>
          <p className="animate-fade-up mt-5 max-w-2xl text-lg leading-8 text-ink-body [animation-delay:150ms] sm:text-xl">
            Guides, explainers and news on Irish tax and personal finance, in plain English.
          </p>
          <div className="mt-10">
            {categories.length > 1 && <ToolTabs heading="Topics" tools={tabs} current={currentTab} />}
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-16">
        {posts.length === 0 ? (
          <div className="border border-dashed border-line px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              {category ? "Nothing in this topic yet" : "No posts yet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {category ? (
                <>
                  New posts are on the way.{" "}
                  <Link href="/blog" className="font-semibold text-primary-600 hover:text-primary-500">
                    See every post
                  </Link>
                </>
              ) : (
                "The first guides are on the way. In the meantime, the calculators are ready to use."
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
                    More posts
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
            aria-label="Pages"
            className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6 text-sm"
          >
            {page > 1 ? (
              <Link href={hrefFor(page - 1)} className="font-semibold text-primary-600 hover:text-primary-500">
                <span aria-hidden="true">←</span> Newer posts
              </Link>
            ) : (
              <span />
            )}
            <span className="tabular-nums text-muted">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <Link href={hrefFor(page + 1)} className="font-semibold text-primary-600 hover:text-primary-500">
                Older posts <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Container>

      <ContactCta />
    </>
  );
}
