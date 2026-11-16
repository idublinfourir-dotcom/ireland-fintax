/* Unit tests for the rental income tax calculator and the unearned-income
   field it added to the income tax engine.
   Run: node --test app/lib/ireland-rental-tax.test.ts   (Node 22.6+ strips types)

   Every expected figure is worked by hand from the 2026 rates: 20% to
   €44,000 single, 40% above; USC 0.5% / 2% to €28,700 / 3% to €70,044 / 8%;
   PRSI 4.2375% for 2026 (nine months at 4.2%, three at 4.35%). */

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeIrishTax, type IncomeTaxInput } from "./ireland-income-tax.ts";
import { computeRentalTax, RENT_A_ROOM_LIMIT, type RentalInput } from "./ireland-rental-tax.ts";

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.01, `${a} ≠ ${b}`);

const person = (over: Partial<IncomeTaxInput> = {}): IncomeTaxInput => ({
  maritalStatus: "single",
  hasChildOnChildBenefit: false,
  isPrincipalCarerOfDependentChild: false,
  age: 40,
  employmentIncome: 0,
  selfEmploymentOrOtherIncome: 0,
  pensionContribution: 0,
  ...over,
});

const rental = (over: Partial<RentalInput> = {}): RentalInput => ({
  letting: "room",
  grossRent: 0,
  expenses: 0,
  furnishings: 0,
  rprir: false,
  person: person(),
  ...over,
});

/* ---------- the engine's unearned income ---------- */

test("Unearned income: no Earned Income Credit, unlike self-employment", () => {
  const rent = computeIrishTax(person({ unearnedIncome: 30_000 }), 2026);
  const trade = computeIrishTax(person({ selfEmploymentOrOtherIncome: 30_000 }), 2026);
  assert.ok(!rent.incomeTax.credits.some((c) => c.name.includes("Earned Income")));
  // €6,000 gross tax less the €2,000 personal credit; the trader also gets €2,000 Earned Income.
  assert.equal(rent.incomeTax.netTax, 4_000);
  assert.equal(trade.incomeTax.netTax, 2_000);
});

test("Unearned income is not earnings for pension relief", () => {
  const r = computeIrishTax(person({ unearnedIncome: 50_000, pensionContribution: 5_000 }), 2026);
  assert.equal(r.pension.qualifying, 0);
});

test("Unearned income counts for USC's 3% surcharge on non-PAYE income over €100,000", () => {
  const r = computeIrishTax(person({ unearnedIncome: 150_000 }), 2026);
  near(r.usc.selfEmployedSurcharge, 1_500);
});

test("Leaving unearned income out changes nothing", () => {
  const p = person({ employmentIncome: 55_000, selfEmploymentOrOtherIncome: 8_000 });
  assert.deepEqual(computeIrishTax(p, 2026), computeIrishTax({ ...p, unearnedIncome: 0 }, 2026));
});

/* ---------- tax on the rent ---------- */

test("Room under the limit, employee on €50,000: relief applies; taxed it would cost €5,196.13", () => {
  const r = computeRentalTax(
    rental({ grossRent: 12_000, expenses: 1_000, person: person({ employmentIncome: 50_000 }) }),
    2026,
  );
  assert.deepEqual(r.room, { qualifies: true, headroom: 2_000, overBy: 0 });
  assert.equal(r.profit, 11_000);
  near(r.standard.incomeTax, 4_400); // all of it above €44,000, at 40%
  near(r.standard.usc, 330); // €50,000 to €61,000, inside the 3% band
  near(r.standard.prsi, 466.13); // €11,000 at 4.2375%
  near(r.standard.total, 5_196.13);
});

test("Revenue's Mary: €14,500 with meals is over €14,000, so all of it is taxed", () => {
  const r = computeRentalTax(rental({ grossRent: 14_500 }), 2026);
  assert.deepEqual(r.room, { qualifies: false, headroom: 0, overBy: 500 });
  assert.equal(r.profit, 14_500);
});

test("Exactly at the limit still qualifies", () => {
  assert.equal(computeRentalTax(rental({ grossRent: 14_000 }), 2026).room?.qualifies, true);
  assert.equal(computeRentalTax(rental({ grossRent: 14_000.01 }), 2026).room?.qualifies, false);
});

test("2027: €15,000 fits the €16,000 limit, which 2026's €14,000 does not", () => {
  assert.equal(RENT_A_ROOM_LIMIT[2027], 16_000);
  assert.equal(computeRentalTax(rental({ grossRent: 15_000 }), 2027).room?.qualifies, true);
  assert.equal(computeRentalTax(rental({ grossRent: 15_000 }), 2026).room?.qualifies, false);
});

test("Revenue's Denis: wear and tear turns €1,500 of rent into a €250 loss if he opts out", () => {
  const r = computeRentalTax(rental({ grossRent: 1_500, expenses: 500, furnishings: 10_000 }), 2026);
  assert.equal(r.wearAndTear, 1_250);
  assert.equal(r.profit, 0);
  assert.equal(r.loss, 250);
  assert.equal(r.standard.total, 0);
});

test("Separate property, no other income: credits cover the tax, PRSI's €650 minimum does not go away", () => {
  // Revenue's Denise: €15,600 rent, €5,790 costs, €9,810 profit.
  const r = computeRentalTax(
    rental({ letting: "property", grossRent: 15_600, expenses: 5_790, rprir: true }),
    2026,
  );
  assert.equal(r.room, null);
  assert.equal(r.profit, 9_810);
  assert.equal(r.standard.incomeTax, 0); // €1,962 less the €2,000 personal credit
  assert.equal(r.standard.rprir, 0); // nothing left for it to reduce
  assert.equal(r.standard.usc, 0); // total income under €13,000
  assert.equal(r.standard.prsi, 650);
});

test("Separate property, employee on €60,000, with RPRIR and wear and tear", () => {
  const r = computeRentalTax(
    rental({
      letting: "property",
      grossRent: 20_000,
      expenses: 4_000,
      furnishings: 8_000,
      rprir: true,
      person: person({ employmentIncome: 60_000 }),
    }),
    2026,
  );
  assert.equal(r.profit, 15_000);
  near(r.standard.rprir, 1_000); // the cap, below 20% of €15,000
  near(r.standard.incomeTax, 5_000); // €6,000 at 40%, less RPRIR
  near(r.standard.usc, 697.8); // €10,044 at 3% + €4,956 at 8%
  near(r.standard.prsi, 635.63);
  near(r.standard.total, 6_333.43);
});

test("RPRIR is for separate properties only, and only when ticked", () => {
  const base = { grossRent: 20_000, person: person({ employmentIncome: 60_000 }) };
  assert.equal(computeRentalTax(rental({ ...base, rprir: true }), 2026).standard.rprir, 0);
  assert.equal(computeRentalTax(rental({ ...base, letting: "property" }), 2026).standard.rprir, 0);
});

test("Married, one income: the couple's €53,000 band keeps €10,000 of profit at 20%", () => {
  const r = computeRentalTax(
    rental({ grossRent: 10_000, person: person({ maritalStatus: "married", employmentIncome: 40_000 }) }),
    2026,
  );
  near(r.standard.incomeTax, 2_000);
  near(r.standard.usc, 300);
  near(r.standard.prsi, 423.75);
});

test("Aged 67: no PRSI on the rent", () => {
  const r = computeRentalTax(rental({ grossRent: 10_000, person: person({ age: 67, employmentIncome: 30_000 }) }), 2026);
  assert.equal(r.standard.prsi, 0);
});

test("A year with no figures throws instead of guessing", () => {
  assert.throws(() => computeRentalTax(rental(), 2031));
});

/* ---------- hostile input ---------- */

test("Hostile numbers never reach the result: no NaN, no negatives", () => {
  const junk = [NaN, -1, -Infinity, Infinity, "12" as unknown as number, null as unknown as number, 1e15];
  for (const v of junk) {
    const r = computeRentalTax(
      rental({ grossRent: v, expenses: v, furnishings: v, person: person({ employmentIncome: v, age: v }) }),
      2026,
    );
    for (const n of [r.profit, r.loss, r.wearAndTear, r.standard.total, r.standard.incomeTax, r.standard.usc, r.standard.prsi]) {
      assert.ok(Number.isFinite(n) && n >= 0, `${String(v)} gave ${n}`);
    }
  }
});

/* ---------- performance ---------- */

test("Performance: 10,000 calculations inside 500ms (each one runs the tax engine twice)", () => {
  const start = performance.now();
  for (let i = 0; i < 10_000; i++) {
    computeRentalTax(
      rental({ letting: i % 2 ? "room" : "property", grossRent: i * 3, expenses: i, person: person({ employmentIncome: i * 10 }) }),
      2026,
    );
  }
  const ms = performance.now() - start;
  assert.ok(ms < 500, `took ${ms.toFixed(0)}ms`);
});
