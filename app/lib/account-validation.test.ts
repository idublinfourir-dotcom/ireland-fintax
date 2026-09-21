import { test } from "node:test";
import assert from "node:assert/strict";
import {
  looksLikeCode,
  validateDisplayName,
  validatePassword,
} from "./account-validation.ts";

test("validateDisplayName rejects < 2 chars after trim", () => {
  assert.equal(validateDisplayName(" a "), "Please enter your name.");
  assert.equal(validateDisplayName(""), "Please enter your name.");
});

test("validateDisplayName accepts a real name", () => {
  assert.equal(validateDisplayName("  Jane Doe "), null);
});

test("validatePassword rejects < 8 chars", () => {
  assert.equal(
    validatePassword("short", "short"),
    "Password must be at least 8 characters.",
  );
});

test("validatePassword rejects a mismatched confirmation", () => {
  assert.equal(
    validatePassword("longenough1", "longenough2"),
    "Passwords do not match.",
  );
});

test("validatePassword accepts a valid, matching password", () => {
  assert.equal(validatePassword("longenough1", "longenough1"), null);
});

test("a reset code is accepted across a range of lengths, not one count", () => {
  /* The range is the point. Whether a code is CORRECT is decided by redeeming
     it; if this pinned the generator's current length, moving that constant
     would reject every code already in an inbox and it would look like the
     codes were wrong rather than the validator. */
  for (const length of [6, 7, 8, 9, 10]) {
    assert.ok(looksLikeCode("1".repeat(length)), `${length} digits`);
  }
});

test("a reset code outside that range is rejected", () => {
  assert.ok(!looksLikeCode("12345"));
  assert.ok(!looksLikeCode("12345678901"));
});

test("a reset code must be digits and nothing else", () => {
  for (const v of ["", "   ", "abcdefgh", "1234567a", "1234 5678", "-1234567"]) {
    assert.ok(!looksLikeCode(v), JSON.stringify(v));
  }
});

test("a reset code survives the whitespace a paste from a mail client brings", () => {
  assert.ok(looksLikeCode("  04871523  "));
  assert.ok(looksLikeCode("04871523\n"));
});

test("a leading zero is a real reset code, not a shorter one", () => {
  // The generator pads, so this is eight digits and must be accepted.
  assert.ok(looksLikeCode("00000001"));
});
