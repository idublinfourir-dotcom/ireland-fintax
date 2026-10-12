import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../lib/auth/guards";
import { toObjectId } from "../../../lib/collections";
import { getPostById, hasBeenLive } from "../../../lib/posts";
import { getAffectedCalculator } from "../../../lib/news-sources";
import { PageHeader } from "../../../components/dashboard-ui";
import { PostEditor, type AiReview, type EditorPost } from "../post-editor";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

/* The confirmation a brand-new post arrives with after its first save. */
const CREATED_NOTICE: Record<string, string> = {
  draft: "Draft saved.",
  published: "Published. The post is live now.",
};

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);

  const objectId = toObjectId(id);
  if (!objectId) notFound();
  const doc = await getPostById(objectId);
  if (!doc) notFound();

  const now = new Date();
  const post: EditorPost = {
    id: doc._id.toHexString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    category: doc.category,
    cover: doc.cover,
    blocks: doc.blocks ?? [],
    status: doc.status,
    live: doc.status === "published" && hasBeenLive(doc, now),
    slugLocked: hasBeenLive(doc, now),
  };

  const origin = doc.origin;
  const review: AiReview | null =
    origin?.kind === "ai"
      ? {
          sources: origin.sources.map((s) => ({
            url: s.url,
            title: s.title,
            publisher: s.publisher,
            publishedAt: s.publishedAt ? s.publishedAt.toISOString() : null,
          })),
          flags: origin.flags,
          affects: origin.affects.flatMap((key) => {
            const calc = getAffectedCalculator(key);
            return calc ? [{ label: calc.label, adminHref: calc.adminHref }] : [];
          }),
          model: origin.model,
          format: origin.format,
          generatedAt: origin.generatedAt.toISOString(),
          reviewedBy: origin.reviewedBy,
          reviewedAt: origin.reviewedAt ? origin.reviewedAt.toISOString() : null,
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Blog"
        title="Edit post"
        actions={
          <Link
            href="/admin/posts"
            className="text-sm font-semibold text-primary-600 transition-colors duration-200 hover:text-primary-500"
          >
            ← All posts
          </Link>
        }
      />
      {/* Keyed by id so moving between posts never carries one post's
          unsaved state into another. */}
      <PostEditor
        key={post.id}
        post={post}
        review={review}
        notice={saved ? CREATED_NOTICE[saved] : undefined}
      />
    </div>
  );
}
