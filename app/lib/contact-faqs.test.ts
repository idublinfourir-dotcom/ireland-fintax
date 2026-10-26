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

/* Each language carries its own FAQ copy and keywords (messages/contact.ts),
   paired by index with the hrefs above, as the contact form pairs them. */
const { contactMessages } = await import("./messages/contact.ts");
const { LOCALES } = await import("./i18n.ts");
const localFaqs = (locale: (typeof LOCALES)[number]): typeof CONTACT_FAQS =>
  contactMessages[locale].faqs.map((f, i) => ({ ...f, href: CONTACT_FAQS[i].href }));

test("in every language, each FAQ's own keywords surface that FAQ", () => {
  for (const locale of LOCALES) {
    const faqs = localFaqs(locale);
    for (const faq of faqs) {
      for (const k of faq.keywords) {
        const hits = getRelatedFaqs(`… ${k} …`, faqs, faqs.length).map((f) => f.href);
        assert.ok(hits.includes(faq.href), `${locale}: "${k}" should surface ${faq.href}`);
      }
    }
  }
});

test("Bangla and Hindi questions surface the right calculator", () => {
  const hrefs = (locale: "bn" | "hi", text: string) => getRelatedFaqs(text, localFaqs(locale)).map((f) => f.href);
  assert.ok(hrefs("bn", "আমি শেয়ার বিক্রি করেছি, কত কর দিতে হবে?").includes("/tools/ireland-cgt"));
  assert.ok(hrefs("bn", "বাবার কাছ থেকে উত্তরাধিকার পেয়েছি").includes("/tools/ireland-cat"));
  assert.ok(hrefs("hi", "क्या मुझे वैट के लिए पंजीकरण कराना होगा?").includes("/tools/ireland-vat"));
  assert.ok(hrefs("hi", "मेरी कंपनी पर कॉर्पोरेशन टैक्स कितना है?").includes("/tools/ireland-corporation-tax"));
});

test("a letter typed as one code point matches the nukta form, and back", () => {
  // শেয়ার (shares): য় as U+09DF, or য U+09AF + nukta U+09BC.
  const one = "আমি শেয়ার বিক্রি করেছি";
  const two = "আমি শেয়ার বিক্রি করেছি";
  for (const text of [one, two]) {
    assert.ok(getRelatedFaqs(text, localFaqs("bn")).some((f) => f.href === "/tools/ireland-cgt"), JSON.stringify(text));
  }
  // तोहफ़ा (gift): फ़ as U+095E, or फ U+092B + nukta U+093C.
  for (const text of ["मुझे तोहफ़ा मिला", "मुझे तोहफ़ा मिला"]) {
    assert.ok(getRelatedFaqs(text, localFaqs("hi")).some((f) => f.href === "/tools/ireland-cat"), JSON.stringify(text));
  }
  // And a keyword written precomposed still matches typed text in the other form.
  const custom = [{ q: "q", a: "a", href: "/x", keywords: ["শেয়ার"] }];
  assert.equal(getRelatedFaqs(two, custom).length, 1);
});
