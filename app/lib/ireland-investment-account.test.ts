/* Unit tests for the Investment Account maths.
   Run: node --test app/lib/ireland-investment-account.test.ts   (Node 22.6+ strips types)

   The by-hand cases use a 0% return, so every figure can be checked on paper;
   the growth case is checked against the closed form for a daily average. */

import { test } from "node:test";
import assert from "node:assert/strict";

import { accountTax, projectAccount, type ProjectInputs } from "./ireland-investment-account.ts";

const base: ProjectInputs = {
  openYear: 2028, openMonth: 0, firstPayment: 0, monthly: 0, yearly: 0, untilYear: 2028, ret: 0, fee: 0,
};
const run = (o: Partial<ProjectInputs>) => projectAccount({ ...base, ...o });
const near = (a: number, b: number, msg = "") => assert.ok(Math.abs(a - b) < 0.01, `${msg} ${a} vs ${b}`);

test("account tax: the Budget speech's €52,000 → €20, €55,000 → €50, nil below €50,000", () => {
  assert.equal(accountTax(52_000), 20);
  assert.equal(accountTax(55_000), 50);
  assert.equal(accountTax(50_000), 0);
  assert.equal(accountTax(49_999), 0);
  assert.equal(accountTax(60_000), 100);
  assert.equal(accountTax(50_123.456), 1.23);
});

test("a part year is averaged over the days open only, and the €50,000 is not reduced", () => {
  const r = run({ openYear: 2027, openMonth: 6, untilYear: 2027, firstPayment: 12_000 });
  assert.equal(r.rows[0].days, 184); // 1 July to 31 December
  near(r.rows[0].average, 12_000);
  assert.equal(r.rows[0].tax, 0);
});

test("leap years count 366 days", () => {
  assert.equal(run({ firstPayment: 1 }).rows[0].days, 366);
  assert.equal(run({ openYear: 2029, untilYear: 2029, firstPayment: 1 }).rows[0].days, 365);
});

test("€12,000 each 1 January at 0%: no tax until the average passes €50,000, then 1% of the excess", () => {
  const r = run({ firstPayment: 12_000, yearly: 12_000, untilYear: 2032 });
  assert.deepEqual(r.rows.map((y) => Math.round(y.average)), [12_000, 24_000, 36_000, 48_000, 60_000]);
  assert.deepEqual(r.rows.map((y) => y.tax), [0, 0, 0, 0, 100]);
  assert.equal(r.firstTaxYear, 2032);
  assert.equal(r.paid, 60_000);
  near(r.final, 59_900);
  near(r.growth, 0);
});

test("money paid in on 1 December counts for 31 days in a year it opens then, and all of the next year", () => {
  const late = run({ openYear: 2029, openMonth: 11, untilYear: 2030, firstPayment: 12_000 });
  assert.equal(late.rows[0].days, 31);
  near(late.rows[0].average, 12_000);
  assert.equal(late.rows[1].days, 365);
  near(late.rows[1].average, 12_000);
});

test("the €12,000 limit is per calendar year: anything over it is left out and counted", () => {
  const r = run({ firstPayment: 20_000, monthly: 1_000, untilYear: 2029 });
  assert.deepEqual(r.rows.map((y) => y.paidIn), [12_000, 12_000]);
  // 2028: 20,000 + 12 × 1,000 planned, 12,000 in. 2029: 12 × 1,000, all in.
  assert.equal(r.refused, 20_000);
  const opening = run({ openYear: 2027, openMonth: 6, untilYear: 2027, monthly: 2_000 });
  assert.equal(opening.rows[0].paidIn, 12_000); // no pro-rating for 2027
  assert.equal(opening.refused, 0);
});

test("a full year of daily growth compounds to exactly the yearly return, and the average matches the closed form", () => {
  const L = 12_000, r = 0.07, N = 365;
  const res = run({ openYear: 2029, untilYear: 2029, firstPayment: L, ret: r });
  near(res.rows[0].endValue, L * (1 + r));
  const g = Math.pow(1 + r, 1 / N) - 1;
  near(res.rows[0].average, (L * (1 + g) * (Math.pow(1 + g, N) - 1)) / (g * N));
});

test("fees lower the value and the tax; a falling market still pays tax on an average over €50,000", () => {
  const plain = run({ firstPayment: 12_000, yearly: 12_000, untilYear: 2040, ret: 0.05 });
  const fees = run({ firstPayment: 12_000, yearly: 12_000, untilYear: 2040, ret: 0.05, fee: 0.005 });
  assert.ok(fees.final < plain.final && fees.tax < plain.tax);
  const falling = run({ firstPayment: 12_000, yearly: 12_000, untilYear: 2034, ret: -0.05 });
  const last = falling.rows.at(-1)!;
  assert.ok(last.growth < 0 && last.average > 50_000 && last.tax > 0);
  for (const res of [plain, fees, falling]) near(res.paid + res.growth - res.tax, res.final, "paid + growth − tax = final");
});
