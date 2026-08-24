import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDisplayName, validatePassword } from "./account-validation.ts";

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
