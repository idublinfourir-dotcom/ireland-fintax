/* Validation for the admin post editor. PURE module, unit-tested.

   A draft only needs a title, so a half-written post can be saved and picked
   up later. Publishing also needs the summary and some content, because the
   summary is the card text and the search-result description. Every message
   is keyed by field so the editor can show it next to the input. */

import { parseBlocks, type Block } from "./post-blocks.ts";
import {
  isPostCategory,
  parseImageRef,
  postSlug,
  SLUG_PATTERN,
  type PostCategory,
  type PostImage,
} from "./post-types.ts";

export const POST_LIMITS = {
  title: 140,
  slug: 80,
  excerpt: 300,
} as const;

/** The editor's fields, as strings straight off the form. `cover` and
    `blocks` are JSON. */
export interface RawPostInput {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover: string;
  blocks: string;
}

export type PostField = "title" | "slug" | "excerpt" | "category" | "cover" | "blocks";

export type PostErrors = Partial<Record<PostField, string>>;

export interface PostInput {
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  cover: PostImage;
  blocks: Block[];
}

export type PostValidation =
  | { ok: true; value: PostInput }
  | { ok: false; errors: PostErrors };

const count = (n: number) => n.toLocaleString("en-GB");

const json = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export function validatePostInput(
  raw: RawPostInput,
  options: { publishing: boolean },
): PostValidation {
  const errors: PostErrors = {};
  const { publishing } = options;

  const title = raw.title.replace(/\s+/g, " ").trim();
  if (!title) errors.title = "Give the post a title.";
  else if (title.length > POST_LIMITS.title) {
    errors.title = `Keep the title to ${count(POST_LIMITS.title)} characters or fewer.`;
  }

  // A typed slug is tidied with the same rules as one made from the title
  // ("Budget 2027" → "budget-2027"), and an empty one is made from the title.
  const slug = postSlug(raw.slug) || postSlug(title);
  if (!slug) {
    if (!errors.title) errors.slug = "Add a web address for the post.";
  } else if (slug.length > POST_LIMITS.slug) {
    errors.slug = `Keep the web address to ${count(POST_LIMITS.slug)} characters or fewer.`;
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug =
      "Use lowercase letters, numbers and single hyphens only, like budget-2027-explained.";
  }

  const excerpt = raw.excerpt.replace(/\s+/g, " ").trim();
  if (publishing && !excerpt) {
    errors.excerpt =
      "Write a one or two sentence summary: it shows on the blog page and in search results.";
  } else if (excerpt.length > POST_LIMITS.excerpt) {
    errors.excerpt = `Keep the summary to ${count(POST_LIMITS.excerpt)} characters or fewer.`;
  }

  const category = raw.category;
  if (!isPostCategory(category)) errors.category = "Pick a category.";

  const cover = parseImageRef(json(raw.cover));
  if (!cover) errors.cover = "Pick a cover picture.";

  const parsed = parseBlocks(json(raw.blocks), { publishing });
  if (!parsed.ok) errors.blocks = parsed.message;

  if (Object.keys(errors).length > 0 || !cover || !parsed.ok || !isPostCategory(category)) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: { title, slug, excerpt, category, cover, blocks: parsed.blocks },
  };
}
