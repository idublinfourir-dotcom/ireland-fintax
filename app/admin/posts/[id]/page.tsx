import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../lib/auth/guards";
import { toObjectId } from "../../../lib/collections";
import { getPostById, hasBeenLive } from "../../../lib/posts";
import { PageHeader } from "../../../components/dashboard-ui";
import { PostEditor, type EditorPost } from "../post-editor";

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
        notice={saved ? CREATED_NOTICE[saved] : undefined}
      />
    </div>
  );
}
