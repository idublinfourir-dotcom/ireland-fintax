/* Unit tests for the blog block model.
   Run: node --test app/lib/post-blocks.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  headingAnchors,
  newBlock,
  parseBlocks,
  readingMinutes,
  splitPages,
  tableOfContents,
  uploadIds,
  withUploadSizes,
  type Block,
} from "./post-blocks.ts";

const draft = { publishing: false };
const publish = { publishing: true };
const UPLOAD_ID = "6ac8bec794b4d24f0671f0a1";

test("every block type parses back to itself", () => {
  const blocks: Block[] = [
    { id: "a", type: "paragraph", text: "Hello **world**" },
    { id: "b", type: "heading", level: 3, text: "Bands" },
    { id: "c", type: "image", image: { kind: "curated", key: "office" }, alt: "Office", caption: "Cap", size: "wide" },
    {
      id: "d",
      type: "gallery",
      items: [
        { image: { kind: "curated", key: "office" }, alt: "" },
        { image: { kind: "upload", id: UPLOAD_ID, width: 800, height: 600 }, alt: "Chart" },
      ],
      caption: "",
    },
    { id: "e", type: "quote", text: "Pay yourself first", cite: "Someone" },
    { id: "f", type: "callout", title: "Remember", text: "Deadlines move." },
    { id: "g", type: "list", style: "number", items: ["One", "Two"] },
    { id: "h", type: "table", rows: [["Band", "Rate"], ["First €44,000", "20%"]] },
    { id: "i", type: "divider" },
    { id: "j", type: "pagebreak" },
  ];
  const result = parseBlocks(JSON.parse(JSON.stringify(blocks)), publish);
  assert.ok(result.ok);
  assert.deepEqual(result.blocks, blocks);
});

test("unknown fields are dropped and text is trimmed", () => {
  const result = parseBlocks(
    [{ id: "a", type: "paragraph", text: "  hi  ", onclick: "alert(1)", html: "<b>x</b>" }],
    draft,
  );
  assert.ok(result.ok);
  assert.deepEqual(result.blocks, [{ id: "a", type: "paragraph", text: "hi" }]);
});

test("an unknown block type or a malformed body is refused", () => {
  assert.ok(!parseBlocks([{ id: "a", type: "script", text: "x" }], draft).ok);
  assert.ok(!parseBlocks([{ id: "a", type: "paragraph", text: 42 }], draft).ok);
  assert.ok(!parseBlocks("not an array", draft).ok);
  assert.ok(!parseBlocks(null, draft).ok);
});

test("drafts may be unfinished; publishing names the block that is not", () => {
  const blocks = [
    { id: "a", type: "paragraph", text: "Intro" },
    { id: "b", type: "image", image: null, alt: "", caption: "", size: "normal" },
  ];
  assert.ok(parseBlocks(blocks, draft).ok);
  const result = parseBlocks(blocks, publish);
  assert.ok(!result.ok);
  assert.equal(result.message, "Block 2 (Picture): choose a picture, or remove the block.");
});

test("a published gallery needs two pictures", () => {
  const one = [{ id: "g", type: "gallery", caption: "", items: [{ image: { kind: "curated", key: "office" }, alt: "" }] }];
  assert.ok(parseBlocks(one, draft).ok);
  const result = parseBlocks(one, publish);
  assert.ok(!result.ok);
  assert.match(result.message, /^Block 1 \(Gallery\): add at least two/);
});

test("publishing an empty post is refused", () => {
  const result = parseBlocks([{ id: "a", type: "paragraph", text: "   " }, { id: "b", type: "divider" }], publish);
  assert.ok(!result.ok);
  assert.match(result.message, /Write something/);
});

test("pictures from other hosts and bad upload ids are refused", () => {
  const bad = [
    { kind: "unsplash", url: "https://evil.example/a.png" },
    { kind: "upload", id: "../../etc/passwd" },
    { kind: "curated", key: "footerLand" },
    { kind: "remote", url: "https://images.unsplash.com/x" },
  ];
  for (const image of bad) {
    const result = parseBlocks([{ id: "a", type: "image", image, alt: "", caption: "", size: "normal" }], draft);
    assert.ok(!result.ok, JSON.stringify(image));
  }
});

test("too-long text and oversized lists, tables and galleries are refused", () => {
  assert.ok(!parseBlocks([{ id: "a", type: "heading", level: 2, text: "x".repeat(201) }], draft).ok);
  assert.ok(!parseBlocks([{ id: "a", type: "list", style: "bullet", items: new Array(61).fill("x") }], draft).ok);
  assert.ok(!parseBlocks([{ id: "a", type: "table", rows: [new Array(9).fill("x")] }], draft).ok);
  assert.ok(!parseBlocks([{ id: "a", type: "table", rows: new Array(100_000).fill([]) }], draft).ok);
  const items = new Array(7).fill({ image: { kind: "curated", key: "office" }, alt: "" });
  assert.ok(!parseBlocks([{ id: "a", type: "gallery", items, caption: "" }], draft).ok);
  const message = parseBlocks([{ id: "a", type: "heading", level: 2, text: "x".repeat(201) }], draft);
  assert.ok(!message.ok);
  assert.match(message.message, /^Block 1 \(Heading\): the heading is too long/);
});

test("ragged tables are padded to the widest row", () => {
  const result = parseBlocks([{ id: "t", type: "table", rows: [["a", "b", "c"], ["d"]] }], draft);
  assert.ok(result.ok);
  assert.deepEqual(result.ok && result.blocks[0], { id: "t", type: "table", rows: [["a", "b", "c"], ["d", "", ""]] });
});

test("missing or duplicate ids are replaced", () => {
  const result = parseBlocks(
    [
      { id: "same", type: "divider" },
      { id: "same", type: "divider" },
      { type: "divider" },
    ],
    draft,
  );
  assert.ok(result.ok);
  const ids = result.blocks.map((b) => b.id);
  assert.equal(new Set(ids).size, 3);
  assert.equal(ids[0], "same");
});

test("page breaks split the post; empty pages are dropped", () => {
  const p = (id: string): Block => ({ id, type: "paragraph", text: id });
  const brk = (id: string): Block => ({ id, type: "pagebreak" });
  const pages = splitPages([brk("x"), p("a"), brk("y"), brk("z"), p("b"), brk("w")]);
  assert.deepEqual(pages.map((page) => page.map((b) => b.id)), [["a"], ["b"]]);
  assert.deepEqual(splitPages([]), [[]]);
});

test("table of contents: unique anchors across pages, with page numbers", () => {
  const blocks: Block[] = [
    { id: "h1", type: "heading", level: 2, text: "Tax **credits**" },
    { id: "p1", type: "paragraph", text: "x" },
    { id: "pb", type: "pagebreak" },
    { id: "h2", type: "heading", level: 3, text: "Tax credits" },
    { id: "h3", type: "heading", level: 2, text: "" },
  ];
  assert.deepEqual(tableOfContents(blocks), [
    { anchor: "tax-credits", text: "Tax credits", level: 2, page: 1 },
    { anchor: "tax-credits-2", text: "Tax credits", level: 3, page: 2 },
  ]);
  assert.equal(headingAnchors(blocks).has("h3"), false);
});

test("reading time counts the words in every text block, never zero", () => {
  assert.equal(readingMinutes([]), 1);
  const words = "word ".repeat(1100);
  assert.equal(readingMinutes([{ id: "a", type: "paragraph", text: words }]), 5);
});

test("upload ids are collected, and their sizes replaced from storage", () => {
  const blocks: Block[] = [
    { id: "a", type: "image", image: { kind: "upload", id: UPLOAD_ID, width: 1, height: 1 }, alt: "", caption: "", size: "normal" },
    { id: "b", type: "gallery", caption: "", items: [{ image: { kind: "upload", id: UPLOAD_ID, width: 5, height: 5 }, alt: "" }] },
  ];
  assert.deepEqual(uploadIds(blocks), [UPLOAD_ID]);
  const fixed = withUploadSizes(blocks, new Map([[UPLOAD_ID, { width: 2000, height: 1125 }]]));
  assert.deepEqual(fixed[0].type === "image" && fixed[0].image, { kind: "upload", id: UPLOAD_ID, width: 2000, height: 1125 });
  assert.deepEqual(fixed[1].type === "gallery" && fixed[1].items[0].image, { kind: "upload", id: UPLOAD_ID, width: 2000, height: 1125 });
});

test("new blocks start empty and valid as a draft", () => {
  for (const type of ["paragraph", "heading", "image", "gallery", "quote", "callout", "list", "table", "divider", "pagebreak"] as const) {
    assert.ok(parseBlocks([newBlock(type, "x")], draft).ok, type);
  }
});
