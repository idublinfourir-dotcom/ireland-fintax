/* Unit tests for blog post validation and the picture helpers.
   Run: node --test app/lib/post-validation.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePostInput, type RawPostInput } from "./post-validation.ts";
import { imageSize, imageUrl, normaliseImageUrl, parseImageRef } from "./post-types.ts";

const BODY = JSON.stringify([
  { id: "a", type: "heading", level: 2, text: "The headline" },
  { id: "b", type: "paragraph", text: "The standard rate band went up." },
]);

const raw = (over: Partial<RawPostInput> = {}): RawPostInput => ({
  title: "Budget 2027: what changed",
  slug: "",
  excerpt: "The income tax bands, USC and the new credits, in plain English.",
  category: "news",
  cover: JSON.stringify({ kind: "curated", key: "deskFinance" }),
  blocks: BODY,
  ...over,
});

const draft = { publishing: false };
const publish = { publishing: true };

test("a complete post validates, with the slug made from the title", () => {
  const result = validatePostInput(raw(), publish);
  assert.ok(result.ok);
  assert.equal(result.value.slug, "budget-2027-what-changed");
  assert.deepEqual(result.value.cover, { kind: "curated", key: "deskFinance" });
  assert.equal(result.value.blocks.length, 2);
});

test("a draft needs only a title", () => {
  assert.ok(validatePostInput(raw({ excerpt: "", blocks: "[]" }), draft).ok);
});

test("publishing needs the summary and some content", () => {
  const result = validatePostInput(raw({ excerpt: "", blocks: "[]" }), publish);
  assert.ok(!result.ok);
  assert.ok(result.errors.excerpt);
  assert.ok(result.errors.blocks);
});

test("a body that is not valid JSON is reported on the body", () => {
  const result = validatePostInput(raw({ blocks: "{not json" }), draft);
  assert.ok(!result.ok);
  assert.match(result.errors.blocks ?? "", /Could not read the post/);
});

test("a missing title is reported on the title, not the slug", () => {
  const result = validatePostInput(raw({ title: "   " }), draft);
  assert.ok(!result.ok);
  assert.ok(result.errors.title);
  assert.equal(result.errors.slug, undefined);
});

test("over-long title and summary are refused", () => {
  const result = validatePostInput(raw({ title: "x".repeat(141), excerpt: "y".repeat(301) }), draft);
  assert.ok(!result.ok);
  assert.ok(result.errors.title);
  assert.ok(result.errors.excerpt);
});

test("a typed slug is tidied into URL form", () => {
  const result = validatePostInput(raw({ slug: "  Budget 2027 & You!  " }), draft);
  assert.ok(result.ok);
  assert.equal(result.value.slug, "budget-2027-and-you");
});

test("whitespace in title and summary is collapsed", () => {
  const result = validatePostInput(raw({ title: "  Two   spaces ", excerpt: "a\n\nb" }), draft);
  assert.ok(result.ok);
  assert.equal(result.value.title, "Two spaces");
  assert.equal(result.value.excerpt, "a b");
});

test("an unknown category is refused", () => {
  const result = validatePostInput(raw({ category: "crypto" }), draft);
  assert.ok(!result.ok);
  assert.ok(result.errors.category);
});

test("covers: curated, Unsplash and uploads are accepted; others are not", () => {
  for (const cover of [
    { kind: "curated", key: "office" },
    { kind: "unsplash", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f" },
    { kind: "upload", id: "6ac8bec794b4d24f0671f0a1", width: 2000, height: 1125 },
  ]) {
    assert.ok(validatePostInput(raw({ cover: JSON.stringify(cover) }), draft).ok, cover.kind);
  }
  for (const cover of [
    { kind: "curated", key: "footerLand" },
    { kind: "unsplash", url: "https://unsplash.com/photos/abc123" },
    { kind: "unsplash", url: "https://images.unsplash.com.evil.example/photo-1" },
    { kind: "upload", id: "nope" },
    null,
  ]) {
    const result = validatePostInput(raw({ cover: JSON.stringify(cover) }), draft);
    assert.ok(!result.ok && result.errors.cover, JSON.stringify(cover));
  }
});

test("normaliseImageUrl keeps the address's own sizing", () => {
  const url = normaliseImageUrl("https://images.unsplash.com/photo-1?w=800&q=80");
  assert.ok(url);
  const params = new URL(url).searchParams;
  assert.equal(params.get("w"), "800");
  assert.equal(params.get("q"), "80");
  assert.equal(params.get("auto"), "format");
});

test("imageUrl sizes Unsplash pictures and picks an upload's small copy", () => {
  const unsplash = imageUrl({ kind: "unsplash", url: "https://images.unsplash.com/photo-1?w=1600" }, 900);
  assert.equal(new URL(unsplash).searchParams.get("w"), "900");
  const curated = new URL(imageUrl({ kind: "curated", key: "office" }, 320));
  assert.equal(curated.hostname, "images.unsplash.com");
  assert.equal(curated.searchParams.get("w"), "320");
  const upload = { kind: "upload" as const, id: "6ac8bec794b4d24f0671f0a1", width: 2000, height: 1000 };
  assert.equal(imageUrl(upload, 600), "/media/6ac8bec794b4d24f0671f0a1?size=small");
  assert.equal(imageUrl(upload, 1600), "/media/6ac8bec794b4d24f0671f0a1");
});

test("Unsplash pictures keep a measured size, but only as a sane pair", () => {
  const url = "https://images.unsplash.com/photo-1554224155-6726b3ff858f";
  const withSize = parseImageRef({ kind: "unsplash", url, width: 3200.4, height: 1836 });
  assert.ok(withSize && withSize.kind === "unsplash");
  assert.equal(withSize.width, 3200);
  assert.equal(withSize.height, 1836);
  for (const bad of [{ width: 3200 }, { width: -1, height: 10 }, { width: 1e9, height: 10 }, { width: "x", height: 2 }]) {
    const ref = parseImageRef({ kind: "unsplash", url, ...bad });
    assert.ok(ref && ref.kind === "unsplash" && ref.width === undefined && ref.height === undefined, JSON.stringify(bad));
  }
});

test("imageSize knows curated photos, uploads, and measured Unsplash links", () => {
  assert.deepEqual(imageSize({ kind: "curated", key: "office" }), { width: 1600, height: 1068 });
  assert.deepEqual(imageSize({ kind: "upload", id: "6ac8bec794b4d24f0671f0a1", width: 2000, height: 1148 }), { width: 2000, height: 1148 });
  assert.equal(imageSize({ kind: "unsplash", url: "https://images.unsplash.com/photo-1" }), null);
});

test("parseImageRef rounds an upload's size and refuses junk", () => {
  assert.deepEqual(parseImageRef({ kind: "upload", id: "6ac8bec794b4d24f0671f0a1", width: 10.4, height: "x" }), {
    kind: "upload",
    id: "6ac8bec794b4d24f0671f0a1",
    width: 10,
    height: 1,
  });
  assert.equal(parseImageRef("curated"), null);
  assert.equal(parseImageRef({ kind: "upload", id: "6AC8BEC794B4D24F0671F0A1" }), null);
});
