/* Unit tests for capital-allowances guardrails.
   Run: node --test app/lib/ca-guardrails.test.ts   (Node 22.6+ strips types) */

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCaConfig, type RawCaConfig } from "./ca-guardrails.ts";
import { ASSET_CLASSES } from "./ireland-capital-allowances.ts";

/** A valid raw form payload built from the code defaults. */
const valid = (): RawCaConfig => ({
  classes: ASSET_CLASSES.map((c) => ({ key: c.key, ratePercent: c.ratePercent, years: c.years })),
  motorCapEur: 24_000,
  tradingCtPercent: 12.5,
});

test("accepts the statutory defaults and merges code prose", () => {
  const r = validateCaConfig(valid());
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.classes.length, ASSET_CLASSES.length);
    // Prose/flags are pulled from code, not the raw form.
    const pm = r.value.classes.find((c) => c.key === "plant-machinery");
    assert.ok(pm && pm.note.length > 0);
    const aca = r.value.classes.find((c) => c.key === "energy-efficient");
    assert.equal(aca?.firstYearFull, true);
    const car = r.value.classes.find((c) => c.key === "motor-vehicle");
    assert.equal(car?.co2Restricted, true);
  }
});

test("rejects an out-of-range rate", () => {
  const c = valid();
  c.classes[0].ratePercent = 150;
  assert.equal(validateCaConfig(c).ok, false);
});

test("rejects non-integer / zero years", () => {
  const a = valid();
  a.classes[0].years = 8.5;
  assert.equal(validateCaConfig(a).ok, false);
  const b = valid();
  b.classes[0].years = 0;
  assert.equal(validateCaConfig(b).ok, false);
});

test("rejects a negative car cap", () => {
  assert.equal(validateCaConfig({ ...valid(), motorCapEur: -1 }).ok, false);
});

test("rejects an out-of-range trading CT rate", () => {
  assert.equal(validateCaConfig({ ...valid(), tradingCtPercent: 101 }).ok, false);
});

test("rejects a missing asset row", () => {
  const c = valid();
  c.classes = c.classes.filter((x) => x.key !== "energy-efficient");
  assert.equal(validateCaConfig(c).ok, false);
});
