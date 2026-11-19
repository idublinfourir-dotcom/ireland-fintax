/* Unit tests for the Ireland Capital Allowances engine.
   Run: node --test app/lib/ireland-capital-allowances.test.ts   (Node 22.6+ strips types)

   Covers plant & machinery (12.5%/8yr), industrial buildings (4%/25yr), the
   100% energy-efficient ACA, the car rules (s.380L(3): €24,000 whatever the
   cost / half / nil, by CO2 category, before and from 1 January 2027), the
   schedule → allowableCost reconciliation, and edge inputs. */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeCapitalAllowance,
  parseCaConfig,
  round2,
  MOTOR_CAP_EUR,
  CA_CONFIG_DEFAULT,
  getAssetClass,
  CAR_RELIEF,
  type CapitalAllowanceResult,
} from "./ireland-capital-allowances.ts";
import { cpuMs } from "./cpu-time.ts";

/** The yearly allowances must sum back to the allowable cost, to the cent. */
function assertScheduleSums(r: CapitalAllowanceResult) {
  const sum = r.firstYearFull
    ? r.firstYearAllowance
    : round2(r.annualAllowance * (r.years - 1) + r.finalYearAllowance);
  assert.equal(sum, r.allowableCost, "schedule must sum to allowable cost");
}

test("Plant & machinery: 12.5% straight-line over 8 years", () => {
  const r = computeCapitalAllowance({ assetKey: "plant-machinery", cost: 80_000 });
  assert.equal(r.allowableCost, 80_000);
  assert.equal(r.annualAllowance, 10_000); // 12.5%
  assert.equal(r.years, 8);
  assert.equal(r.totalAllowances, 80_000);
  assert.equal(r.taxSaving, 10_000); // 12.5% of 80,000
  assert.equal(r.restricted, false);
  assertScheduleSums(r);
});

test("Industrial building: 4% straight-line over 25 years", () => {
  const r = computeCapitalAllowance({ assetKey: "industrial-building", cost: 100_000 });
  assert.equal(r.annualAllowance, 4_000); // 4%
  assert.equal(r.years, 25);
  assert.equal(r.totalAllowances, 100_000);
  assertScheduleSums(r);
});

test("Energy-efficient equipment: 100% in year one (ACA)", () => {
  const r = computeCapitalAllowance({ assetKey: "energy-efficient", cost: 50_000 });
  assert.equal(r.firstYearFull, true);
  assert.equal(r.firstYearAllowance, 50_000);
  assert.equal(r.years, 1);
  assert.equal(r.totalAllowances, 50_000);
  assert.equal(r.taxSaving, 6_250);
  assertScheduleSums(r);
});

/* Every figure below is s.380L(3) TCA 1997: full relief takes the cost to
   be the €24,000 specified amount, half relief is half the lower of the cost
   and €24,000, otherwise nil (Finance Act 2024 s.33 from 1 January 2027). */
const car = (cost: number, co2Category: "a" | "b" | "c" | "d-f", carRules?: 2026 | 2027) =>
  computeCapitalAllowance({ assetKey: "motor-vehicle", cost, co2Category, carRules });

test("Car, full relief: €24,000 whatever the car cost", () => {
  const dear = car(30_000, "a");
  assert.equal(dear.allowableCost, 24_000);
  assert.equal(dear.annualAllowance, 3_000); // 12.5% of 24,000
  assert.equal(dear.restricted, true);
  assertScheduleSums(dear);

  // Revenue NfG Part 11C: "€24,000 are available even if the car costs less".
  const cheap = car(15_000, "a");
  assert.equal(cheap.allowableCost, 24_000);
  assert.equal(cheap.annualAllowance, 3_000);
  assert.equal(cheap.restricted, true);
  assertScheduleSums(cheap);

  assert.equal(car(24_000, "a").restricted, false);
  assert.equal(car(0, "a").totalAllowances, 0, "no car bought, no allowance");
});

test("Car, half relief: half the lower of cost and €24,000, so at most €12,000", () => {
  assert.equal(car(30_000, "c", 2026).allowableCost, 12_000);
  assert.equal(car(30_000, "c", 2026).annualAllowance, 1_500);
  assert.equal(car(20_000, "c", 2026).allowableCost, 10_000);
  assert.equal(car(20_000, "c", 2026).annualAllowance, 1_250);
});

test("Car, nil relief: no allowances at all", () => {
  const r = car(30_000, "d-f");
  assert.equal(r.allowableCost, 0);
  assert.equal(r.annualAllowance, 0);
  assert.equal(r.totalAllowances, 0);
  assert.equal(r.taxSaving, 0);
  assert.equal(r.restricted, true);
});

test("Car bands: 2026 rules v 2027 rules, category by category", () => {
  const total = (c: "a" | "b" | "c" | "d-f", y: 2026 | 2027) => car(30_000, c, y).totalAllowances;
  // 0 to 120 g/km: full both years.
  assert.equal(total("a", 2026), 24_000);
  assert.equal(total("a", 2027), 24_000);
  // 121 to 140 g/km: full before 2027, half from 1 January 2027.
  assert.equal(total("b", 2026), 24_000);
  assert.equal(total("b", 2027), 12_000);
  // 141 to 155 g/km: half before 2027, nil from 1 January 2027.
  assert.equal(total("c", 2026), 12_000);
  assert.equal(total("c", 2027), 0);
  // Over 155 g/km: nil both years.
  assert.equal(total("d-f", 2026), 0);
  assert.equal(total("d-f", 2027), 0);
});

test("Car defaults: Category A under the 2027 rules", () => {
  const r = computeCapitalAllowance({ assetKey: "motor-vehicle", cost: 30_000 });
  assert.equal(r.allowableCost, 24_000);
  const b = computeCapitalAllowance({ assetKey: "motor-vehicle", cost: 30_000, co2Category: "b" });
  assert.equal(b.allowableCost, 12_000, "defaults to the 2027 rules");
});

test("Car rules ignored for other assets", () => {
  const r = computeCapitalAllowance({ assetKey: "plant-machinery", cost: 10_000, co2Category: "d-f", carRules: 2026 });
  assert.equal(r.allowableCost, 10_000);
});

test("Car, hostile input: negative, NaN and huge costs never give a negative or broken figure", () => {
  assert.equal(car(-30_000, "a").totalAllowances, 0, "a negative cost is no car");
  assert.equal(car(1e15, "a").totalAllowances, 24_000, "full relief is fixed at €24,000");
  assert.equal(car(1e15, "b").totalAllowances, 12_000);
  const odd = (input: object) => computeCapitalAllowance({ assetKey: "motor-vehicle", cost: 30_000, ...input }).totalAllowances;
  assert.equal(odd({ co2Category: "x" }), 0, "unknown category: no relief");
  assert.equal(odd({ carRules: 2031 }), 0, "unknown year: no relief");
  assert.equal(car(Number.NaN, "a").totalAllowances, 0, "NaN cost is no car");
});

test("Car: both sets of rules for every category, 10,000 times, inside 100 ms", () => {
  // The calculator works out the chosen rules and the comparison on every
  // keystroke. Best of three, as in crypto-paste.test.ts: a busy machine
  // (the suite runs files in parallel) can slow one batch. ~13 ms alone.
  let ms = Infinity;
  for (let run = 0; run < 3; run++) {
    const start = cpuMs();
    for (let i = 0; i < 10_000; i++)
      for (const c of ["a", "b", "c", "d-f"] as const) {
        car(i * 7, c, 2026);
        car(i * 7, c, 2027);
      }
    ms = Math.min(ms, cpuMs() - start);
  }
  assert.ok(ms < 100, `took ${ms.toFixed(1)} ms`);
});

test("Rounding: schedule reconciles for an awkward amount", () => {
  const r = computeCapitalAllowance({ assetKey: "plant-machinery", cost: 12_345.67 });
  assert.equal(r.annualAllowance, 1_543.21); // 12,345.67 × 12.5% = 1,543.20875
  assertScheduleSums(r); // final year absorbs the remainder
});

test("Edge inputs: zero and negatives clamp to zero", () => {
  const z = computeCapitalAllowance({ assetKey: "plant-machinery", cost: 0 });
  assert.equal(z.annualAllowance, 0);
  assert.equal(z.totalAllowances, 0);
  const neg = computeCapitalAllowance({ assetKey: "plant-machinery", cost: -50_000 });
  assert.equal(neg.cost, 0);
  assert.equal(neg.totalAllowances, 0);
});

test("Config holds the documented statutory values", () => {
  assert.equal(MOTOR_CAP_EUR, 24_000);
  assert.equal(getAssetClass("plant-machinery").ratePercent, 12.5);
  assert.equal(getAssetClass("plant-machinery").years, 8);
  assert.equal(getAssetClass("industrial-building").ratePercent, 4);
  assert.equal(getAssetClass("industrial-building").years, 25);
  assert.equal(getAssetClass("energy-efficient").firstYearFull, true);
  assert.deepEqual(CAR_RELIEF[2026], { a: 1, b: 1, c: 0.5, "d-f": 0 });
  assert.deepEqual(CAR_RELIEF[2027], { a: 1, b: 0.5, c: 0, "d-f": 0 });
});

test("CA_CONFIG_DEFAULT references the module consts (no drift)", () => {
  assert.equal(CA_CONFIG_DEFAULT.motorCapEur, MOTOR_CAP_EUR);
  assert.equal(CA_CONFIG_DEFAULT.tradingCtPercent, 12.5);
  assert.equal(
    CA_CONFIG_DEFAULT.classes.find((c) => c.key === "plant-machinery")?.ratePercent,
    12.5,
  );
});

test("Custom config arg overrides rate, years and the car cap", () => {
  const cfg = structuredClone(CA_CONFIG_DEFAULT);
  const pm = cfg.classes.find((c) => c.key === "plant-machinery")!;
  pm.ratePercent = 20; // 20% instead of 12.5%
  pm.years = 5;
  cfg.tradingCtPercent = 15;

  const r = computeCapitalAllowance({ assetKey: "plant-machinery", cost: 100_000 }, cfg);
  assert.equal(r.annualAllowance, 20_000); // 20%
  assert.equal(r.years, 5);
  assert.equal(r.taxSaving, 15_000); // 15% of 100,000
});

test("Custom config: an edited specified amount flows through the car rules", () => {
  const cfg = structuredClone(CA_CONFIG_DEFAULT);
  cfg.motorCapEur = 40_000;
  const full = computeCapitalAllowance({ assetKey: "motor-vehicle", cost: 35_000, co2Category: "a" }, cfg);
  assert.equal(full.allowableCost, 40_000); // full relief: the specified amount
  const half = computeCapitalAllowance({ assetKey: "motor-vehicle", cost: 35_000, co2Category: "b" }, cfg);
  assert.equal(half.allowableCost, 17_500); // half of the lower of 35,000 and 40,000
});

test("parseCaConfig: valid blob round-trips", () => {
  const cfg = parseCaConfig(structuredClone(CA_CONFIG_DEFAULT));
  assert.ok(cfg);
  assert.equal(cfg?.classes.length, CA_CONFIG_DEFAULT.classes.length);
  assert.equal(cfg?.motorCapEur, 24_000);
});

test("parseCaConfig: rejects bad / missing / out-of-range", () => {
  assert.equal(parseCaConfig(null), null);
  assert.equal(parseCaConfig({ classes: [], motorCapEur: 24_000, tradingCtPercent: 12.5 }), null);
  const missingKey = structuredClone(CA_CONFIG_DEFAULT);
  missingKey.classes = missingKey.classes.filter((c) => c.key !== "energy-efficient");
  assert.equal(parseCaConfig(missingKey), null);
  const badRate = structuredClone(CA_CONFIG_DEFAULT);
  badRate.classes[0].ratePercent = 200;
  assert.equal(parseCaConfig(badRate), null);
  const badCap = structuredClone(CA_CONFIG_DEFAULT);
  badCap.motorCapEur = -5;
  assert.equal(parseCaConfig(badCap), null);
});
