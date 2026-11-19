/* Unit tests for the stamp duty calculator.
   Run: node --test app/lib/ireland-stamp-duty.test.ts   (Node 22.6+ strips types)

   Expected figures are Revenue's own examples where there is one (Stamp Duty
   Manual Schedule 1: two houses for €1.6m pay €26,000; Joan's shop with a
   flat; the VAT page's €400,000 new house) and hand-worked otherwise. Each
   part's duty is rounded down to the euro (SDCA Sch.1, as set by FA 2024
   s.90 and FA 2012). */

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStampDuty, type StampDutyInput } from "./ireland-stamp-duty.ts";
import { cpuMs } from "./cpu-time.ts";

const duty = (over: Partial<StampDutyInput>) =>
  computeStampDuty({ kind: "residential", price: 0, residentialPart: 0, vat: "none", ...over });

test("Homes: 1% to €1m, 2% to €1.5m, 6% above, each on its own slice", () => {
  assert.equal(duty({ price: 350_000 }).total, 3_500);
  assert.equal(duty({ price: 1_000_000 }).total, 10_000);
  assert.equal(duty({ price: 1_000_001 }).total, 10_000);
  assert.equal(duty({ price: 1_500_000 }).total, 20_000);
  assert.equal(duty({ price: 2_000_000 }).total, 50_000);
});

test("Revenue's example: €1,600,000 pays €26,000 in three slices", () => {
  const r = duty({ price: 1_600_000 });
  assert.deepEqual(
    r.slices.map((s) => [s.amount, s.rate, s.duty]),
    [
      [1_000_000, 0.01, 10_000],
      [500_000, 0.02, 10_000],
      [100_000, 0.06, 6_000],
    ],
  );
  assert.equal(r.total, 26_000);
  assert.equal(r.effectiveRate, 0.01625);
});

test("New house: duty on the price without 13.5% VAT (Revenue's €400,000 example)", () => {
  const r = duty({ price: 400_000, vat: "house" });
  assert.ok(Math.abs(r.residential - 352_422.9) < 0.011, String(r.residential));
  assert.equal(r.total, 3_524);
  assert.ok(Math.abs(r.rounding - 0.2291) < 1e-9, String(r.rounding));
  assert.equal(r.vat, 47_577.09);
});

test("New qualifying apartment: 9% VAT comes out first", () => {
  const r = duty({ price: 327_000, vat: "apartment" });
  assert.equal(r.residential, 300_000);
  assert.equal(r.vat, 27_000);
  assert.equal(r.total, 3_000);
});

test("Non-residential: 7.5% of the whole price, VAT choice ignored", () => {
  const r = duty({ kind: "nonResidential", price: 500_000, vat: "house" });
  assert.equal(r.total, 37_500);
  assert.equal(r.vat, 0);
  assert.equal(r.residential, 0);
});

test("Mixed: Revenue's shop with a flat, €220,000 split €100,000 home / €120,000 shop", () => {
  const r = duty({ kind: "mixed", price: 220_000, residentialPart: 100_000 });
  assert.equal(r.nonResidential, 120_000);
  assert.equal(r.total, 1_000 + 9_000);
});

test("Mixed: the two parts are not added together for the home bands", () => {
  const r = duty({ kind: "mixed", price: 2_000_000, residentialPart: 1_600_000 });
  assert.equal(r.total, 26_000 + 30_000);
});

test("Mixed: a home part above the price is capped at the price", () => {
  const r = duty({ kind: "mixed", price: 300_000, residentialPart: 900_000 });
  assert.equal(r.residential, 300_000);
  assert.equal(r.nonResidential, 0);
  assert.equal(r.total, 3_000);
});

test("Rounded down to the euro, never up, and each part on its own", () => {
  /* €999.9999 exactly: rounding to the cent first would wrongly give €1,000. */
  assert.equal(duty({ price: 99_999.99 }).total, 999);
  /* Home €100,050 → €1,000.50 → €1,000; other €10,010 → €750.75 → €750.
     Rounding the sum instead would give €1,751. */
  const r = duty({ kind: "mixed", price: 110_060, residentialPart: 100_050 });
  assert.equal(r.total, 1_750);
  assert.ok(Math.abs(r.rounding - 1.25) < 1e-9, String(r.rounding));
  assert.equal(duty({ kind: "nonResidential", price: 13.33 }).total, 0);
});

test("Hostile input gives €0, never NaN or Infinity", () => {
  for (const bad of [-5, Number.NaN, Infinity, -Infinity]) {
    for (const kind of ["residential", "nonResidential", "mixed"] as const) {
      const r = duty({ kind, price: bad, residentialPart: bad, vat: "house" });
      assert.equal(r.total, 0);
      assert.equal(r.effectiveRate, 0);
      assert.deepEqual(r.slices, []);
    }
  }
  const huge = duty({ price: 1e300 });
  assert.ok(Number.isFinite(huge.total));
});

test("Performance: 100,000 calculations in under 250 ms", () => {
  const start = cpuMs();
  for (let i = 0; i < 100_000; i++) {
    duty({ kind: i % 3 === 0 ? "mixed" : "residential", price: i * 37, residentialPart: i * 20, vat: i % 2 ? "house" : "none" });
  }
  const ms = cpuMs() - start;
  assert.ok(ms < 250, `took ${ms.toFixed(1)} ms`);
});
