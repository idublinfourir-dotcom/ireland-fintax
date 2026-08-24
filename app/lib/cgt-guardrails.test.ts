/* Unit tests for the CGT guardrails. Run: node --test app/lib/cgt-guardrails.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMultiplier, validateCgtConfig } from "./cgt-guardrails.ts";

test("validateMultiplier accepts sane values, rejects the rest", () => {
  assert.equal(validateMultiplier(1.277), true);
  assert.equal(validateMultiplier(7.528), true);
  assert.equal(validateMultiplier(0), false);
  assert.equal(validateMultiplier(-1), false);
  assert.equal(validateMultiplier(51), false);
  assert.equal(validateMultiplier(Number.NaN), false);
});

test("validateCgtConfig accepts a valid config", () => {
  const r = validateCgtConfig({
    standardRatePercent: 33,
    annualExemptionEur: 1270,
    entrepreneurRatePercent: 10,
    entrepreneurLifetimeCapEur: 1_500_000,
  });
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.value.standardRatePercent, 33);
});

test("validateCgtConfig rejects out-of-range values with a message", () => {
  const overRate = validateCgtConfig({
    standardRatePercent: 150,
    annualExemptionEur: 1270,
    entrepreneurRatePercent: 10,
    entrepreneurLifetimeCapEur: 1_500_000,
  });
  assert.equal(overRate.ok, false);
  assert.equal(overRate.ok === false && /0–100/.test(overRate.message), true);

  const negExemption = validateCgtConfig({
    standardRatePercent: 33,
    annualExemptionEur: -5,
    entrepreneurRatePercent: 10,
    entrepreneurLifetimeCapEur: 1_500_000,
  });
  assert.equal(negExemption.ok, false);
});
