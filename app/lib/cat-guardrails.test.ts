/* Unit tests for the CAT admin guardrails. Run: node --test app/lib/cat-guardrails.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCatConfig, type RawCatConfig } from "./cat-guardrails.ts";
import { CAT_CONFIG_DEFAULT } from "./ireland-cat.ts";

const good: RawCatConfig = {
  ratePercent: 33,
  thresholds: { groupA: 400_000, groupB: 40_000, groupC: 20_000 },
  smallGiftExemptionEur: 3_000,
  reliefs: { agriculturalPercent: 90, businessPercent: 90, dwellingHousePercent: 100 },
};

test("accepts the code default, returns typed config", () => {
  const r = validateCatConfig(good);
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value, CAT_CONFIG_DEFAULT);
});

test("rejects a rate outside 0–100", () => {
  const r = validateCatConfig({ ...good, ratePercent: 120 });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.message, /rate/i);
});

test("rejects a negative threshold", () => {
  const r = validateCatConfig({ ...good, thresholds: { groupA: -1, groupB: 40_000, groupC: 20_000 } });
  assert.equal(r.ok, false);
});

test("rejects a relief percent over 100", () => {
  const r = validateCatConfig({
    ...good,
    reliefs: { agriculturalPercent: 90, businessPercent: 90, dwellingHousePercent: 150 },
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.message, /relief/i);
});

test("rejects a non-number small gift exemption", () => {
  const r = validateCatConfig({ ...good, smallGiftExemptionEur: Number.NaN });
  assert.equal(r.ok, false);
});
