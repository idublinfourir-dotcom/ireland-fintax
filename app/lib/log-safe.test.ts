/* Run: node --test app/lib/log-safe.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { maskEmail } from "./log-safe.ts";

test("maskEmail keeps the first letter and the domain", () => {
  assert.equal(maskEmail("jane.doe@gmail.com"), "j***@gmail.com");
  assert.equal(maskEmail("a@b.ie"), "a***@b.ie");
});

test("maskEmail hides anything that is not an address", () => {
  assert.equal(maskEmail(""), "***");
  assert.equal(maskEmail("no-at-sign"), "***");
  assert.equal(maskEmail("@domain.ie"), "***");
  assert.equal(maskEmail("trailing@"), "***");
});
