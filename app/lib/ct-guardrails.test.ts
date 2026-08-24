/* Unit tests for corporation-tax guardrails.
   Run: node --test app/lib/ct-guardrails.test.ts   (Node 22.6+ strips types) */

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCtConfig } from "./ct-guardrails.ts";

test("accepts the statutory defaults", () => {
  const r = validateCtConfig({ tradingPercent: 12.5, passivePercent: 25 });
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value, { tradingPercent: 12.5, passivePercent: 25 });
});

test("accepts boundary values 0 and 100", () => {
  assert.equal(validateCtConfig({ tradingPercent: 0, passivePercent: 100 }).ok, true);
});

test("rejects non-finite numbers", () => {
  assert.equal(validateCtConfig({ tradingPercent: NaN, passivePercent: 25 }).ok, false);
  assert.equal(validateCtConfig({ tradingPercent: 12.5, passivePercent: Infinity }).ok, false);
});

test("rejects out-of-range trading rate", () => {
  assert.equal(validateCtConfig({ tradingPercent: -1, passivePercent: 25 }).ok, false);
  assert.equal(validateCtConfig({ tradingPercent: 101, passivePercent: 25 }).ok, false);
});

test("rejects out-of-range passive rate", () => {
  assert.equal(validateCtConfig({ tradingPercent: 12.5, passivePercent: -0.5 }).ok, false);
  assert.equal(validateCtConfig({ tradingPercent: 12.5, passivePercent: 150 }).ok, false);
});
