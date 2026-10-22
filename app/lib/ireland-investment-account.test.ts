/* Unit tests for the Investment Account maths.
   Run: node --test app/lib/ireland-investment-account.test.ts   (Node 22.6+ strips types)

   The goldens come from the design preview's simulate() (version 15), which
   this module ports; the port matched it to the cent over 2,880 inputs. */

import { test } from "node:test";
import assert from "node:assert/strict";

import { accountTax, compareWrappers, eligibility, TOP_RATES, type CompareInputs } from "./ireland-investment-account.ts";

const [STANDARD, HIGHER, TOP] = TOP_RATES.map((t) => t.rate);
const base: CompareInputs = { lump: 10_000, monthly: 500, years: 15, ret: 0.05, dividendYield: 0.02, topRate: TOP };
const run = (o: Partial<CompareInputs>) => compareWrappers({ ...base, ...o });
const near = (a: number, b: number, msg?: string) => assert.ok(Math.abs(a - b) < 0.5, `${msg ?? ""} ${a} vs ${b}`);

test("account tax: the Minister's €52,000 → €20, KPMG's €55,000 → €50, nil below €50,000", () => {
  assert.equal(accountTax(52_000), 20);
  assert.equal(accountTax(55_000), 50);
  assert.equal(accountTax(49_999), 0);
  assert.equal(accountTax(60_000), 100);
});

test("2027 top rates: income tax + USC + PRSI", () => {
  near(STANDARD * 1e4, 2735);
  near(HIGHER * 1e4, 4735);
  near(TOP * 1e4, 5235);
});

test("goldens", () => {
  const cases: [Partial<CompareInputs>, number, number, number, "etf" | "shares"][] = [
    [{}, 148_561, 133_603, 131_289, "shares"],
    [{ lump: 100_000, monthly: 0, years: 30 }, 344_499, 274_723, 269_907, "shares"],
    [{ lump: 100_000, monthly: 0, years: 30, topRate: STANDARD }, 350_824, 274_723, 315_896, "shares"],
    [{ lump: 0, monthly: 1_000, years: 30 }, 709_381, 622_625, 608_315, "etf"],
    [{ lump: 0, monthly: 2_000, years: 30 }, 1_333_807, 1_245_249, 1_216_237, "etf"],
    [{ lump: 100_000, monthly: 0, years: 30, ret: 0.02, topRate: STANDARD }, 153_092, 148_611, 154_151, "shares"],
  ];
  for (const [o, acc, etf, sh, held] of cases) {
    const r = run(o);
    const label = JSON.stringify(o);
    near(r.account.final, acc, `${label} account`);
    near(r.etf.final, etf, `${label} etf`);
    near(r.shares.final, sh, `${label} shares`);
    if (r.account.overflow > 0) assert.equal(r.account.heldAs, held, label);
  }
});

test("4 × €12,000 at 0% stays under €50,000: no tax", () => {
  const r = run({ lump: 0, monthly: 1_000, years: 4, ret: 0, dividendYield: 0 });
  assert.equal(r.account.tax, 0);
  assert.equal(r.account.firstTaxYear, null);
  near(r.account.final, 48_000);
});

test("at 0% return with no dividends, the ETF and shares return what was paid in, and the account only loses its 1%", () => {
  const r = run({ lump: 50_000, monthly: 500, years: 20, ret: 0, dividendYield: 0 });
  near(r.etf.final, r.paid);
  near(r.shares.final, r.paid);
  near(r.account.final + r.account.tax, r.paid);
  assert.ok(r.etf.final > r.account.final, "the 1% is on value, so a flat market favours the ETF");
});

test("money over the limit moves in each January; with no spare room it stays outside", () => {
  const lump = run({ lump: 100_000, monthly: 0, years: 30 });
  assert.equal(lump.account.overflow, 88_000);
  assert.ok(lump.account.moved > 88_000 && lump.account.left < 0.5);
  const full = run({ lump: 0, monthly: 2_000, years: 30 });
  assert.equal(full.account.moved, 0);
  assert.ok(full.account.left > 0);
});

test("at 5% the account beats both outside homes; a bad year still charges the 1%", () => {
  for (const lump of [0, 100_000]) for (const monthly of [0, 500, 2_000]) for (const topRate of [STANDARD, TOP]) {
    if (!lump && !monthly) continue;
    const r = run({ lump, monthly, years: 30, topRate });
    assert.ok(r.account.final > r.etf.final && r.account.final > r.shares.final, JSON.stringify({ lump, monthly, topRate }));
  }
  const bad = run({ lump: 0, monthly: 1_000, years: 10, badYear: true });
  assert.ok(bad.rows[2].accountTax >= 0 && bad.account.final < run({ lump: 0, monthly: 1_000, years: 10 }).account.final);
});

test("no deemed disposal before 8 years; the first falls in year 9 for money paid in during year 1", () => {
  const r = run({ lump: 10_000, monthly: 0, years: 12 });
  assert.ok(r.rows.slice(0, 8).every((row) => row.deemedTax === 0));
  assert.ok(r.rows[8].deemedTax > 0);
});

test("eligibility reasons", () => {
  const ok = { adult: true, resident: true, ppsn: true, hasAccount: false, closedThisYear: false };
  assert.deepEqual(eligibility(ok), []);
  assert.deepEqual(eligibility({ ...ok, adult: false, closedThisYear: true }), ["minor", "closedThisYear"]);
  assert.deepEqual(eligibility({ adult: false, resident: false, ppsn: false, hasAccount: true, closedThisYear: true }),
    ["minor", "nonResident", "noPpsn", "hasAccount", "closedThisYear"]);
});
