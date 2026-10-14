/* Unit tests for the news agent's note to the admins.
   Run: node --test app/lib/news-email.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { newsDigestHtml, newsDigestSubject, newsDigestText } from "./news-email.ts";

const input = {
  drafts: [
    { title: "Rent credit rises <for> 2027", flagCount: 2 },
    { title: "VAT on medical services", flagCount: 0 },
  ],
  reviewUrl: "https://www.irishfintax.ie/admin/posts?filter=review",
  siteName: "Irish Fintax",
};

test("subject counts the drafts", () => {
  assert.equal(newsDigestSubject(input), "2 news drafts are waiting for review");
  assert.equal(newsDigestSubject({ ...input, drafts: [input.drafts[1]] }), "1 news draft is waiting for review");
});

test("text lists titles with their checks and the review link, and says nothing is live", () => {
  const text = newsDigestText(input);
  assert.match(text, /Nothing is published until you review/);
  assert.match(text, /- Rent credit rises <for> 2027 \(2 things to check\)/);
  assert.match(text, /- VAT on medical services\n/);
  assert.match(text, /Review them: https:\/\/www\.irishfintax\.ie\/admin\/posts\?filter=review/);
});

test("HTML escapes titles and carries the button", () => {
  const html = newsDigestHtml(input);
  assert.match(html, /Rent credit rises &lt;for&gt; 2027/);
  assert.doesNotMatch(html, /<for>/);
  assert.match(html, /Review the drafts/);
});
