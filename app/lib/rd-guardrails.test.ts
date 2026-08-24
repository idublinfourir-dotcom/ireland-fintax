/* Unit tests for R&D tax credit guardrails.
   Run: node --test app/lib/rd-guardrails.test.ts   (Node 22.6+ strips types) */

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRdConfig, type RawRdConfig } from "./rd-guardrails.ts";

const valid = (): RawRdConfig => ({
  ratePercent: 35,
  tradingDeductionPercent: 12.5,
  firstYearThresholdEur: 87_500,
  secondInstalmentFraction: 0.6,
});

test("accepts the statutory defaults", () => {
  const r = validateRdConfig(valid());
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.ratePercent, 35);
});

test("rejects non-finite numbers", () => {
  assert.equal(validateRdConfig({ ...valid(), ratePercent: NaN }).ok, false);
});

test("rejects out-of-range rate / deduction", () => {
  assert.equal(validateRdConfig({ ...valid(), ratePercent: 101 }).ok, false);
  assert.equal(validateRdConfig({ ...valid(), tradingDeductionPercent: -1 }).ok, false);
});

test("rejects a negative threshold", () => {
  assert.equal(validateRdConfig({ ...valid(), firstYearThresholdEur: -1 }).ok, false);
});

test("second-instalment fraction must be 0–1", () => {
  assert.equal(validateRdConfig({ ...valid(), secondInstalmentFraction: 1.5 }).ok, false);
  assert.equal(validateRdConfig({ ...valid(), secondInstalmentFraction: -0.1 }).ok, false);
  assert.equal(validateRdConfig({ ...valid(), secondInstalmentFraction: 0 }).ok, true);
  assert.equal(validateRdConfig({ ...valid(), secondInstalmentFraction: 1 }).ok, true);
});
