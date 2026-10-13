/* Unit tests for the Budget 2027 personal view.
   Run: node --test app/lib/budget-2027.test.ts   (Node 22.6+ strips types)

   The worked examples are the Department of Finance's ("Budget 2027 Tax Policy
   Changes", 6 Oct 2026). Its PRSI blends the October rate rise; ours uses the
   start-of-year rate, so a total can differ from theirs by a euro. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { compareYears } from "./ireland-income-tax.ts";
import {
  EMPTY_PROFILE,
  allMeasures,
  helpToBuy,
  incomeTaxInputFor,
  personalise,
  type BudgetProfile,
  type PersonalLine,
} from "./budget-2027.ts";

const profile = (over: Partial<BudgetProfile>): BudgetProfile => ({ ...EMPTY_PROFILE, ...over });

const amount = (line: PersonalLine | undefined) =>
  line && line.impact.kind === "exact" ? line.impact.amount : NaN;

const byId = (lines: PersonalLine[], id: string) => lines.find((l) => l.id === id);

test("an empty profile shows nothing", () => {
  const r = personalise(EMPTY_PROFILE);
  assert.equal(r.exact.length + r.perUnit.length + r.info.length, 0);
  assert.equal(r.totalPerYear, 0);
  assert.equal(r.totalOnce, 0);
});

test("DoF Example 4: single, €52,000, gains €688", () => {
  const r = personalise(profile({ employee: true, employmentIncome: 52_000 }));
  assert.equal(Math.round(amount(byId(r.exact, "income-tax"))), 766); // €750 income tax + €16 USC
  assert.ok(Math.abs(r.totalPerYear - 688) <= 1, `total ${r.totalPerYear}`);
});

test("DoF Example 3: single, €75,000, renting at €1,700 a month, gains €803", () => {
  const r = personalise(
    profile({ employee: true, employmentIncome: 75_000, renting: true, rentMonthly: 1_700 }),
  );
  assert.equal(Math.round(amount(byId(r.exact, "rent-credit"))), 150);
  assert.ok(Math.abs(r.totalPerYear - 803) <= 1, `total ${r.totalPerYear}`);
});

test("DoF Example 1: minimum wage, 39 hours, €28,697, gains €1,386", () => {
  const r = personalise(
    profile({ employee: true, minimumWage: true, minimumWageHours: 39, employmentIncome: 28_697 }),
  );
  assert.ok(Math.abs(r.totalPerYear - 1_386) <= 2, `total ${r.totalPerYear}`);
});

test("DoF Example 9: one income €55,500 with the Home Carer credit", () => {
  const r = personalise(
    profile({
      employee: true,
      employmentIncome: 55_500,
      married: true,
      homeCarer: true,
      hasChildren: true, childrenUnder12: 4,
    }),
  );
  // Income tax €3,650 → €2,675 (€975) and USC €1,198 → €1,182 (€16).
  assert.equal(Math.round(amount(byId(r.exact, "income-tax"))), 991);
  assert.ok(byId(r.info, "home-carer"), "explains the Home Carer credit");
});

test("the tax lines add up to the engine's take-home change", () => {
  const p = profile({
    employee: true,
    employmentIncome: 64_000,
    married: true,
    spouseIncome: 21_000,
    renting: true,
    rentMonthly: 2_100,
  });
  const r = personalise(p);
  const tax = ["income-tax", "prsi", "rent-credit"].reduce((s, id) => s + amount(byId(r.exact, id)), 0);
  assert.ok(Math.abs(tax - compareYears(incomeTaxInputFor(p), 2027, 2026).delta.annual) < 0.01);
});

test("Help to Buy: lesser of the cap, 10% of the price and tax paid", () => {
  assert.equal(helpToBuy(400_000, 50_000, 35_000), 35_000);
  assert.equal(helpToBuy(320_000, 0, 35_000), 32_000, "10% of the price");
  assert.equal(helpToBuy(400_000, 31_000, 35_000), 31_000, "tax paid");

  const gain = (homePrice: number, taxPaidFourYears = 0) =>
    personalise(profile({ buyingFirstHome: true, homePrice, taxPaidFourYears }));
  assert.equal(amount(byId(gain(400_000).exact, "help-to-buy")), 5_000);
  assert.equal(amount(byId(gain(320_000).exact, "help-to-buy")), 2_000);
  assert.equal(amount(byId(gain(400_000, 31_000).exact, "help-to-buy")), 1_000);
  const tooDear = gain(520_000);
  assert.equal(byId(tooDear.exact, "help-to-buy"), undefined);
  assert.ok(byId(tooDear.info, "help-to-buy"), "explains the €500,000 limit");
  assert.equal(gain(400_000).totalOnce, 5_000, "one-off, not yearly");
  assert.equal(gain(400_000).totalPerYear, 0);
});

test("welfare: €10, €3, €5 and €6 a week, €18 for WFP, €500 once", () => {
  const r = personalise(
    profile({
      welfarePayment: true,
      livingAlone: true,
      fuelAllowance: true,
      workingFamilyPayment: true,
      disabilityPayment: true,
      hasChildren: true, childrenUnder12: 1,
      children12Plus: 1,
    }),
  );
  assert.equal(amount(byId(r.exact, "welfare-rates")), 520);
  assert.equal(amount(byId(r.exact, "living-alone")), 156);
  assert.equal(amount(byId(r.exact, "fuel-allowance")), 140);
  assert.equal(amount(byId(r.exact, "child-support")), 624);
  assert.equal(amount(byId(r.exact, "working-family-payment")), 936);
  assert.equal(amount(byId(r.exact, "cost-of-disability")), 500);
  assert.equal(r.totalPerYear, 520 + 156 + 140 + 624 + 936);
  assert.equal(r.totalOnce, 500);
});

test("per-unit and info lines never enter the totals", () => {
  const r = personalise(
    profile({ diesel: true, dieselLitresPerWeek: 40, smoker: true, packsPerWeek: 5, mightSell: true, funds: true }),
  );
  assert.equal(r.exact.length, 0);
  assert.equal(r.totalPerYear, 0);
  assert.ok(r.perUnit.length >= 2 && r.info.length >= 2);
});

test("fuel: petrol and diesel are separate lines, both can apply", () => {
  const r = personalise(profile({ petrol: true, diesel: true, petrolLitresPerWeek: 60, dieselLitresPerWeek: 60 }));
  const line = (id: string) => {
    const l = r.perUnit.find((x) => x.id === id);
    return l && l.impact.kind === "perUnit" ? l.impact : undefined;
  };
  // Per litre: 25c + €1.28/60 = 27.1c petrol; 30c + €1.48/60 = 32.5c diesel.
  assert.equal(line("petrol")?.change, "27c a litre more");
  assert.equal(line("diesel")?.change, "32c a litre more");
  // A year at 60 litres a week: 60 × 52 × €0.27133 = €847; × €0.32467 = €1,013.
  assert.match(line("petrol")?.estimate ?? "", /€847 a year more/);
  assert.match(line("diesel")?.estimate ?? "", /€1,013 a year more/);
  assert.equal(line("petrol")?.cheaper, false);
  const noUsage = personalise(profile({ petrol: true })).perUnit.find((x) => x.id === "petrol");
  assert.equal(noUsage?.impact.kind === "perUnit" && noUsage.impact.estimate, undefined);
});

test("heating: savings shown per unit, and per year from usage", () => {
  const r = personalise(profile({ heatingOil: true, heatingOilLitresPerYear: 1_500, gas: true, gasKwhPerYear: 11_000 }));
  const oil = r.perUnit.find((x) => x.id === "heating-oil");
  const gas = r.perUnit.find((x) => x.id === "gas");
  assert.ok(oil?.impact.kind === "perUnit" && oil.impact.cheaper);
  assert.match(oil?.impact.kind === "perUnit" ? oil.impact.estimate ?? "" : "", /€65 a year less/); // 1.5 × €43 = €64.50
  assert.match(gas?.impact.kind === "perUnit" ? gas.impact.estimate ?? "" : "", /€32 a year less/);
});

test("only what applies: a renter sees nothing about farms, companies or pensions", () => {
  const r = personalise(profile({ employee: true, employmentIncome: 40_000, renting: true, rentMonthly: 1_500 }));
  const ids = [...r.exact, ...r.perUnit, ...r.info].map((l) => l.id);
  for (const id of ["farm", "company", "welfare-rates", "cgt", "help-to-buy"]) {
    assert.equal(ids.includes(id), false, id);
  }
});

test("timeline: dated lines in order, unannounced ones last", () => {
  const r = personalise(profile({ smoker: true, heatingOil: true, funds: true, welfarePayment: true }));
  const dates = r.timeline.filter((t) => t.starts.date).map((t) => t.starts.date as string);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(r.timeline.at(-1)?.starts.label, "Not announced yet");
});

test("every measure has a status and a start label; ids are unique", () => {
  const all = allMeasures();
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  for (const m of all) {
    assert.ok(m.statusLabel.length > 0, m.id);
    assert.ok(m.starts.label.length > 0, m.id);
    assert.ok(m.summary.length > 0, m.id);
    assert.ok(m.source.url.startsWith("https://"), m.id);
  }
});

test("the figures handed to the income tax calculator", () => {
  const input = incomeTaxInputFor(
    profile({ employee: true, employmentIncome: 48_000, married: true, spouseIncome: 9_000, homeCarer: true, renting: true, rentMonthly: 1_250, hasChildren: true, childrenUnder12: 2 }),
  );
  assert.equal(input.maritalStatus, "married");
  assert.equal(input.employmentIncome, 48_000);
  assert.equal(input.spouseEmploymentIncome, 9_000);
  assert.equal(input.rentPaid, 15_000);
  assert.equal(input.claimHomeCarerCredit, true);
  assert.equal(input.hasChildOnChildBenefit, true);
  assert.equal(input.age, 0, "no invented age");
});

test("Derelict Property Tax shows only for owners of a run-down building", () => {
  const owner = personalise(profile({ derelictProperty: true }));
  assert.ok(owner.info.find((l) => l.id === "derelict-property"));
  assert.equal(owner.timeline[0].starts.date, "2027-09-01");
  const renter = personalise(profile({ renting: true, rentMonthly: 1_000, employee: true, employmentIncome: 40_000 }));
  assert.equal([...renter.exact, ...renter.info].some((l) => l.id === "derelict-property"), false);
});
