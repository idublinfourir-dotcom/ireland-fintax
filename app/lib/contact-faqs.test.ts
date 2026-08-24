/* Unit tests for the contact-form related-FAQ matcher.
   Run: node --test app/lib/contact-faqs.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { getRelatedFaqs, CONTACT_FAQS } from "./contact-faqs.ts";

test("empty / whitespace message → no FAQs", () => {
  assert.deepEqual(getRelatedFaqs(""), []);
  assert.deepEqual(getRelatedFaqs("   "), []);
});

test("matches on a keyword substring, case-insensitive", () => {
  const r = getRelatedFaqs("Do I need to register for VAT?");
  assert.ok(r.length >= 1);
  assert.ok(r.every((f) => CONTACT_FAQS.includes(f)));
  assert.ok(r.some((f) => f.href === "/tools/ireland-vat"));
});

test("capital gains phrasing surfaces the CGT tool", () => {
  const r = getRelatedFaqs("capital gains tax on selling a rental property");
  assert.ok(r.some((f) => f.href === "/tools/ireland-cgt"));
});

test("gift / inheritance phrasing surfaces the CAT tool", () => {
  const r = getRelatedFaqs("my father wants to gift me the family farm");
  assert.ok(r.some((f) => f.href === "/tools/ireland-cat"));
});

test("no keyword hit → empty", () => {
  assert.deepEqual(getRelatedFaqs("hello there, just saying hi"), []);
});

test("caps results at 2 even when more match", () => {
  // A message stuffed with many topic keywords.
  const r = getRelatedFaqs("vat, audit, payroll, corporation tax, capital gains, inheritance");
  assert.equal(r.length, 2);
});

test("every FAQ has q, a, href and at least one keyword", () => {
  for (const f of CONTACT_FAQS) {
    assert.ok(f.q.trim().length > 0);
    assert.ok(f.a.trim().length > 0);
    assert.ok(f.href.startsWith("/"));
    assert.ok(Array.isArray(f.keywords) && f.keywords.length > 0);
  }
});
