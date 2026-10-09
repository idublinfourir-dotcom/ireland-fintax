/* Unit tests for blog inline formatting.
   Run: node --test app/lib/inline-format.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInline, parseLines, safeHref } from "./inline-format.ts";

const text = (value: string) => ({ type: "text", value });

test("bold, italic and code", () => {
  assert.deepEqual(parseInline("**bold** and *it* and `x = 1`"), [
    { type: "strong", children: [text("bold")] },
    text(" and "),
    { type: "em", children: [text("it")] },
    text(" and "),
    { type: "code", value: "x = 1" },
  ]);
  assert.deepEqual(parseInline("__also bold__ _and italic_"), [
    { type: "strong", children: [text("also bold")] },
    text(" "),
    { type: "em", children: [text("and italic")] },
  ]);
});

test("arithmetic and snake_case stay literal", () => {
  assert.deepEqual(parseInline("2 * 3 * 4"), [text("2 * 3 * 4")]);
  assert.deepEqual(parseInline("file_name_here"), [text("file_name_here")]);
  assert.deepEqual(parseInline("an * unmatched star"), [text("an * unmatched star")]);
});

test("backslash escapes a marker", () => {
  assert.deepEqual(parseInline("\\*not italic\\*"), [text("*not italic*")]);
});

test("links, with the label parsed and external links flagged", () => {
  assert.deepEqual(parseInline("See [**Revenue**](https://www.revenue.ie)."), [
    text("See "),
    {
      type: "link",
      href: "https://www.revenue.ie",
      external: true,
      children: [{ type: "strong", children: [text("Revenue")] }],
    },
    text("."),
  ]);
  assert.deepEqual(parseInline("[the CGT calculator](/tools/ireland-cgt)"), [
    {
      type: "link",
      href: "/tools/ireland-cgt",
      external: false,
      children: [text("the CGT calculator")],
    },
  ]);
});

test("an unsafe link target renders as its text alone", () => {
  assert.deepEqual(parseInline("[click](javascript:alert(1))"), [
    text("[click](javascript:alert(1))"),
  ]);
  assert.deepEqual(parseInline("[click](javascript:void)"), [text("click")]);
  assert.deepEqual(parseInline("[x](//evil.example)"), [text("x")]);
});

test("bare https links, without trailing punctuation", () => {
  assert.deepEqual(parseInline("Go to https://www.revenue.ie."), [
    text("Go to "),
    {
      type: "link",
      href: "https://www.revenue.ie",
      external: true,
      children: [text("https://www.revenue.ie")],
    },
    text("."),
  ]);
});

test("a URL used as a link label does not nest a second link", () => {
  const [link] = parseInline("[https://revenue.ie](https://revenue.ie)");
  assert.equal(link.type, "link");
  assert.deepEqual(link.type === "link" && link.children, [text("https://revenue.ie")]);
});

test("raw HTML is kept as literal text, and newlines become breaks", () => {
  assert.deepEqual(parseLines('<script>alert("x")</script>\r\n<img src=x onerror=alert(1)>'), [
    text('<script>alert("x")</script>'),
    { type: "break" },
    text("<img src=x onerror=alert(1)>"),
  ]);
});

test("safeHref allows http(s), mailto, relative paths and anchors only", () => {
  assert.ok(safeHref("https://www.revenue.ie/en/"));
  assert.ok(safeHref("mailto:hello@irelandfintax.ie"));
  assert.ok(safeHref("/blog"));
  assert.ok(safeHref("#tax-credits"));
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("JAVASCRIPT:alert(1)"), null);
  assert.equal(safeHref("data:text/html,hi"), null);
  assert.equal(safeHref("//evil.example"), null);
});

test("pathological input parses in linear time", () => {
  const started = Date.now();
  parseInline("*".repeat(50_000));
  parseInline("_a".repeat(25_000));
  parseInline("`".repeat(50_000));
  parseInline("[".repeat(50_000));
  assert.ok(Date.now() - started < 1_000, "parsing took too long");
});
