/* Unit tests for the Ireland CGT engine.
   Run: node --test app/lib/ireland-cgt.test.ts   (Node 22.6+ strips types)

   Covers indexation relief (per-year multiplier), enhancement indexed on its
   own year, disposal at a loss, PPR proportional relief (incl. the deemed
   last-12-months guard), losses before exemption, the exemption clamp, the
   40%/15% special rates, the Entrepreneur Relief 10%/31% split at the €1.5m
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

/* s.556(4) TCA 1997: indexation can't turn a gain into a loss or make a loss
   bigger. €100k bought in 1995/96 (×1.277) is €127,700 indexed. */
const indexed = { ...base, acquisitionCost: 100_000, acquisitionMultiplier: 1.277 };

test("s.556(4): a gain above the indexed cost is indexed as normal", () => {
  const r = computeCgt({ ...indexed, proceeds: 200_000 }, cfg);
  assert.equal(r.allowableCost, 127_700);
  assert.equal(r.rawGain, 72_300);
});

test("s.556(4): a real gain that indexation would turn into a loss is nil", () => {
  const r = computeCgt({ ...indexed, proceeds: 120_000 }, cfg);
  assert.equal(r.allowableCost, 120_000);
  assert.equal(r.rawGain, 0);
  assert.equal(r.isLoss, false);
  assert.equal(r.disposalLoss, 0);
  assert.equal(r.totalTax, 0);
  // The breakdown still adds up: proceeds − allowable cost = gain.
  assert.equal(r.proceeds - r.allowableCost, r.rawGain);
});

test("s.556(4): the boundaries, at the indexed cost and at the real cost", () => {
  const atIndexed = computeCgt({ ...indexed, proceeds: 127_700 }, cfg);
  assert.equal(atIndexed.rawGain, 0);
  assert.equal(atIndexed.isLoss, false);
  const atCost = computeCgt({ ...indexed, proceeds: 100_000 }, cfg);
  assert.equal(atCost.allowableCost, 100_000);
  assert.equal(atCost.rawGain, 0);
  assert.equal(atCost.isLoss, false);
});

test("s.556(4): a real loss stays its real size, not the indexed one", () => {
  const r = computeCgt({ ...indexed, proceeds: 80_000 }, cfg);
  assert.equal(r.allowableCost, 100_000);
  assert.equal(r.isLoss, true);
  assert.equal(r.disposalLoss, 20_000); // not 47,700
});

test("s.556(4): enhancement is restricted the same way", () => {
  // Indexed 50k×1.5 + 30k×1.2 = €111,000; actually paid €80,000.
  const improved = { ...base, acquisitionCost: 50_000, acquisitionMultiplier: 1.5, enhancementCost: 30_000, enhancementMultiplier: 1.2 };
  assert.equal(computeCgt({ ...improved, proceeds: 100_000 }, cfg).rawGain, 0);
  assert.equal(computeCgt({ ...improved, proceeds: 70_000 }, cfg).disposalLoss, 10_000);
  assert.equal(computeCgt({ ...improved, proceeds: 150_000 }, cfg).rawGain, 39_000);
});

test("s.556(4): selling costs count in the real cost but are never indexed", () => {
  const withFees = { ...indexed, disposalCosts: 5_000 };
  // Real cost €105,000, indexed €132,700.
  assert.equal(computeCgt({ ...withFees, proceeds: 110_000 }, cfg).rawGain, 0);
  assert.equal(computeCgt({ ...withFees, proceeds: 90_000 }, cfg).disposalLoss, 15_000);
  assert.equal(computeCgt({ ...withFees, proceeds: 150_000 }, cfg).rawGain, 17_300);
});

test("s.556(4): a nil result uses no losses, no exemption and no PPR relief", () => {
  const r = computeCgt(
    { ...indexed, proceeds: 120_000, broughtForwardLosses: 5_000, ppr: { monthsOwned: 120, monthsOccupied: 60 } },
    cfg,
  );
  assert.equal(r.pprRelief, 0);
  assert.equal(r.lossesApplied, 0);
  assert.equal(r.lossCarried, 5_000);
  assert.equal(r.exemptionApplied, 0);
  assert.equal(r.taxableGain, 0);
});

/* Revenue's own worked examples, Tax and Duty Manual Part 19-02-13 (s.556),
   checked 26 Oct 2026. Examples 2 and 3 need the 6 April 1974 market value,
   which this calculator does not ask for, so they are not here. */
test("Revenue TDM 19-02-13 Examples 1, 4 and 5 (s.556 indexation)", () => {
  const mult = (key: string) => CGT_MULTIPLIERS_DEFAULT.find((m) => m.yearKey === key)!.multiplier;
  assert.equal(mult("1986-87"), 1.637);
  assert.equal(mult("2000-01"), 1.144);

  // Example 1: €10,000 in 1986/87, sold for €100,000 → chargeable gain €83,630.
  const ex1 = computeCgt({ ...base, proceeds: 100_000, acquisitionCost: 10_000, acquisitionMultiplier: mult("1986-87") }, cfg);
  assert.equal(ex1.rawGain, 83_630);

  // Example 4: €4,200 in 2000/01, sold for €4,000 → allowable loss €200, not €805.
  const ex4 = computeCgt({ ...base, proceeds: 4_000, acquisitionCost: 4_200, acquisitionMultiplier: mult("2000-01") }, cfg);
  assert.equal(ex4.disposalLoss, 200);

  // Example 5: €2,800 in 1986/87, sold for €4,000 → no gain, no loss.
  const ex5 = computeCgt({ ...base, proceeds: 4_000, acquisitionCost: 2_800, acquisitionMultiplier: mult("1986-87") }, cfg);
  assert.equal(ex5.rawGain, 0);
  assert.equal(ex5.isLoss, false);
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
  assert.equal(r.bands[1].tax, 155_000); // 0.5m × 31%
  assert.equal(r.totalTax, 305_000);
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
    standardRatePercent: 31,
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
