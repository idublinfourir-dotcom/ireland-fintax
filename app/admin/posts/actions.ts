"use server";

/* Blog post admin actions: save (as a draft, publishing, or unpublishing),
   delete, and reject an AI draft. Every action re-checks requireAdmin and is
   logged to the change audit with area "posts". */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/auth/guards";
import { newsItemsCollection, toObjectId, type NewsItemStatus, type PostDoc } from "../../lib/collections";
import { recordAudit } from "../../lib/rate-audit";
import {
  deletePost,
  getPostById,
  hasBeenLive,
  insertPost,
  isDuplicateKeyError,
  markAiReviewed,
  updatePost,
} from "../../lib/posts";
import { deleteMedia, findUnusedMedia, getMediaSizes } from "../../lib/media";
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

/** Keeps the news agent's record of an item in step with its draft, so a
    rejected story is never drafted again. Best-effort: the post change has
    already happened and must not be undone by this. */
async function setNewsItemStatus(postId: PostDoc["_id"], status: NewsItemStatus, note?: string) {
  try {
    const items = await newsItemsCollection();
    await items.updateMany(
      { postId },
      { $set: { status, updatedAt: new Date(), ...(note === undefined ? {} : { note }) } },
    );
  } catch (err) {
    console.error("[news] item status update failed:", err);
  }
}

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

  /* An AI draft goes live only after someone says they checked it. That
     review is what exempts it from the AI Act's Art. 50(4) labelling duty,
     so it is a real gate here, not just a disabled button in the browser. */
  const needsReview =
    status === "published" && existing?.origin?.kind === "ai" && !existing.origin.reviewedAt;
  if (needsReview && formData.get("facts_checked") === null) {
    return {
      status: "error",
      message: "Tick “I checked this against the sources” before publishing an AI draft.",
    };
  }

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

  if (needsReview && existing) {
    try {
      await markAiReviewed(existing._id, user.email);
    } catch (err) {
      console.error("[blog] review stamp failed:", err);
    }
    await setNewsItemStatus(existing._id, "published");
  }
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
    summary: `${verb} "${post.title}"${needsReview ? " (AI draft, checked against its sources)" : ""}`,
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

/**
 * Rejects an AI draft: deletes it and records why against the story, so the
 * news agent never drafts that story again and the reason shows in
 * /admin/news. Only for AI drafts that have never been live; anything else
 * goes through the ordinary delete.
 */
export async function rejectAiDraftAction(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const user = await requireAdmin();

  const id = toObjectId(field(formData, "id"));
  if (!id) return { message: "Could not reject: bad request." };
  const reason = field(formData, "reject_reason").replace(/\s+/g, " ").trim().slice(0, 300);
  if (!reason) return { message: "Say briefly why, so the agent learns what to skip." };

  let post: PostDoc | null;
  try {
    post = await getPostById(id);
  } catch (err) {
    console.error("[blog] post read failed:", err);
    return { message: "Could not reach the database. Try again." };
  }
  if (!post) redirect("/admin/posts");
  if (post.origin?.kind !== "ai" || post.status !== "draft" || post.publishedAt) {
    return { message: "Only an unpublished AI draft can be rejected. Use Delete instead." };
  }

  try {
    await deletePost(id);
  } catch (err) {
    console.error("[blog] post delete failed:", err);
    return { message: "Could not reject. Try again." };
  }
  await setNewsItemStatus(id, "rejected", reason);
  await recordAudit({
    area: "posts",
    action: "ai-reject",
    summary: `Rejected AI draft "${post.title}": ${reason}`,
    details: { id: id.toHexString(), reason, sources: post.origin.sources.map((s) => s.url) },
    changedBy: user.email,
  });
  revalidatePath("/admin/posts");
  redirect("/admin/posts?rejected=1");
}

/**
 * Deletes uploaded pictures that no post or draft uses and that are past the
 * grace period (lib/media.ts). Works the list out again here: nothing from
 * the form decides what goes. The panel on /admin/posts asks for a second
 * click before this is submitted.
 */
export async function deleteUnusedPicturesAction(): Promise<void> {
  const user = await requireAdmin();

  let count = 0;
  try {
    const { ids, bytes } = await findUnusedMedia();
    count = await deleteMedia(ids);
    if (count > 0) {
      await recordAudit({
        area: "media",
        action: "delete",
        summary: `Deleted ${count} unused picture${count === 1 ? "" : "s"}`,
        details: { ids: ids.map((id) => id.toHexString()), bytes },
        changedBy: user.email,
      });
    }
  } catch (err) {
    console.error("[blog] unused picture clean-up failed:", err);
    redirect("/admin/posts?cleaned=error");
  }

  revalidatePath("/admin/posts");
  redirect(`/admin/posts?cleaned=${count}`);
}
