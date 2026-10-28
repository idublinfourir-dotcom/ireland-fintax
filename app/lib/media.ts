/* Uploaded blog pictures: store, look up, serve. SERVER ONLY.

   Pictures arrive already shrunk by the editor (two copies, up to 2,000px and
   900px). This module does not trust anything about them it can check: the
   type and size are read from the bytes, the byte counts are capped, and only
   JPEG, PNG and WebP are accepted. */

import { createHash } from "node:crypto";
import { Binary, ObjectId } from "mongodb";
import { mediaCollection, postsCollection, toObjectId } from "./collections";
import { imageInfo, type ImageType } from "./image-info";
import { UPLOAD_LARGE_EDGE, UPLOAD_SMALL_EDGE } from "./post-types";
import { postUploadIds } from "./post-blocks";

/** Byte caps per copy. Generous for a picture already shrunk in the browser,
    and well under MongoDB's 16MB document limit together. */
export const MEDIA_LIMITS = { large: 3 * 1024 * 1024, small: 800 * 1024 } as const;

export class MediaError extends Error {}

export interface StoredMedia {
  id: string;
  width: number;
  height: number;
}

/* A copy may come out a pixel or two over its edge after rounding, and an
   original smaller than the edge is kept at its own size. */
const SLACK = 2;

/** Checks and stores one uploaded picture, or returns the copy already
    stored when the same picture was uploaded before. */
export async function saveUpload(
  large: Uint8Array,
  small: Uint8Array,
  uploadedBy: string,
): Promise<StoredMedia> {
  if (large.length > MEDIA_LIMITS.large || small.length > MEDIA_LIMITS.small) {
    throw new MediaError("That picture is too big to store, even after shrinking.");
  }
  const big = imageInfo(large);
  const thumb = imageInfo(small);
  if (!big || !thumb) {
    throw new MediaError("Only JPEG, PNG and WebP pictures can be uploaded.");
  }
  if (
    Math.max(big.width, big.height) > UPLOAD_LARGE_EDGE + SLACK ||
    Math.max(thumb.width, thumb.height) > UPLOAD_SMALL_EDGE + SLACK
  ) {
    throw new MediaError("That picture was not shrunk before upload. Reload the editor and try again.");
  }

  const sha256 = createHash("sha256").update(large).digest("hex");
  const media = await mediaCollection();
  const existing = await media.findOne(
    { sha256 },
    { projection: { _id: 1, width: 1, height: 1 } },
  );
  if (existing) {
    return { id: existing._id.toHexString(), width: existing.width, height: existing.height };
  }

  const _id = new ObjectId();
  try {
    await media.insertOne({
      _id,
      type: big.type,
      width: big.width,
      height: big.height,
      data: new Binary(large),
      smallType: thumb.type,
      smallWidth: thumb.width,
      smallHeight: thumb.height,
      small: new Binary(small),
      bytes: large.length + small.length,
      sha256,
      uploadedBy,
      createdAt: new Date(),
    });
  } catch (err) {
    // Two uploads of the same picture raced; the other one won.
    if ((err as { code?: unknown }).code === 11000) {
      const winner = await media.findOne({ sha256 }, { projection: { _id: 1, width: 1, height: 1 } });
      if (winner) return { id: winner._id.toHexString(), width: winner.width, height: winner.height };
    }
    throw err;
  }
  return { id: _id.toHexString(), width: big.width, height: big.height };
}

/** One copy of a stored picture, ready to send, or null. */
export async function getMediaFile(
  id: string,
  size: "large" | "small",
): Promise<{ type: ImageType; bytes: Uint8Array } | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const media = await mediaCollection();
  const doc = await media.findOne(
    { _id },
    { projection: size === "small" ? { small: 1, smallType: 1 } : { data: 1, type: 1 } },
  );
  if (!doc) return null;
  const binary = size === "small" ? doc.small : doc.data;
  return {
    type: size === "small" ? doc.smallType : doc.type,
    bytes: binary.read(0, binary.length()),
  };
}

/** The stored size of each of these uploads; ids not found are absent. */
export async function getMediaSizes(
  ids: string[],
): Promise<Map<string, { width: number; height: number }>> {
  const objectIds = ids.map(toObjectId).filter((id): id is ObjectId => id !== null);
  if (objectIds.length === 0) return new Map();
  const media = await mediaCollection();
  const docs = await media
    .find({ _id: { $in: objectIds } }, { projection: { width: 1, height: 1 } })
    .toArray();
  return new Map(docs.map((d) => [d._id.toHexString(), { width: d.width, height: d.height }]));
}

/** How long an unused upload is kept: a picture uploaded into an editor that
    has not been saved yet belongs to no post, and must survive the sweep. */
export const UNUSED_MEDIA_GRACE_DAYS = 7;

/**
 * Uploaded pictures that no post or draft uses and that are older than the
 * grace period, with their total size. Drafts count: an AI draft or a post in
 * progress keeps its pictures.
 */
export async function findUnusedMedia(): Promise<{ ids: ObjectId[]; bytes: number }> {
  const posts = await postsCollection();
  const used = new Set<string>();
  const docs = await posts.find({}, { projection: { cover: 1, blocks: 1 } }).toArray();
  for (const p of docs) for (const id of postUploadIds(p.cover, p.blocks ?? [])) used.add(id);

  const cutoff = new Date(Date.now() - UNUSED_MEDIA_GRACE_DAYS * 24 * 60 * 60 * 1000);
  const media = await mediaCollection();
  const uploads = await media
    .find({ createdAt: { $lt: cutoff } }, { projection: { _id: 1, bytes: 1 } })
    .toArray();
  const unused = uploads.filter((m) => !used.has(m._id.toHexString()));
  return { ids: unused.map((m) => m._id), bytes: unused.reduce((n, m) => n + (m.bytes ?? 0), 0) };
}

/** Delete these uploads; returns how many went. */
export async function deleteMedia(ids: ObjectId[]): Promise<number> {
  if (ids.length === 0) return 0;
  const media = await mediaCollection();
  return (await media.deleteMany({ _id: { $in: ids } })).deletedCount;
}
