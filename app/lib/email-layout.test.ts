import test from "node:test";
import assert from "node:assert/strict";
import {
  button,
  codeBlock,
  emailShell,
  escapeHtml,
  greetingName,
  paragraph,
  paragraphs,
  signOff,
} from "./email-layout.ts";

test("escapes every character that could break out of the body", () => {
  assert.equal(
    escapeHtml(`<script>alert("x" & 'y')</script>`),
    "&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;",
  );
});

test("escapes the ampersand first, so an entity is not double-encoded wrongly", () => {
  assert.equal(escapeHtml("Fish & Chips <Ltd>"), "Fish &amp; Chips &lt;Ltd&gt;");
});

test("a blank line starts a new paragraph, a single newline is a line break", () => {
  const html = paragraphs("one\ntwo\n\nthree");
  assert.equal(html.match(/<p /g)?.length, 2);
  assert.match(html, /one<br>two/);
  assert.match(html, /three/);
});

test("paragraph content is escaped", () => {
  assert.match(paragraph("<b>hi</b>"), /&lt;b&gt;hi&lt;\/b&gt;/);
  assert.doesNotMatch(paragraph("<b>hi</b>"), /<b>/);
});

test("a message typed with Windows line endings still splits into paragraphs", () => {
  // \r\n\r\n is two newlines with carriage returns between, so the split still
  // sees a blank line. The stray \r is harmless in HTML.
  assert.equal(paragraphs("one\r\n\r\ntwo").match(/<p /g)?.length, 2);
});

test("the button repeats the raw URL for clients that drop the anchor", () => {
  const html = button("https://example.ie/auth/confirm?token=abc", "Confirm");
  assert.equal(html.match(/https:\/\/example\.ie\/auth\/confirm\?token=abc/g)?.length, 3);
  assert.match(html, /Confirm<\/a>/);
});

test("the shell escapes the firm name and keeps the 600px table", () => {
  const html = emailShell({ firmName: "A & B <Ltd>", bodyHtml: "<p>body</p>" });
  assert.match(html, /A &amp; B &lt;Ltd&gt;/);
  assert.match(html, /width="600"/);
  assert.match(html, /<p>body<\/p>/);
});

test("the shell carries no <style> block or class attribute", () => {
  // Gmail strips <style>, and a class with no stylesheet behind it is dead
  // weight. Everything has to be an inline style.
  const html = emailShell({ firmName: "Ireland Fintax", bodyHtml: paragraph("hi") });
  assert.doesNotMatch(html, /<style/i);
  assert.doesNotMatch(html, /class=/i);
});

test("the greeting falls back to something that still reads as a sentence", () => {
  assert.equal(greetingName("Aoife Ni Bhriain"), "Aoife");
  assert.equal(greetingName("  Cian  "), "Cian");
  assert.equal(greetingName("   "), "there");
});

test("the sign-off escapes the firm name", () => {
  assert.match(signOff("Smith & Co"), /Smith &amp; Co/);
});

test("a code block escapes its content and offers nothing to click", () => {
  const html = codeBlock("<b>0123</b>");
  assert.match(html, /&lt;b&gt;0123&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<b>/);
  // Nothing clickable: a code email is the one a phisher imitates.
  assert.doesNotMatch(html, /<a\b|href=/);
});

test("a code block keeps the digits apart and inlines every style", () => {
  const html = codeBlock("04871523");
  assert.match(html, /letter-spacing:/);
  assert.match(html, /monospace/);
  // Inline styles only: Gmail strips <style> blocks.
  assert.doesNotMatch(html, /<style/);
  assert.match(html, /^<p style="/);
});
