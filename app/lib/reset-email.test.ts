import test from "node:test";
import assert from "node:assert/strict";
import { resetHtml, resetSubject, resetText } from "./reset-email.ts";

const base = {
  name: "Cian Murphy",
  code: "04871523",
  firmName: "Ireland Fintax",
};

test("both parts carry the code", () => {
  assert.match(resetText(base), /04871523/);
  assert.match(resetHtml(base), /04871523/);
});

test("the subject says what the mail is for", () => {
  assert.equal(resetSubject(), "Your password reset code");
});

test("the code sits alone on its own line in the text part", () => {
  const line = resetText(base)
    .split("\n")
    .find((l) => l.includes(base.code));
  // Not "contains the code" but "is the code": a client that linkifies or
  // wraps the surrounding copy must not be able to take any of it with the
  // code, and the reader selects the line to copy it.
  assert.equal(line, base.code);
});

test("nothing in either part is a link", () => {
  // A reset mail is the most impersonated message a firm sends, so there is
  // deliberately nothing clickable for a phisher to imitate.
  for (const part of [resetText(base), resetHtml(base)]) {
    assert.doesNotMatch(part, /https?:\/\//);
    assert.doesNotMatch(part, /<a\b/);
    assert.doesNotMatch(part, /href=/);
  }
});

test("no digit count is stated, at any length the generator might use", () => {
  /* The length is one constant in lib/auth/reset-tokens.ts. Copy that counts
     the digits ("enter the 6-digit code") becomes a lie the moment it moves,
     and nothing would fail.

     Assert on the word `digit`, NOT on a spelled-out number: /eight/ matches
     `line-height` and `font-weight` in the inline CSS and would pass for the
     wrong reason. */
  for (const length of [6, 7, 8, 9, 10]) {
    const code = "1".repeat(length);
    for (const part of [resetText({ ...base, code }), resetHtml({ ...base, code })]) {
      assert.doesNotMatch(part, /digit/i);
      assert.doesNotMatch(part, /\b\d+-character\b/i);
    }
  }
});

test("both parts state the same expiry window and say it is single-use", () => {
  for (const part of [resetText(base), resetHtml(base)]) {
    assert.match(part, /15 minutes/);
    assert.match(part, /used once/);
  }
});

test("someone who did not ask is told ignoring it changes nothing", () => {
  for (const part of [resetText(base), resetHtml(base)]) {
    // No apostrophe in the match: it is escaped to &#39; in the HTML part.
    assert.match(part, /ask to reset your password, ignore this email/);
    assert.match(part, /password stays as it is/);
  }
});

test("the name and the code are HTML-escaped", () => {
  const html = resetHtml({
    ...base,
    name: `<script>alert("x")</script>`,
    code: "<b>99</b>",
  });
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<b>99<\/b>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;b&gt;99&lt;\/b&gt;/);
});

test("there is a plain-text alternative and it is not the HTML", () => {
  const text = resetText(base);
  assert.doesNotMatch(text, /<[a-z]/i);
  assert.match(text, /^Hi Cian,/);
  assert.match(text, /Ireland Fintax$/);
});

test("the greeting falls back when the account has no usable name", () => {
  assert.match(resetText({ ...base, name: "   " }), /^Hi there,/);
});
