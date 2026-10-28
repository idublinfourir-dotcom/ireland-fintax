/* Run: node --test app/lib/tax-rates-guardrails.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { RATES_BY_YEAR, type YearRates } from "./ireland-income-tax.ts";
import { TAX_RATE_FIELDS, changedFields, checkYearRates } from "./tax-rates-guardrails.ts";

const copy = (r: YearRates): YearRates => structuredClone(r);

test("every year's own rates pass", () => {
  for (const r of Object.values(RATES_BY_YEAR)) assert.equal(checkYearRates(r), null, `year ${r.year}`);
});

test("a band typed a digit short is caught", () => {
  const r = copy(RATES_BY_YEAR[2026]);
  r.incomeTax.srcop.single = 4_400;
  assert.match(checkYearRates(r) ?? "", /SRCOP \(single\) looks wrong/);
});

test("a credit typed a digit long is caught", () => {
  const r = copy(RATES_BY_YEAR[2026]);
  r.incomeTax.credits.employeePaye = 20_000;
  assert.match(checkYearRates(r) ?? "", /Employee PAYE credit looks wrong/);
});

test("swapped income tax rates are caught", () => {
  const r = copy(RATES_BY_YEAR[2026]);
  r.incomeTax.standardRate = 0.4;
  r.incomeTax.higherRate = 0.2;
  assert.match(checkYearRates(r) ?? "", /must be lower/);
});

test("the preview lists only what changed, in display units", () => {
  const before = RATES_BY_YEAR[2026];
  const after = copy(before);
  after.incomeTax.credits.personalSingle = before.incomeTax.credits.personalSingle + 50;
  after.usc.bands[1].rate = 0.025;
  const diff = changedFields(before, after);
  assert.deepEqual(diff.map((d) => d.label), ["Personal credit (single)", "USC band 2 rate"]);
  assert.equal(diff[1].to, "2.5%");
  assert.deepEqual(changedFields(before, copy(before)), []);
});

test("every field has a unique form key", () => {
  const keys = TAX_RATE_FIELDS.map((f) => f.key);
  assert.equal(new Set(keys).size, keys.length);
});
