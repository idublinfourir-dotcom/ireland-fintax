/* Unit tests for the Ireland CGT engine.
   Run: node --test app/lib/ireland-cgt.test.ts   (Node 22.6+ strips types)

   Covers indexation relief (per-year multiplier), enhancement indexed on its
   own year, disposal at a loss, PPR proportional relief (incl. the deemed
   last-12-months guard), losses before exemption, the exemption clamp, the
   40%/15% special rates, the Entrepreneur Relief 10%/33% split at the €1.5m
   lifetime cap, payment-date branch, edge inputs, and the multiplier table. */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeCgt,
  parseCgtConfig,
  slugifyYearKey,
  isReviewDue,
  CGT_CONFIG_DEFAULT,
  CGT_MULTIPLIERS_DEFAULT,
} from "./ireland-cgt.ts";

const cfg = CGT_CONFIG_DEFAULT;
const base = {
  proceeds: 0,
  disposalCosts: 0,
  acquisitionCost: 0,
  acquisitionMultiplier: 1,
  enhancementCost: 0,
  enhancementMultiplier: 1,
  currentYearLosses: 0,
  broughtForwardLosses: 0,
  applyExemption: true,
  rateMode: "standard" as const,
};

test("indexation uplifts a pre-2003 cost (1995/96 = 1.277)", () => {
  const r = computeCgt(
    { ...base, proceeds: 40_000_000, acquisitionCost: 20_000_000, acquisitionMultiplier: 1.277 },
    cfg,
  );
  assert.equal(r.indexedAcquisition, 25_540_000);
  assert.equal(r.rawGain, 14_460_000);
});

test("no indexation for a 2003+ cost (multiplier 1.0)", () => {
  const r = computeCgt(
    { ...base, proceeds: 40_000_000, acquisitionCost: 20_000_000, acquisitionMultiplier: 1 },
    cfg,
  );
  assert.equal(r.rawGain, 20_000_000);
});

test("enhancement is indexed by its own multiplier", () => {
  const r = computeCgt(
    {
      ...base,
      proceeds: 500_000,
      acquisitionCost: 100_000,
      acquisitionMultiplier: 1.5,
      enhancementCost: 50_000,
      enhancementMultiplier: 1.2,
    },
    cfg,
  );
  assert.equal(r.indexedAcquisition, 150_000);
  assert.equal(r.indexedEnhancement, 60_000);
  assert.equal(r.allowableCost, 210_000);
  assert.equal(r.rawGain, 290_000);
});

test("disposal at a loss → isLoss, no tax", () => {
  const r = computeCgt({ ...base, proceeds: 80_000, acquisitionCost: 100_000 }, cfg);
  assert.equal(r.isLoss, true);
  assert.equal(r.disposalLoss, 20_000);
  assert.equal(r.totalTax, 0);
  assert.deepEqual(r.bands, []);
});

test("PPR full occupation exempts the whole gain", () => {
  const r = computeCgt(
    { ...base, proceeds: 400_000, acquisitionCost: 100_000, ppr: { monthsOwned: 120, monthsOccupied: 120 } },
    cfg,
  );
  assert.equal(r.exemptFractionPercent, 100);
  assert.equal(r.taxableGain, 0);
});

test("PPR partial: 60 occupied + 12 deemed of 120 owned = 60% exempt", () => {
  const r = computeCgt(
    { ...base, proceeds: 220_000, acquisitionCost: 100_000, ppr: { monthsOwned: 120, monthsOccupied: 60 } },
    cfg,
  );
  assert.equal(r.exemptFractionPercent, 60);
  assert.equal(r.pprRelief, 72_000); // 120k gain × 0.6
});

test("PPR deemed 12 months only applies if occupied at some point", () => {
  const r = computeCgt(
    { ...base, proceeds: 220_000, acquisitionCost: 100_000, ppr: { monthsOwned: 120, monthsOccupied: 0 } },
    cfg,
  );
  assert.equal(r.pprRelief, 0);
});

test("losses reduce the gain before the exemption", () => {
  const r = computeCgt(
    { ...base, proceeds: 200_000, acquisitionCost: 100_000, currentYearLosses: 40_000 },
    cfg,
  );
  assert.equal(r.lossesApplied, 40_000);
  assert.equal(r.gainAfterLosses, 60_000);
  assert.equal(r.taxableGain, 60_000 - 1_270);
});

test("exemption can't create a loss; small gain → 0 taxable", () => {
  const r = computeCgt({ ...base, proceeds: 101_000, acquisitionCost: 100_000 }, cfg);
  assert.equal(r.taxableGain, 0);
  assert.equal(r.exemptionApplied, 1_000);
  assert.equal(r.totalTax, 0);
});

test("40% and 15% special rates", () => {
  const a = computeCgt({ ...base, proceeds: 110_000, acquisitionCost: 100_000, rateMode: "rate40" }, cfg);
  assert.equal(a.bands[0].ratePercent, 40);
  assert.equal(a.taxableGain, 8_730); // 10k gain − 1,270 exemption
  assert.equal(a.bands[0].tax, 3_492); // 8,730 × 40%
  const b = computeCgt({ ...base, proceeds: 200_000, acquisitionCost: 100_000, rateMode: "rate15" }, cfg);
  assert.equal(b.bands[0].ratePercent, 15);
});

test("entrepreneur relief splits at the €1.5m cap", () => {
  const r = computeCgt({ ...base, proceeds: 2_001_270, acquisitionCost: 0, rateMode: "entrepreneur" }, cfg);
  assert.equal(r.taxableGain, 2_000_000);
  assert.equal(r.bands[0].amount, 1_500_000);
  assert.equal(r.bands[0].tax, 150_000); // 1.5m × 10%
  assert.equal(r.bands[1].amount, 500_000);
  assert.equal(r.bands[1].tax, 165_000); // 0.5m × 33%
  assert.equal(r.totalTax, 315_000);
});

test("entrepreneur cap reduced by prior lifetime use", () => {
  const r = computeCgt(
    { ...base, proceeds: 1_001_270, acquisitionCost: 0, rateMode: "entrepreneur", entrepreneurReliefUsedEur: 1_400_000 },
    cfg,
  );
  assert.equal(r.bands[0].amount, 100_000); // remaining cap
  assert.equal(r.bands[1].amount, 900_000);
});

test("payment date branch: Nov vs Dec", () => {
  const nov = computeCgt({ ...base, proceeds: 200_000, acquisitionCost: 100_000, disposalMonth: 11 }, cfg);
  const dec = computeCgt({ ...base, proceeds: 200_000, acquisitionCost: 100_000, disposalMonth: 12 }, cfg);
  assert.match(nov.paymentDue ?? "", /15 December/);
  assert.match(dec.paymentDue ?? "", /31 January/);
});

test("negative inputs clamp to zero", () => {
  const r = computeCgt({ ...base, proceeds: -5, acquisitionCost: -5 }, cfg);
  assert.equal(r.proceeds, 0);
  assert.equal(r.totalTax, 0);
});

test("multiplier table has 29 rows, 1974/75 first at 7.528, 2002 last", () => {
  assert.equal(CGT_MULTIPLIERS_DEFAULT.length, 29);
  assert.equal(CGT_MULTIPLIERS_DEFAULT[0].multiplier, 7.528);
  assert.equal(CGT_MULTIPLIERS_DEFAULT.at(-1)?.yearKey, "2002");
  assert.equal(CGT_MULTIPLIERS_DEFAULT.at(-1)?.multiplier, 1.049);
});

/* ---------- parseCgtConfig (loader validation) ---------- */

test("parseCgtConfig accepts a valid object", () => {
  const c = parseCgtConfig({
    standardRatePercent: 33,
    annualExemptionEur: 1270,
    entrepreneurRatePercent: 10,
    entrepreneurLifetimeCapEur: 1_500_000,
  });
  assert.deepEqual(c, CGT_CONFIG_DEFAULT);
});

test("parseCgtConfig rejects missing / out-of-range / non-object", () => {
  assert.equal(parseCgtConfig({ standardRatePercent: 33 }), null);
  assert.equal(
    parseCgtConfig({
      standardRatePercent: 150,
      annualExemptionEur: 1270,
      entrepreneurRatePercent: 10,
      entrepreneurLifetimeCapEur: 1_500_000,
    }),
    null,
  );
  assert.equal(parseCgtConfig(null), null);
  assert.equal(parseCgtConfig("nope"), null);
});

/* ---------- slugifyYearKey (admin add-year) ---------- */

test("slugifyYearKey derives a stable key from a label", () => {
  assert.equal(slugifyYearKey("2003"), "2003");
  assert.equal(slugifyYearKey("2003/04"), "2003-04");
  assert.equal(slugifyYearKey("  Pre 1974 "), "pre-1974");
  assert.equal(slugifyYearKey("2010/11"), "2010-11");
  assert.equal(slugifyYearKey("!!!"), "");
});

test("isReviewDue flags rates older than 12 months", () => {
  const now = Date.UTC(2027, 0, 1);
  assert.equal(isReviewDue("2025-06-01T00:00:00Z", now), true); // ~19 months
  assert.equal(isReviewDue("2026-11-01T00:00:00Z", now), false); // ~2 months
  assert.equal(isReviewDue(null, now), false); // unknown → don't nag
  assert.equal(isReviewDue("not-a-date", now), false);
});
