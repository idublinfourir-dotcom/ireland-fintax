import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../lib/auth/guards";
import { listAllPosts, type AdminPostRow } from "../../lib/posts";
import { POST_CATEGORY_LABELS } from "../../lib/post-types";
import { Icon } from "../../components/dashboard-icons";
import { PageHeader, Panel, timeAgo } from "../../components/dashboard-ui";

export const metadata: Metadata = {
  title: "Blog posts",
  robots: { index: false, follow: false },
};

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  await requireAdmin();
  const { deleted } = await searchParams;

  let posts: AdminPostRow[] = [];
  let loadError = false;
  try {
    posts = await listAllPosts();
  } catch (err) {
    console.error("[blog] admin list failed:", err);
    loadError = true;
  }
  const liveCount = posts.filter((p) => p.live).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Blog"
        title="Posts"
        lede={
          <>
            Guides and news for the{" "}
            <Link
              href="/blog"
              className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-500"
            >
              public blog
            </Link>
            . Drafts are only visible here; a post appears on the site when you publish it.
          </>
        }
        actions={
          <Link
            href="/admin/posts/new"
            className="inline-flex h-10 items-center gap-2 rounded-none bg-primary-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600"
          >
            <Icon name="plus" className="h-4 w-4" />
            New post
          </Link>
        }
      />

      {deleted && (
        <p
          role="status"
          className="mb-6 border-l-2 border-primary-500 bg-white px-4 py-3 text-sm font-medium text-ink"
        >
          Post deleted.
        </p>
      )}

      {loadError ? (
        <p className="rounded-none border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
          Could not read the posts collection. Check the database connection and try again.
        </p>
      ) : posts.length === 0 ? (
        <div className="rounded-none border border-dashed border-line bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-none bg-primary-50 text-primary-600">
            <Icon name="newspaper" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-[15px] font-medium text-ink">No posts yet</p>
          <p className="mt-1 text-sm text-muted">
            Write the first one: a guide, an explainer or a piece of news.
          </p>
          <Link
            href="/admin/posts/new"
            className="mt-5 inline-flex h-9 items-center rounded-none border border-primary-500 px-4 text-xs font-semibold text-primary-600 transition-colors duration-200 hover:bg-primary-500 hover:text-white"
          >
            Write a post
          </Link>
        </div>
      ) : (
        <Panel className="overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <h3 className="font-display text-base font-semibold text-ink">
              All posts ({posts.length})
            </h3>
            <span className="rounded-none bg-primary-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary-600">
              {liveCount} live
            </span>
          </div>
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="text-sm font-semibold text-ink transition-colors duration-200 hover:text-primary-600"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {POST_CATEGORY_LABELS[p.category]} · edited {timeAgo(p.updatedAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-none px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    p.live ? "bg-primary-500 text-white" : "bg-surface-muted text-muted"
                  }`}
                >
                  {p.live ? "Live" : "Draft"}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {p.live && (
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="inline-flex h-8 items-center gap-1 rounded-none px-2 text-xs font-semibold text-muted transition-colors duration-200 hover:text-ink"
                    >
                      View
                      <Icon name="arrowUpRight" className="h-3 w-3" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="inline-flex h-8 items-center rounded-none border border-line px-3 text-xs font-semibold text-ink-body transition-colors duration-200 hover:border-ink/30 hover:text-ink"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
