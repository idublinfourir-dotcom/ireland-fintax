/* The blocks a blog post is built from. PURE module, unit-tested, shared by
   the editor (client), the save action (server) and the post page.

   A post body is an ordered list of typed blocks stored as-is in MongoDB, not
   an HTML string. The editor sends it as JSON and `parseBlocks` rebuilds every
   block field by field, so nothing the browser adds survives the save, and
   components/post-body.tsx renders each block as React elements. Text inside
   blocks may carry the inline formatting in lib/inline-format.ts. */

import { inlineText, parseLines } from "./inline-format.ts";
import { parseImageRef, postSlug, type PostImage } from "./post-types.ts";

export const BLOCK_TYPES = [
  { type: "paragraph", label: "Paragraph" },
  { type: "heading", label: "Heading" },
  { type: "image", label: "Picture" },
  { type: "gallery", label: "Gallery" },
  { type: "quote", label: "Quote" },
  { type: "callout", label: "Key point" },
  { type: "list", label: "List" },
  { type: "table", label: "Table" },
  { type: "divider", label: "Section break" },
  { type: "pagebreak", label: "Page break" },
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number]["type"];

export const BLOCK_LABELS = Object.fromEntries(
  BLOCK_TYPES.map((b) => [b.type, b.label]),
) as Record<BlockType, string>;

export type ImageSize = "normal" | "wide";

export interface GalleryItem {
  image: PostImage;
  alt: string;
}

export type Block =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | {
      id: string;
      type: "image";
      /** Null only in a draft whose picture has not been chosen yet. */
      image: PostImage | null;
      alt: string;
      caption: string;
      size: ImageSize;
    }
  | { id: string; type: "gallery"; items: GalleryItem[]; caption: string }
  | { id: string; type: "quote"; text: string; cite: string }
  | { id: string; type: "callout"; title: string; text: string }
  | { id: string; type: "list"; style: "bullet" | "number"; items: string[] }
  /** rows[0] is the header row; every row has the same number of cells. */
  | { id: string; type: "table"; rows: string[][] }
  | { id: string; type: "divider" }
  | { id: string; type: "pagebreak" };

export const BLOCK_LIMITS = {
  blocks: 400,
  text: 10_000,
  heading: 200,
  short: 300,
  listItems: 60,
  tableRows: 40,
  tableCols: 8,
  cell: 500,
  galleryMax: 6,
} as const;

/** A fresh, empty block of a type, as the editor adds it. */
export function newBlock(type: BlockType, id: string): Block {
  switch (type) {
    case "paragraph":
      return { id, type, text: "" };
    case "heading":
      return { id, type, level: 2, text: "" };
    case "image":
      return { id, type, image: null, alt: "", caption: "", size: "normal" };
    case "gallery":
      return { id, type, items: [], caption: "" };
    case "quote":
      return { id, type, text: "", cite: "" };
    case "callout":
      return { id, type, title: "", text: "" };
    case "list":
      return { id, type, style: "bullet", items: [""] };
    case "table":
      return { id, type, rows: [["", ""], ["", ""]] };
    case "divider":
    case "pagebreak":
      return { id, type };
  }
}

/* ── parsing ───────────────────────────────────────────────────────────── */

class BlockError extends Error {}

const str = (v: unknown, max: number, what: string): string => {
  if (typeof v !== "string") throw new BlockError("malformed");
  const s = v.replace(/\r\n?/g, "\n").trim();
  if (s.length > max) {
    throw new BlockError(
      `${what.toLowerCase()} is too long (${max.toLocaleString("en-GB")} characters at most).`,
    );
  }
  return s;
};

const oneLine = (v: unknown, max: number, what: string) =>
  str(v, max, what).replace(/\s+/g, " ");

function parseOne(raw: unknown, publishing: boolean): Block {
  if (typeof raw !== "object" || raw === null) throw new BlockError("malformed");
  const r = raw as Record<string, unknown>;
  // Ids only key the editor's list, so a bad one is replaced, not refused.
  const id = typeof r.id === "string" && /^[\w-]{1,40}$/.test(r.id) ? r.id : "";

  switch (r.type) {
    case "paragraph":
      return { id, type: "paragraph", text: str(r.text, BLOCK_LIMITS.text, "The paragraph") };
    case "heading":
      return {
        id,
        type: "heading",
        level: r.level === 3 ? 3 : 2,
        text: oneLine(r.text, BLOCK_LIMITS.heading, "The heading"),
      };
    case "image": {
      const image = r.image == null ? null : parseImageRef(r.image);
      if (r.image != null && !image) throw new BlockError("that picture's address is not one this site can show.");
      if (publishing && !image) throw new BlockError("choose a picture, or remove the block.");
      return {
        id,
        type: "image",
        image,
        alt: oneLine(r.alt, BLOCK_LIMITS.short, "The description"),
        caption: oneLine(r.caption, BLOCK_LIMITS.short, "The caption"),
        size: r.size === "wide" ? "wide" : "normal",
      };
    }
    case "gallery": {
      if (!Array.isArray(r.items)) throw new BlockError("malformed");
      if (r.items.length > BLOCK_LIMITS.galleryMax) {
        throw new BlockError(`a gallery holds ${BLOCK_LIMITS.galleryMax} pictures at most.`);
      }
      const items = r.items.map((item): GalleryItem => {
        const it = (item ?? {}) as Record<string, unknown>;
        const image = parseImageRef(it.image);
        if (!image) throw new BlockError("one of its pictures has an address this site cannot show.");
        return { image, alt: oneLine(it.alt ?? "", BLOCK_LIMITS.short, "A description") };
      });
      if (publishing && items.length < 2) {
        throw new BlockError("add at least two pictures, or use a Picture block instead.");
      }
      return {
        id,
        type: "gallery",
        items,
        caption: oneLine(r.caption, BLOCK_LIMITS.short, "The caption"),
      };
    }
    case "quote":
      return {
        id,
        type: "quote",
        text: str(r.text, BLOCK_LIMITS.text, "The quote"),
        cite: oneLine(r.cite, BLOCK_LIMITS.short, "The name"),
      };
    case "callout":
      return {
        id,
        type: "callout",
        title: oneLine(r.title, BLOCK_LIMITS.heading, "The title"),
        text: str(r.text, BLOCK_LIMITS.text, "The key point"),
      };
    case "list": {
      if (!Array.isArray(r.items)) throw new BlockError("malformed");
      if (r.items.length > BLOCK_LIMITS.listItems) {
        throw new BlockError(`a list holds ${BLOCK_LIMITS.listItems} items at most.`);
      }
      return {
        id,
        type: "list",
        style: r.style === "number" ? "number" : "bullet",
        items: r.items.map((item) => str(item, BLOCK_LIMITS.short * 4, "A list item")),
      };
    }
    case "table": {
      if (!Array.isArray(r.rows) || r.rows.some((row) => !Array.isArray(row))) {
        throw new BlockError("malformed");
      }
      const rows = r.rows as unknown[][];
      // Sizes are checked before anything is spread or mapped over them.
      const tooBig =
        rows.length > BLOCK_LIMITS.tableRows ||
        rows.some((row) => row.length > BLOCK_LIMITS.tableCols);
      const cols = tooBig ? 0 : Math.max(1, ...rows.map((row) => row.length));
      if (tooBig) {
        throw new BlockError(
          `a table holds ${BLOCK_LIMITS.tableRows} rows and ${BLOCK_LIMITS.tableCols} columns at most.`,
        );
      }
      // Every row padded to the widest, so the page never meets a ragged table.
      return {
        id,
        type: "table",
        rows: rows.map((row) =>
          Array.from({ length: cols }, (_, c) => oneLine(row[c] ?? "", BLOCK_LIMITS.cell, "A cell")),
        ),
      };
    }
    case "divider":
      return { id, type: "divider" };
    case "pagebreak":
      return { id, type: "pagebreak" };
    default:
      throw new BlockError("malformed");
  }
}

/**
 * The post body as the editor sent it, rebuilt and checked.
 *
 * A draft may hold half-finished blocks (a picture not chosen yet, a gallery
 * of one); publishing needs every block complete and at least some content.
 * Messages name the block by its position and type, the way the editor shows
 * them.
 */
export function parseBlocks(
  raw: unknown,
  options: { publishing: boolean },
): { ok: true; blocks: Block[] } | { ok: false; message: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, message: "Could not read the post. Reload the editor and try again." };
  }
  if (raw.length > BLOCK_LIMITS.blocks) {
    return { ok: false, message: `A post holds ${BLOCK_LIMITS.blocks} blocks at most.` };
  }

  const blocks: Block[] = [];
  const seen = new Set<string>();
  for (const [index, item] of raw.entries()) {
    let block: Block;
    try {
      block = parseOne(item, options.publishing);
    } catch (err) {
      if (!(err instanceof BlockError)) throw err;
      const type = (item as { type?: unknown } | null)?.type;
      const label = BLOCK_LABELS[type as BlockType];
      if (err.message === "malformed" || !label) {
        return { ok: false, message: "Could not read the post. Reload the editor and try again." };
      }
      return { ok: false, message: `Block ${index + 1} (${label}): ${err.message}` };
    }
    if (!block.id || seen.has(block.id)) block = { ...block, id: `b${index}-${seen.size}` };
    seen.add(block.id);
    blocks.push(block);
  }

  if (options.publishing && !hasContent(blocks)) {
    return { ok: false, message: "Write something in the post before publishing it." };
  }
  return { ok: true, blocks };
}

/* ── reading the blocks ────────────────────────────────────────────────── */

/** Every uploaded picture the blocks use, so the save can check they exist. */
export function uploadIds(blocks: Block[]): string[] {
  const ids = new Set<string>();
  const add = (image: PostImage | null) => {
    if (image?.kind === "upload") ids.add(image.id);
  };
  for (const b of blocks) {
    if (b.type === "image") add(b.image);
    if (b.type === "gallery") b.items.forEach((item) => add(item.image));
  }
  return [...ids];
}

/** The same blocks with each upload's size replaced by the stored one. */
export function withUploadSizes(
  blocks: Block[],
  sizes: Map<string, { width: number; height: number }>,
): Block[] {
  const fix = <T extends PostImage | null>(image: T): T =>
    image?.kind === "upload" && sizes.has(image.id)
      ? ({ ...image, ...sizes.get(image.id) } as T)
      : image;
  return blocks.map((b) =>
    b.type === "image"
      ? { ...b, image: fix(b.image) }
      : b.type === "gallery"
        ? { ...b, items: b.items.map((it) => ({ ...it, image: fix(it.image) })) }
        : b,
  );
}

/** The words a reader would read, for the reading time. Markup is dropped. */
export function plainText(blocks: Block[]): string {
  const t = (s: string) => inlineText(parseLines(s));
  return blocks
    .flatMap((b) => {
      switch (b.type) {
        case "paragraph":
        case "heading":
          return [t(b.text)];
        case "quote":
          return [t(b.text), b.cite];
        case "callout":
          return [b.title, t(b.text)];
        case "list":
          return b.items.map(t);
        case "table":
          return b.rows.flat().map(t);
        case "image":
          return [b.caption];
        case "gallery":
          return [b.caption];
        default:
          return [];
      }
    })
    .join(" ");
}

/** Minutes to read, at a steady 220 words a minute. Never less than one. */
export function readingMinutes(blocks: Block[]): number {
  const words = plainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Does the post say or show anything at all? */
export function hasContent(blocks: Block[]): boolean {
  return (
    plainText(blocks).trim().length > 0 ||
    blocks.some((b) => (b.type === "image" && b.image) || (b.type === "gallery" && b.items.length > 0))
  );
}

/** The post split at its page breaks. Empty pages are dropped, so a stray
    break at the start or end never makes a blank page. */
export function splitPages(blocks: Block[]): Block[][] {
  const pages: Block[][] = [[]];
  for (const b of blocks) {
    if (b.type === "pagebreak") pages.push([]);
    else pages[pages.length - 1].push(b);
  }
  const filled = pages.filter((p) => p.length > 0);
  return filled.length > 0 ? filled : [[]];
}

/** Anchor ids for every heading, unique across the whole post (all pages),
    keyed by block id. */
export function headingAnchors(blocks: Block[]): Map<string, string> {
  const anchors = new Map<string, string>();
  const used = new Map<string, number>();
  for (const b of blocks) {
    if (b.type !== "heading" || !b.text) continue;
    const base = postSlug(inlineText(parseLines(b.text))) || "section";
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    anchors.set(b.id, n === 1 ? base : `${base}-${n}`);
  }
  return anchors;
}

export interface TocEntry {
  anchor: string;
  text: string;
  level: 2 | 3;
  /** 1-based page the heading is on. */
  page: number;
}

/** The headings, in order, with the page each one is on. */
export function tableOfContents(blocks: Block[]): TocEntry[] {
  const anchors = headingAnchors(blocks);
  return splitPages(blocks).flatMap((page, i) =>
    page.flatMap((b) =>
      b.type === "heading" && anchors.has(b.id)
        ? [{ anchor: anchors.get(b.id)!, text: inlineText(parseLines(b.text)), level: b.level, page: i + 1 }]
        : [],
    ),
  );
}
