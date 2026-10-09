import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../../lib/auth/guards";
import { PageHeader } from "../../../components/dashboard-ui";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Blog"
        title="New post"
        lede="Nothing goes on the site until you press Publish. Save a draft any time."
        actions={
          <Link
            href="/admin/posts"
            className="text-sm font-semibold text-primary-600 transition-colors duration-200 hover:text-primary-500"
          >
            ← All posts
          </Link>
        }
      />
      <PostEditor post={null} />
    </div>
  );
}
