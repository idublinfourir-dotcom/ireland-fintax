/* Blog post categories, pictures, slugs and the disclaimer. PURE
   module, no DB or React imports, so the public pages, the admin editor (a
   client component) and node --test can all import it. The posts themselves
   are rows in the `posts` collection; see app/lib/posts.ts. */

import { images, type ImageKey } from "./images.ts";
import { toolkitSlug } from "./toolkit-types.ts";

export const POST_CATEGORIES = [
  { value: "tax", label: "Tax" },
  { value: "personal-finance", label: "Personal finance" },
  { value: "investing", label: "Investing" },
  { value: "property", label: "Mortgages & property" },
  { value: "business", label: "Starting a business" },
  { value: "news", label: "News" },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]["value"];

export const POST_CATEGORY_LABELS: Record<PostCategory, string> =
  Object.fromEntries(
    POST_CATEGORIES.map((c) => [c.value, c.label]),
  ) as Record<PostCategory, string>;

export function isPostCategory(value: unknown): value is PostCategory {
  return POST_CATEGORIES.some((c) => c.value === value);
}

export type PostStatus = "draft" | "published";

/* ── pictures ─────────────────────────────────────────────────────────────
 * Every picture in a post, the cover included, is one of three things: a
 * curated photo from lib/images.ts, an images.unsplash.com address, or a
 * picture uploaded in the editor and stored in the `media` collection (served
 * from this site at /media/<id>). Those are the only sources the CSP's img-src
 * allows, so a picture from anywhere else could never load anyway. */

export type PostImage =
  | { kind: "curated"; key: ImageKey }
  /** `width`/`height` are measured in the editor when the link is chosen, so
      the page can reserve the space; absent on links saved before that. */
  | { kind: "unsplash"; url: string; width?: number; height?: number }
  /** `width`/`height` come from the media document on save, never from the
      browser, and give the page the aspect ratio before the file loads. */
  | { kind: "upload"; id: string; width: number; height: number };

/** The curated photos offered as covers, in picker order. `footerLand` is
    left out: it is the `fields` photo again in a letterbox crop. The sizes
    are each photo's proportions (measured from Unsplash, Oct 2026) at 1,600px
    wide, so a page reserves the right space before the photo arrives. */
export const COVER_CHOICES: { key: ImageKey; label: string; width: number; height: number }[] = [
  { key: "deskFinance", label: "Finance papers and laptop", width: 1600, height: 920 },
  { key: "forecast", label: "Growth forecast on paper", width: 1600, height: 1068 },
  { key: "office", label: "Open-plan office", width: 1600, height: 1068 },
  { key: "teamLaptops", label: "Team at laptops", width: 1600, height: 1068 },
  { key: "meeting", label: "Meeting around a table", width: 1600, height: 1068 },
  { key: "teamMeeting", label: "Candid team meeting", width: 1600, height: 1048 },
  { key: "heroHandshake", label: "Handshake", width: 1600, height: 1068 },
  { key: "tower", label: "Glass office tower", width: 1600, height: 1068 },
  { key: "architecture", label: "Architectural lines", width: 1600, height: 1064 },
  // Labels describe the photos themselves: the comments on these two keys in
  // lib/images.ts ("green hills", "forest path") do not match the pictures.
  { key: "fields", label: "Red barn and autumn trees", width: 1600, height: 860 },
  { key: "forest", label: "Writing at a desk", width: 1600, height: 2400 },
];

export const DEFAULT_COVER: PostImage = { kind: "curated", key: "deskFinance" };

export function isCoverKey(value: unknown): value is ImageKey {
  return COVER_CHOICES.some((c) => c.key === value);
}

export const IMAGE_HOST = "images.unsplash.com";

/**
 * An Unsplash image address, normalised, or null when it is not one.
 *
 * Only images.unsplash.com is accepted: it is the one photo host the CSP
 * allows. The photo PAGE (unsplash.com/photos/…) is not an image and is
 * rejected too. Sizing parameters the address lacks are filled in so a pasted
 * original does not ship a multi-megabyte file; ones it carries are kept.
 */
export function normaliseImageUrl(input: string, width = 1600): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== IMAGE_HOST) return null;
  if (url.username || url.password || url.port) return null;
  const defaults: Record<string, string> = {
    auto: "format",
    fit: "crop",
    w: String(width),
    q: "70",
  };
  for (const [key, value] of Object.entries(defaults)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.toString();
}

/** Uploads are stored twice: up to 2,000px for the page, and up to 900px
    for cards and thumbnails. */
export const UPLOAD_LARGE_EDGE = 2000;
export const UPLOAD_SMALL_EDGE = 900;

/** The address for a picture, at about `width` pixels wide. Curated and
    Unsplash photos are resized by Unsplash; an upload picks its small copy
    whenever that is wide enough. */
export function imageUrl(image: PostImage, width = 1600): string {
  if (image.kind === "upload") {
    return width <= UPLOAD_SMALL_EDGE ? `/media/${image.id}?size=small` : `/media/${image.id}`;
  }
  const url = new URL(image.kind === "curated" ? images[image.key] : image.url);
  url.searchParams.set("w", String(width));
  return url.toString();
}

/** A picture's pixel size where it is known: uploads and curated photos
    always, Unsplash links once measured. Used for the width and height
    attributes that stop the page jumping as pictures load. */
export function imageSize(image: PostImage): { width: number; height: number } | null {
  if (image.kind === "curated") {
    const choice = COVER_CHOICES.find((c) => c.key === image.key);
    return choice ? { width: choice.width, height: choice.height } : null;
  }
  return image.width && image.height ? { width: image.width, height: image.height } : null;
}

/**
 * A picture reference as the editor sent it, checked, or null.
 *
 * An upload's id is checked for shape only here; the save action then looks
 * every one up in `media` and takes the size from there.
 */
export function parseImageRef(raw: unknown): PostImage | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (r.kind === "curated") {
    return isCoverKey(r.key) ? { kind: "curated", key: r.key } : null;
  }
  if (r.kind === "unsplash") {
    const url = typeof r.url === "string" ? normaliseImageUrl(r.url) : null;
    if (!url) return null;
    const dim = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 20_000 ? Math.round(v) : null;
    const width = dim(r.width);
    const height = dim(r.height);
    // A size is kept only as a pair; half of one says nothing about the shape.
    return width && height ? { kind: "unsplash", url, width, height } : { kind: "unsplash", url };
  }
  if (r.kind === "upload") {
    if (typeof r.id !== "string" || !/^[0-9a-f]{24}$/.test(r.id)) return null;
    const size = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : 1);
    return { kind: "upload", id: r.id, width: size(r.width), height: size(r.height) };
  }
  return null;
}

/* ── slugs, disclaimer ─────────────────────────────────────────────────── */

/** URL slug from a title. The same rules as the Founders Hub request URLs. */
export const postSlug = toolkitSlug;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* Rendered under every post, from here rather than per post, so no post can
   go out without it. Same wording as the FAQ's "Is this advice?" answer. */
export const POST_DISCLAIMER =
  "General information only, not financial, tax or legal advice. Rates and rules change and your own situation matters, so check with Revenue or a qualified, regulated adviser before acting on a big decision.";
