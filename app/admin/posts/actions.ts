"use server";

/* Blog post admin actions: save (as a draft, publishing, or unpublishing) and
   delete. Every action re-checks requireAdmin and is logged to the change
   audit with area "posts". */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/auth/guards";
import { toObjectId, type PostDoc } from "../../lib/collections";
import { recordAudit } from "../../lib/rate-audit";
import {
  deletePost,
  getPostById,
  hasBeenLive,
  insertPost,
  isDuplicateKeyError,
  updatePost,
} from "../../lib/posts";
import { getMediaSizes } from "../../lib/media";
import { readingMinutes, uploadIds, withUploadSizes } from "../../lib/post-blocks";
import { validatePostInput, type PostErrors } from "../../lib/post-validation";
import type { PostStatus } from "../../lib/post-types";

/** What is stored after a save, so the editor can reflect it. */
export interface SavedPost {
  id: string;
  status: PostStatus;
  slug: string;
  live: boolean;
  slugLocked: boolean;
}

export interface PostFormState {
  status: "idle" | "saved" | "error";
  message?: string;
  errors?: PostErrors;
  saved?: SavedPost;
  /** Set when the save created the post, so the editor moves to its URL. */
  created?: boolean;
}

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

function revalidateBlog(slugs: string[]) {
  revalidatePath("/blog");
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/posts");
}

const SAVED_MESSAGES = {
  draft: "Draft saved.",
  published: "Changes saved. They are live now.",
  publish: "Published. The post is live now.",
  unpublish: "Unpublished. The post is a draft again and its page is offline.",
} as const;

export async function savePostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const user = await requireAdmin();

  const intent = field(formData, "intent");
  const idRaw = field(formData, "id");
  const id = idRaw ? toObjectId(idRaw) : null;
  if (idRaw && !id) {
    return { status: "error", message: "Could not save: bad request." };
  }

  let existing: PostDoc | null = null;
  if (id) {
    try {
      existing = await getPostById(id);
    } catch (err) {
      console.error("[blog] post read failed:", err);
      return { status: "error", message: "Could not reach the database. Try again." };
    }
    if (!existing) {
      return {
        status: "error",
        message: "This post no longer exists. It may have been deleted.",
      };
    }
  }

  const status: PostStatus =
    intent === "publish"
      ? "published"
      : intent === "unpublish"
        ? "draft"
        : (existing?.status ?? "draft");

  const result = validatePostInput(
    {
      title: field(formData, "title"),
      slug: field(formData, "slug"),
      excerpt: field(formData, "excerpt"),
      category: field(formData, "category"),
      cover: field(formData, "cover"),
      blocks: field(formData, "blocks"),
    },
    { publishing: status === "published" },
  );
  if (!result.ok) {
    return {
      status: "error",
      message:
        status === "published"
          ? "Fix the highlighted fields before publishing."
          : "Fix the highlighted fields to save.",
      errors: result.errors,
    };
  }

  const post = result.value;

  /* Every uploaded picture must still exist, and its size is taken from the
     stored copy rather than from what the browser sent. */
  const ids = uploadIds(post.blocks);
  if (post.cover.kind === "upload") ids.push(post.cover.id);
  let sizes: Map<string, { width: number; height: number }>;
  try {
    sizes = await getMediaSizes(ids);
  } catch (err) {
    console.error("[blog] picture lookup failed:", err);
    return { status: "error", message: "Could not reach the database. Try again." };
  }
  const missing = ids.filter((id) => !sizes.has(id));
  if (missing.length > 0) {
    const coverMissing = post.cover.kind === "upload" && missing.includes(post.cover.id);
    return {
      status: "error",
      message: "Fix the highlighted fields to save.",
      errors: coverMissing
        ? { cover: "That picture is no longer stored. Upload it again." }
        : { blocks: "A picture in the post is no longer stored. Upload it again." },
    };
  }
  const blocks = withUploadSizes(post.blocks, sizes);
  const cover =
    post.cover.kind === "upload" ? { ...post.cover, ...sizes.get(post.cover.id)! } : post.cover;

  const now = new Date();
  // A URL that has been live keeps its slug: someone may have linked to it.
  const slug = existing && hasBeenLive(existing, now) ? existing.slug : post.slug;
  // Stamped the first time the post goes live, then kept, so unpublishing
  // and republishing does not re-date it.
  const publishedAt =
    existing?.publishedAt ?? (status === "published" ? now : null);

  const doc = {
    slug,
    title: post.title,
    excerpt: post.excerpt,
    blocks,
    category: post.category,
    cover,
    readingMinutes: readingMinutes(blocks),
    status,
    publishedAt,
    updatedAt: now,
  };

  let savedId: string;
  try {
    if (existing) {
      if (!(await updatePost(existing._id, doc))) {
        return {
          status: "error",
          message: "This post no longer exists. It may have been deleted.",
        };
      }
      savedId = existing._id.toHexString();
    } else {
      savedId = (await insertPost({ ...doc, createdAt: now })).toHexString();
    }
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return {
        status: "error",
        message: "Fix the highlighted fields to save.",
        errors: {
          slug: "Another post already uses this web address. Change it to something unique.",
        },
      };
    }
    console.error("[blog] post save failed:", err);
    return { status: "error", message: "Could not save. Try again." };
  }

  const wentLive = status === "published" && existing?.status !== "published";
  const wentOffline = status === "draft" && existing?.status === "published";
  const action = wentLive
    ? "publish"
    : wentOffline
      ? "unpublish"
      : existing
        ? "update"
        : "create";
  const verb = {
    publish: "Published",
    unpublish: "Unpublished",
    update: "Updated",
    create: "Drafted",
  }[action];
  await recordAudit({
    area: "posts",
    action,
    summary: `${verb} "${post.title}"`,
    details: { id: savedId, slug, status },
    changedBy: user.email,
  });

  /* No revalidatePath on save, deliberately. Every blog and admin page is
     rendered per request (the root layout reads the session), so there is no
     cached copy to clear, and the editor updates itself from the result below.
     Revalidating made Next fold a re-render of this editor page into the
     save's reply, and roughly one save in twenty then left the editor stuck
     on "Saving…" although the save had gone through (reproduced on Next
     16.2.9, gone in 120 saves without it). Delete still revalidates: it
     redirects to the list anyway. */

  const live = status === "published" && hasBeenLive({ publishedAt }, now);
  return {
    status: "saved",
    message: wentLive
      ? SAVED_MESSAGES.publish
      : wentOffline
        ? SAVED_MESSAGES.unpublish
        : SAVED_MESSAGES[status],
    saved: {
      id: savedId,
      status,
      slug,
      live,
      slugLocked: hasBeenLive({ publishedAt }, now),
    },
    created: !existing,
  };
}

export interface DeleteState {
  message?: string;
}

/** Deletes a post for good, then returns to the list. The editor asks for a
    second click before this is ever submitted. */
export async function deletePostAction(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const user = await requireAdmin();

  const id = toObjectId(field(formData, "id"));
  if (!id) return { message: "Could not delete: bad request." };

  let deleted: PostDoc | null;
  try {
    deleted = await deletePost(id);
  } catch (err) {
    console.error("[blog] post delete failed:", err);
    return { message: "Could not delete. Try again." };
  }

  if (deleted) {
    await recordAudit({
      area: "posts",
      action: "delete",
      summary: `Deleted "${deleted.title}"`,
      details: { id: id.toHexString(), slug: deleted.slug },
      changedBy: user.email,
    });
    revalidateBlog([deleted.slug]);
  }

  // Already gone counts as done: the list is the right place either way.
  redirect("/admin/posts?deleted=1");
}
