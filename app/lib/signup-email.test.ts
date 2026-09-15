import test from "node:test";
import assert from "node:assert/strict";
import { confirmHtml, confirmSubject, confirmText } from "./signup-email.ts";

const base = {
  name: "Cian Murphy",
  verifyUrl: "https://www.irelandfintax.ie/auth/confirm?token=deadbeef",
  firmName: "Ireland Fintax",
};

test("both parts carry the confirmation link", () => {
  assert.match(confirmText(base), /auth\/confirm\?token=deadbeef/);
  assert.match(confirmHtml(base), /auth\/confirm\?token=deadbeef/);
});

test("the subject says what the mail is for", () => {
  assert.equal(confirmSubject(), "Confirm your email address");
});

test("both parts state the same expiry window", () => {
  assert.match(confirmText(base), /24 hours/);
  assert.match(confirmHtml(base), /24 hours/);
});

test("someone who did not sign up is told to ignore it", () => {
  assert.match(confirmText(base), /ignore this email/);
  assert.match(confirmHtml(base), /ignore this email/);
});
