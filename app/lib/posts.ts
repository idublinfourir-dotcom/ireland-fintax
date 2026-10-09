/* Blog posts: read + write. SERVER ONLY.

   `publishedFilter` is the one definition of "visible to the public". Every
   public read goes through it, and nothing else should query posts for a
   public page: a filter repeated per call site is the one that gets missed.

   Public reads never throw. A database that is missing or down renders the
   blog as empty (and logs), the same way the calculators fall back to their
   code defaults, so the site keeps serving. Admin reads and writes do throw:
   the editor has to know a save did not happen. */

import { ObjectId, type Filter } from "mongodb";
import { postsCollection, type PostDoc } from "./collections";
import type { Block } from "./post-blocks";
import {
  POST_CATEGORIES,
  SLUG_PATTERN,
  type PostCategory,
  type PostImage,
  type PostStatus,
} from "./post-types";

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  cover: PostImage;
  readingMinutes: number;
  publishedAt: Date;
  updatedAt: Date;
}

export interface Post extends PostSummary {
  blocks: Block[];
}

/** Posts the public may see: published, and not dated in the future. */
export function publishedFilter(now = new Date()): Filter<PostDoc> {
  return { status: "published", publishedAt: { $lte: now } };
}

/** Has this post been visible at its URL? Then the URL may be linked to. */
export function hasBeenLive(doc: Pick<PostDoc, "publishedAt">, now = new Date()) {
  return doc.publishedAt !== null && doc.publishedAt <= now;
}

const toSummary = (doc: Omit<PostDoc, "blocks">): PostSummary => ({
  id: doc._id.toHexString(),
  slug: doc.slug,
  title: doc.title,
  excerpt: doc.excerpt,
  category: doc.category,
  cover: doc.cover,
  readingMinutes: doc.readingMinutes,
  // publishedFilter guarantees it is set on every public read.
  publishedAt: doc.publishedAt ?? doc.updatedAt,
  updatedAt: doc.updatedAt,
});

const SUMMARY_PROJECTION = { blocks: 0 } as const;

/* ── public ────────────────────────────────────────────────────────────── */

export async function listPublishedPosts({
  category,
  page,
  perPage,
}: {
  category: PostCategory | null;
  page: number;
  perPage: number;
}): Promise<{
  posts: PostSummary[];
  total: number;
  /** Categories with at least one public post, in display order. */
  categories: PostCategory[];
}> {
  try {
    const posts = await postsCollection();
    const visible = publishedFilter();
    const filter = category ? { ...visible, category } : visible;
    const [docs, total, used] = await Promise.all([
      posts
        .find(filter, { projection: SUMMARY_PROJECTION })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray(),
      posts.countDocuments(filter),
      posts.distinct("category", visible),
    ]);
    return {
      posts: docs.map(toSummary),
      total,
      categories: POST_CATEGORIES.map((c) => c.value).filter((value) =>
        used.includes(value),
      ),
    };
  } catch (err) {
    console.error("[blog] listing failed:", err);
    return { posts: [], total: 0, categories: [] };
  }
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  try {
    const posts = await postsCollection();
    const doc = await posts.findOne({ ...publishedFilter(), slug });
    if (!doc) return null;
    return { ...toSummary(doc), blocks: doc.blocks };
  } catch (err) {
    console.error("[blog] post read failed:", err);
    return null;
  }
}

/** Up to `limit` other posts: the same category first, then the newest. */
export async function getRelatedPosts(
  post: Pick<Post, "id" | "category">,
  limit = 3,
): Promise<PostSummary[]> {
  try {
    const posts = await postsCollection();
    const visible = publishedFilter();
    const self = new ObjectId(post.id);
    const same = await posts
      .find(
        { ...visible, category: post.category, _id: { $ne: self } },
        { projection: SUMMARY_PROJECTION },
      )
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    if (same.length >= limit) return same.map(toSummary);

    const others = await posts
      .find(
        { ...visible, _id: { $nin: [self, ...same.map((d) => d._id)] } },
        { projection: SUMMARY_PROJECTION },
      )
      .sort({ publishedAt: -1 })
      .limit(limit - same.length)
      .toArray();
    return [...same, ...others].map(toSummary);
  } catch (err) {
    console.error("[blog] related posts failed:", err);
    return [];
  }
}

/** Every public post's URL and last change, for the sitemap. */
export async function listPublishedSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  try {
    const posts = await postsCollection();
    return await posts
      .find(publishedFilter(), { projection: { _id: 0, slug: 1, updatedAt: 1 } })
      .toArray();
  } catch (err) {
    console.error("[blog] sitemap read failed:", err);
    return [];
  }
}

/* ── admin ─────────────────────────────────────────────────────────────── */

export interface AdminPostRow {
  id: string;
  slug: string;
  title: string;
  category: PostCategory;
  status: PostStatus;
  live: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
}

/** Every post, most recently edited first. */
export async function listAllPosts(): Promise<AdminPostRow[]> {
  const posts = await postsCollection();
  const now = new Date();
  const docs = await posts
    .find({}, { projection: SUMMARY_PROJECTION })
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    status: doc.status,
    live: doc.status === "published" && hasBeenLive(doc, now),
    publishedAt: doc.publishedAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function getPostById(id: ObjectId): Promise<PostDoc | null> {
  const posts = await postsCollection();
  return posts.findOne({ _id: id });
}

export async function insertPost(doc: Omit<PostDoc, "_id">): Promise<ObjectId> {
  const posts = await postsCollection();
  const _id = new ObjectId();
  await posts.insertOne({ _id, ...doc });
  return _id;
}

export async function updatePost(
  id: ObjectId,
  set: Omit<PostDoc, "_id" | "createdAt">,
): Promise<boolean> {
  const posts = await postsCollection();
  const result = await posts.updateOne({ _id: id }, { $set: set });
  return result.matchedCount === 1;
}

/** Deletes a post and returns what was deleted, or null if it was gone. */
export async function deletePost(id: ObjectId): Promise<PostDoc | null> {
  const posts = await postsCollection();
  return posts.findOneAndDelete({ _id: id });
}

/** True for the unique-index violation a duplicate slug raises. */
export function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === 11000
  );
}
