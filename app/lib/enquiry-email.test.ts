import test from "node:test";
import assert from "node:assert/strict";
import { ackHtml, ackSubject, ackText } from "./enquiry-email.ts";

const base = { firmName: "Irish Fintax" };

test("the subject reads as a confirmation, not as an alert", () => {
  assert.equal(ackSubject(), "We've received your question");
});

test("the plain-text part is exactly the fixed message", () => {
  assert.equal(
    ackText(base),
    "Hi there,\n\nThanks for your question. It has reached us, and a real person will reply by email.\n\nIrish Fintax",
  );
});

test("the HTML part carries the same greeting, line and sign-off", () => {
  const html = ackHtml(base);
  assert.match(html, /Hi there,/);
  assert.match(html, /a real person will reply by email/);
  assert.match(html, /Irish Fintax/);
});

test("no turnaround is promised: the site is free and makes no service level", () => {
  for (const out of [ackText(base), ackHtml(base)]) assert.doesNotMatch(out, /working day|hours?\b|within/i);
});

/* M1: the form is public and the recipient is whatever address was typed, so
   anything echoed would let anyone mail their own words from the firm's box. */
test("nothing the visitor typed can reach the email, in either part", () => {
  const typed = {
    ...base,
    name: "Visit evil.example",
    email: "victim@example.com",
    company: "Click http://evil.example/login",
    service: "Reset your password at evil.example",
    message: "Your account is locked: http://evil.example",
  };
  for (const out of [ackText(typed), ackHtml(typed)]) {
    assert.doesNotMatch(out, /evil\.example|victim@|locked/);
  }
  // Extra keys change nothing at all.
  assert.equal(ackText(typed), ackText(base));
  assert.equal(ackHtml(typed), ackHtml(base));
});

test("the firm name is escaped in the HTML part", () => {
  const html = ackHtml({ firmName: "A & <B>" });
  assert.match(html, /A &amp; &lt;B&gt;/);
  assert.doesNotMatch(html, /<B>/);
});
