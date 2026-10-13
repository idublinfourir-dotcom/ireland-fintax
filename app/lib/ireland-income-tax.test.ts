/* Unit tests for the Irish income tax engine.
   Run: node --test app/lib/ireland-income-tax.test.ts   (Node 22.6+ strips types)

   Two known-good cases:
   (a) simple PAYE employee sanity check,
   (b) the VERIFIED REFERENCE CASE captured from the live Deloitte calculator —
       every line must reproduce exactly. It was chosen to exercise the pension
       cap, the combined employment-credit cap, and the self-employed USC
       surcharge all at once. If any line is off, there is a bug. */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareYears,
  comparisonYears,
  computeIrishTax,
  type IncomeTaxInput,
} from "./ireland-income-tax.ts";

/** Displayed figures are whole euros — compare rounded, like the UI shows them. */
const round = (n: number) => Math.round(n);

test("(a) simple: single PAYE employee, €50,000, age 30, no children", () => {
  const input: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 30,
    employmentIncome: 50_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  const r = computeIrishTax(input, 2026);

  // Income tax: 20% × 44,000 = 8,800; 40% × 6,000 = 2,400; less €4,000 credits.
  assert.equal(round(r.incomeTax.netTax), 7_200);
  // USC: 0.5%×12,012 + 2%×16,688 + 3%×21,300 = 1,032.82 → €1,033.
  assert.equal(round(r.usc.total), 1_033);
});

test("(b) VERIFIED REFERENCE CASE — €4M employment + €1M self-emp + €2M pension, age 30", () => {
  const input: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 30,
    employmentIncome: 4_000_000,
    selfEmploymentOrOtherIncome: 1_000_000,
    pensionContribution: 2_000_000,
  };
  const r = computeIrishTax(input, 2026);

  assert.equal(round(r.grossIncome), 5_000_000, "Total income");
  assert.equal(round(r.pension.qualifying), 23_000, "Qualifying Pension Deduction");
  assert.equal(round(r.incomeTax.taxAtStandard), 8_800, "Tax @ 20%");
  assert.equal(round(r.incomeTax.taxAtHigher), 1_973_200, "Tax @ 40%");
  assert.equal(round(r.incomeTax.totalCredits), 4_000, "Tax Credits");
  assert.equal(round(r.incomeTax.netTax), 1_978_000, "Net Tax");
  assert.equal(round(r.usc.total), 423_031, "USC");
  assert.equal(round(r.netIncomeBeforePrsi), 2_575_969, "Net income before PRSI");
  assert.equal(round(r.prsi.total), 210_000, "PRSI");
  assert.equal(round(r.netIncome), 2_365_969, "Annual Net Income");

  // Combined employment credit must NOT stack (2,000, not 4,000) — both income types.
  const employmentCredit = r.incomeTax.credits.find((c) =>
    c.name.includes("Earned Income") || c.name.includes("PAYE"),
  );
  assert.equal(employmentCredit?.amount, 2_000, "Combined employment credit capped at €2,000");

  // USC surcharge slice: 3% × (1,000,000 − 100,000) = 27,000.
  assert.equal(round(r.usc.selfEmployedSurcharge), 27_000, "Self-employed USC surcharge");
});

test("(c) married, two incomes — €80,000 + €30,000 spouse, age 40, 2026", () => {
  const input: IncomeTaxInput = {
    maritalStatus: "married",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 40,
    employmentIncome: 80_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
    spouseEmploymentIncome: 30_000,
    spouseSelfEmploymentOrOtherIncome: 0,
  };
  const r = computeIrishTax(input, 2026);

  assert.equal(round(r.grossIncome), 110_000, "Household income");
  assert.equal(round(r.yourIncome), 80_000, "Your income");
  assert.equal(round(r.spouseIncome), 30_000, "Spouse income");

  // SRCOP: 53,000 + min(35,000, 30,000) = 83,000.
  assert.equal(r.incomeTax.standardRateCutOff, 83_000, "Joint SRCOP");
  // 20% × 83,000 = 16,600; 40% × 27,000 = 10,800.
  assert.equal(round(r.incomeTax.taxAtStandard), 16_600, "Tax @ 20%");
  assert.equal(round(r.incomeTax.taxAtHigher), 10_800, "Tax @ 40%");
  // Credits: married personal 4,000 + your PAYE 2,000 + spouse PAYE 2,000.
  assert.equal(round(r.incomeTax.totalCredits), 8_000, "Tax credits");
  assert.equal(round(r.incomeTax.netTax), 19_400, "Net tax");

  // USC per person: yours on 80,000 = 2,430.62; spouse on 30,000 = 432.82.
  assert.equal(round(r.usc.total), 2_431, "Your USC");
  assert.equal(round(r.spouseUsc.total), 433, "Spouse USC");

  // PRSI per person at 4.2%: 3,360 + 1,260.
  assert.equal(round(r.prsi.total), 3_360, "Your PRSI");
  assert.equal(round(r.spousePrsi.total), 1_260, "Spouse PRSI");

  // Net: 110,000 − 19,400 − 2,863.44 − 4,620 = 83,116.56.
  assert.equal(round(r.netIncome), 83_117, "Household net income");
});

test("(d) married, one income — spouse fields empty keep the €53,000 band", () => {
  const input: IncomeTaxInput = {
    maritalStatus: "married",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 40,
    employmentIncome: 60_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  const r = computeIrishTax(input, 2026);

  assert.equal(r.incomeTax.standardRateCutOff, 53_000, "One-income married SRCOP");
  // 20% × 53,000 = 10,600; 40% × 7,000 = 2,800; credits 4,000 + 2,000.
  assert.equal(round(r.incomeTax.netTax), 7_400, "Net tax");
  assert.equal(round(r.spouseUsc.total), 0, "No spouse USC");
  assert.equal(round(r.spousePrsi.total), 0, "No spouse PRSI");
});

test("(e) spouse income ignored unless married", () => {
  const input: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 30,
    employmentIncome: 50_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
    spouseEmploymentIncome: 30_000,
  };
  const r = computeIrishTax(input, 2026);
  assert.equal(round(r.grossIncome), 50_000, "Spouse income not counted");
  assert.equal(round(r.spouseIncome), 0);
  assert.equal(round(r.incomeTax.netTax), 7_200, "Same as single case (a)");
});

/* ---------- Budget 2027 ----------
   Golden figures from the Department of Finance, "Budget 2027 Tax Policy
   Changes" (6 Oct 2026): Table 2 (single PAYE), Tables 3 and 4, and the
   illustrative Examples. Its PRSI blends the October rate rise, so only the
   year-on-year gain (where PRSI moves by the same 0.15% either way), income
   tax and USC are compared. */

const person = (over: Partial<IncomeTaxInput>): IncomeTaxInput => ({
  maritalStatus: "single",
  hasChildOnChildBenefit: false,
  isPrincipalCarerOfDependentChild: false,
  age: 40,
  employmentIncome: 0,
  selfEmploymentOrOtherIncome: 0,
  pensionContribution: 0,
  ...over,
});

const taxBothYears = (input: IncomeTaxInput) => {
  const a = computeIrishTax(input, 2026);
  const b = computeIrishTax(input, 2027);
  return {
    it: [round(a.incomeTax.netTax), round(b.incomeTax.netTax)],
    usc: [round(a.usc.total + a.spouseUsc.total), round(b.usc.total + b.spouseUsc.total)],
  };
};

test("2027: DoF Table 2, single PAYE, yearly gain at every income", () => {
  const gains: [number, number][] = [
    [30_000, 218], [35_000, 214], [40_000, 206], [45_000, 399],
    [50_000, 691], [55_000, 684], [65_000, 669], [75_000, 654],
    [100_000, 616], [125_000, 579], [150_000, 541], [175_000, 504],
  ];
  for (const [gross, gain] of gains) {
    const c = compareYears(person({ employmentIncome: gross }), 2027, 2026);
    assert.equal(round(c.delta.annual), gain, `€${gross}`);
  }
});

test("2027: DoF Examples 2 and 4, Table 4: income tax and USC", () => {
  // Example 2: single parent, principal carer, €70,000.
  assert.deepEqual(
    taxBothYears(person({ employmentIncome: 70_000, hasChildOnChildBenefit: true, isPrincipalCarerOfDependentChild: true })),
    { it: [12_500, 11_750], usc: [1_633, 1_617] },
  );
  // Example 4: single, €52,000.
  assert.deepEqual(taxBothYears(person({ employmentIncome: 52_000 })), {
    it: [8_000, 7_250],
    usc: [1_093, 1_077],
  });
  // Table 4: self-employed single, €50,000.
  assert.deepEqual(taxBothYears(person({ selfEmploymentOrOtherIncome: 50_000 })), {
    it: [7_200, 6_450],
    usc: [1_033, 1_017],
  });
});

test("2027: DoF Example 8, married two incomes €90,000 + €37,500", () => {
  assert.deepEqual(
    taxBothYears(person({ maritalStatus: "married", employmentIncome: 90_000, spouseEmploymentIncome: 37_500 })),
    { it: [25_400, 23_900], usc: [3_888, 3_856] },
  );
});

test("2027: DoF Example 3, single €75,000 renting at €1,700 a month", () => {
  assert.deepEqual(taxBothYears(person({ employmentIncome: 75_000, rentPaid: 1_700 * 12 })), {
    it: [16_200, 15_300],
    usc: [2_031, 2_015],
  });
});

test("2027: DoF Table 3 and Examples 6 and 9, one income with the Home Carer credit", () => {
  const homeCarer = (gross: number) =>
    taxBothYears(person({ maritalStatus: "married", hasChildOnChildBenefit: true, employmentIncome: gross, claimHomeCarerCredit: true })).it;
  assert.deepEqual(homeCarer(45_000), [1_050, 575], "Table 3, €45,000");
  assert.deepEqual(homeCarer(65_000), [7_450, 6_475], "Table 3, €65,000");
  assert.deepEqual(homeCarer(42_125), [475, 0], "Example 6");
  assert.deepEqual(homeCarer(55_500), [3_650, 2_675], "Example 9");
});

test("Home Carer credit: taper on the carer's income", () => {
  const credit = (spouseIncome: number) =>
    computeIrishTax(
      person({ maritalStatus: "married", employmentIncome: 35_000, spouseEmploymentIncome: spouseIncome, claimHomeCarerCredit: true }),
      2026,
    ).incomeTax.credits.find((c) => c.name === "Home Carer Tax Credit")?.amount ?? 0;
  assert.equal(credit(7_200), 1_950, "full at the threshold");
  assert.equal(credit(9_200), 950, "Revenue's 2026 table: €9,200 → €950");
  assert.equal(credit(11_100), 0, "nil at €11,100");
});

test("Home Carer credit: the band increase is kept when it is worth more", () => {
  // €60,000 + €9,200: the band increase (€9,200 at 20% instead of 40% =
  // €1,840) beats the tapered credit (€950).
  const r = computeIrishTax(
    person({ maritalStatus: "married", employmentIncome: 60_000, spouseEmploymentIncome: 9_200, claimHomeCarerCredit: true }),
    2026,
  );
  assert.equal(r.incomeTax.standardRateCutOff, 62_200);
  assert.equal(r.incomeTax.credits.some((c) => c.name === "Home Carer Tax Credit"), false);
});

test("Home Carer credit: ignored unless married and claimed", () => {
  const single = computeIrishTax(person({ employmentIncome: 40_000, claimHomeCarerCredit: true }), 2026);
  assert.equal(single.incomeTax.credits.some((c) => c.name === "Home Carer Tax Credit"), false);
  const notClaimed = computeIrishTax(person({ maritalStatus: "married", employmentIncome: 40_000 }), 2026);
  assert.equal(notClaimed.incomeTax.credits.some((c) => c.name === "Home Carer Tax Credit"), false);
});

test("Rent credit: 20% of rent, capped, joint cap for a couple, never below zero tax", () => {
  const rent = (input: Partial<IncomeTaxInput>, year: number) =>
    computeIrishTax(person(input), year).incomeTax.credits.find((c) => c.name === "Rent Tax Credit")?.amount ?? 0;
  assert.equal(rent({ employmentIncome: 50_000, rentPaid: 3_000 }, 2026), 600, "20% of €3,000");
  assert.equal(rent({ employmentIncome: 50_000, rentPaid: 20_000 }, 2026), 1_000, "2026 cap");
  assert.equal(rent({ employmentIncome: 50_000, rentPaid: 20_000 }, 2027), 1_150, "2027 cap");
  assert.equal(
    rent({ maritalStatus: "married", employmentIncome: 50_000, rentPaid: 20_000 }, 2027),
    2_300,
    "2027 couple cap",
  );
  const low = computeIrishTax(person({ employmentIncome: 15_000, rentPaid: 20_000 }), 2027);
  assert.equal(low.incomeTax.netTax, 0, "credits cannot make tax negative");
  assert.equal(computeIrishTax(person({ employmentIncome: 50_000 }), 2027).incomeTax.credits.some((c) => c.name === "Rent Tax Credit"), false);
});

test("comparisonYears: follows the calendar, held to years with rates", () => {
  assert.deepEqual(comparisonYears(new Date("2026-10-13T12:00:00Z")), { current: 2026, prior: 2025 });
  assert.deepEqual(comparisonYears(new Date("2026-12-31T23:59:59Z")), { current: 2026, prior: 2025 });
  assert.deepEqual(comparisonYears(new Date("2027-01-01T00:00:00Z")), { current: 2027, prior: 2026 });
  assert.deepEqual(comparisonYears(new Date("2028-06-01T00:00:00Z")), { current: 2027, prior: 2026 }, "no 2028 rates yet");
  assert.deepEqual(comparisonYears(new Date("2024-06-01T00:00:00Z")), { current: 2026, prior: 2025 }, "never before the earliest pair");
});
