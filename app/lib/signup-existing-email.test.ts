import test from "node:test";
import assert from "node:assert/strict";
import {
  existingAccountHtml,
  existingAccountSubject,
  existingAccountText,
} from "./signup-existing-email.ts";

const base = {
  name: "Cian Murphy",
  loginUrl: "https://www.irelandfintax.ie/login",
  resetUrl: "https://www.irelandfintax.ie/forgot-password",
  firmName: "Ireland Fintax",
};

test("both parts point at signing in and at resetting", () => {
  for (const part of [existingAccountText(base), existingAccountHtml(base)]) {
    assert.match(part, /irelandfintax\.ie\/login/);
    assert.match(part, /irelandfintax\.ie\/forgot-password/);
  }
});

test("the subject says what happened", () => {
  assert.equal(existingAccountSubject(), "You already have an account");
});

test("it never carries a password, a code or a token", () => {
  /* This goes to an address that already has an account. It is a pointer back
     to the sign-in page, not a credential, and must never become one. */
  for (const part of [existingAccountText(base), existingAccountHtml(base)]) {
    assert.doesNotMatch(part, /token=/i);
    assert.doesNotMatch(part, /\bcode\b/i);
    assert.doesNotMatch(part, /password is\b|your password:/i);
  }
});

test("someone who did not sign up is told nothing changed", () => {
  for (const part of [existingAccountText(base), existingAccountHtml(base)]) {
    assert.match(part, /No new account was created/);
    assert.match(part, /password has not changed/);
  }
});

test("the name is HTML-escaped", () => {
  const html = existingAccountHtml({ ...base, name: `<script>alert("x")</script>` });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("there is a plain-text alternative and it is not the HTML", () => {
  const text = existingAccountText(base);
  assert.doesNotMatch(text, /<[a-z]/i);
  assert.match(text, /^Hi Cian,/);
  assert.match(text, /Ireland Fintax$/);
});

test("the greeting falls back when the account has no usable name", () => {
  assert.match(existingAccountText({ ...base, name: "  " }), /^Hi there,/);
});
