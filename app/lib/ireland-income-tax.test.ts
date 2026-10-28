/* Unit tests for the Irish income tax engine.
   Run: node --test app/lib/ireland-income-tax.test.ts   (Node 22.6+ strips types)

   Two known-good cases:
   (a) simple PAYE employee sanity check,
   (b) the VERIFIED REFERENCE CASE captured from the live Deloitte calculator:
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

/** Displayed figures are whole euros: compare rounded, like the UI shows them. */
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

test("(b) VERIFIED REFERENCE CASE: €4M employment + €1M self-emp + €2M pension, age 30", () => {
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
  // Deloitte now blends the 1 October PRSI rise (4.2375% for 2026); the
  // original capture used the flat 4.2% (210,000 and 2,365,969).
  assert.equal(round(r.prsi.total), 211_875, "PRSI");
  assert.equal(round(r.netIncome), 2_364_094, "Annual Net Income");

  // Combined employment credit must NOT stack (2,000, not 4,000): both income types.
  const employmentCredit = r.incomeTax.credits.find((c) =>
    c.name.includes("Earned Income") || c.name.includes("PAYE"),
  );
  assert.equal(employmentCredit?.amount, 2_000, "Combined employment credit capped at €2,000");

  // USC surcharge slice: 3% × (1,000,000 − 100,000) = 27,000.
  assert.equal(round(r.usc.selfEmployedSurcharge), 27_000, "Self-employed USC surcharge");
});

test("(c) married, two incomes: €80,000 + €30,000 spouse, age 40, 2026", () => {
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

  // PRSI per person at the blended 4.2375%: 3,390 + 1,271.25.
  assert.equal(round(r.prsi.total), 3_390, "Your PRSI");
  assert.equal(round(r.spousePrsi.total), 1_271, "Spouse PRSI");

  // Both are auto-enrolled in MyFutureFund: 1.5% × (80,000 + 30,000) = 1,650.
  assert.equal(r.autoEnrolment, 1_650, "MyFutureFund");

  // Net: 110,000 − 19,400 − 2,863.44 − 4,661.25 − 1,650 = 81,425.31.
  assert.equal(round(r.netIncome), 81_425, "Household net income");
});

test("(d) married, one income: spouse fields empty keep the €53,000 band", () => {
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

/* Captured from the Deloitte Ireland calculator (2027 vs 2026) on 23 Oct 2026. */
test("Deloitte 2027: widowed, no children, €45,000, age 55 gets the widowed credit", () => {
  const input: IncomeTaxInput = {
    maritalStatus: "widowed",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 55,
    employmentIncome: 45_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  for (const [year, credits, netTax, usc] of [[2027, 4_790, 4_210, 867], [2026, 4_540, 4_660, 883]]) {
    const r = computeIrishTax(input, year);
    assert.equal(round(r.incomeTax.totalCredits), credits, `${year} credits`);
    assert.equal(round(r.incomeTax.netTax), netTax, `${year} net tax`);
    assert.equal(round(r.usc.total), usc, `${year} USC`);
  }
});

test("Deloitte 2027: no PRSI from age 66, for you or your spouse", () => {
  const single: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 67,
    employmentIncome: 40_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  const r = computeIrishTax(single, 2027);
  assert.equal(round(r.incomeTax.netTax), 3_505, "net tax");
  assert.equal(round(r.usc.total), 717, "USC");
  assert.equal(r.prsi.total, 0, "PRSI");
  const couple = computeIrishTax({ ...single, maritalStatus: "married", spouseEmploymentIncome: 20_000 }, 2027);
  assert.equal(couple.spousePrsi.total, 0, "spouse PRSI");
  assert.ok(computeIrishTax({ ...single, age: 65 }, 2027).prsi.total > 0, "still charged at 65");
});

test("Deloitte 2027: blended PRSI and MyFutureFund give the same take-home", () => {
  const base: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 35,
    employmentIncome: 50_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  // [year, PRSI, MyFutureFund, annual net income], as Deloitte shows them.
  for (const [year, prsi, ae, net] of [[2027, 2_194, 750, 39_589], [2026, 2_119, 750, 38_898]]) {
    const r = computeIrishTax(base, year);
    assert.equal(round(r.prsi.total), prsi, `${year} PRSI`);
    assert.equal(r.autoEnrolment, ae, `${year} MyFutureFund`);
    assert.equal(round(r.netIncome), net, `${year} net income`);
  }
  // Contributions stop at €80,000 of pay (s.58), and nobody is enrolled who
  // pays into a pension, is over 60, or before the scheme began in 2026.
  assert.equal(computeIrishTax({ ...base, employmentIncome: 120_000 }, 2027).autoEnrolment, 1_200);
  assert.equal(computeIrishTax({ ...base, pensionContribution: 1 }, 2027).autoEnrolment, 0);
  assert.equal(computeIrishTax({ ...base, age: 61 }, 2027).autoEnrolment, 0);
  assert.equal(computeIrishTax({ ...base, employmentIncome: 19_999 }, 2027).autoEnrolment, 0);
  assert.equal(computeIrishTax(base, 2025).autoEnrolment, 0);
});

test("Deloitte 2027: credits capped at 20% of income, and PRSI on small or side income", () => {
  const base: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 40,
    employmentIncome: 0,
    selfEmploymentOrOtherIncome: 4_000,
    pensionContribution: 0,
  };
  // €4,000 self-employed: Earned Income Credit is 20% of it (€800), and no
  // PRSI under €5,000.
  const small = computeIrishTax(base, 2027);
  assert.equal(small.incomeTax.totalCredits, 2_125 + 800, "credits");
  assert.equal(small.prsi.total, 0, "PRSI under €5,000");
  // Self-employed only, above €5,000: the €650 minimum applies.
  assert.equal(computeIrishTax({ ...base, selfEmploymentOrOtherIncome: 10_000 }, 2027).prsi.total, 650);
  // €67,000 PAYE + €12,000 other: the rate on both, no €650 minimum.
  const side = computeIrishTax({ ...base, age: 58, employmentIncome: 67_000, selfEmploymentOrOtherIncome: 12_000 }, 2027);
  assert.equal(round(side.prsi.total), 3_466, "PRSI");
});

test("Deloitte 2027: MyFutureFund boundaries", () => {
  const base: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 40,
    employmentIncome: 30_000,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  assert.equal(computeIrishTax({ ...base, age: 23 }, 2027).autoEnrolment, 0, "age 23");
  assert.equal(computeIrishTax({ ...base, age: 24 }, 2027).autoEnrolment, 450, "age 24");
  assert.equal(computeIrishTax({ ...base, age: 59 }, 2027).autoEnrolment, 450, "age 59");
  assert.equal(computeIrishTax({ ...base, age: 60 }, 2027).autoEnrolment, 0, "age 60");
  assert.equal(computeIrishTax({ ...base, employmentIncome: 20_000 }, 2027).autoEnrolment, 0, "exactly €20,000");
});

/* Captured from the live Deloitte Ireland calculator (services.deloitte.ie) on
   26 Oct 2026, every line, both years. Rent cases tick Deloitte's "eligible for
   the Rent Tax Credit", which assumes the full credit, so rent is set high. */
test("Deloitte 2027 vs 2026: twelve households, every line", () => {
  const base: IncomeTaxInput = {
    maritalStatus: "single",
    hasChildOnChildBenefit: false,
    isPrincipalCarerOfDependentChild: false,
    age: 35,
    employmentIncome: 0,
    selfEmploymentOrOtherIncome: 0,
    pensionContribution: 0,
  };
  // [case, input, [net tax, USC, PRSI, MyFutureFund, annual net] for 2027, then 2026]
  const cases: [string, Partial<IncomeTaxInput>, number[], number[]][] = [
    ["single €38k", { employmentIncome: 38_000 }, [3_350, 657, 1_667, 570, 31_756], [3_600, 673, 1_610, 570, 31_547]],
    ["single €85k, €5k pension", { age: 45, employmentIncome: 85_000, pensionContribution: 5_000 }, [18_450, 2_815, 3_729, 0, 55_006], [19_200, 2_831, 3_602, 0, 54_368]],
    ["married, one income €70k", { maritalStatus: "married", age: 40, employmentIncome: 70_000 }, [10_525, 1_617, 3_071, 1_050, 53_737], [11_400, 1_633, 2_966, 1_050, 52_951]],
    ["married €60k + €30k", { maritalStatus: "married", age: 40, employmentIncome: 60_000, spouseEmploymentIncome: 30_000 }, [10_400, 1_737, 3_949, 1_350, 72_565], [11_400, 1_766, 3_814, 1_350, 71_671]],
    ["self-employed €55k", { age: 30, selfEmploymentOrOtherIncome: 55_000 }, [8_450, 1_167, 2_413, 0, 42_970], [9_200, 1_183, 2_331, 0, 42_287]],
    ["age 68, €40k", { age: 68, employmentIncome: 40_000 }, [3_505, 717, 0, 0, 35_778], [3_755, 733, 0, 0, 35_512]],
    ["single parent €45k", { hasChildOnChildBenefit: true, isPrincipalCarerOfDependentChild: true, employmentIncome: 45_000 }, [2_850, 867, 1_974, 675, 38_634], [3_100, 883, 1_907, 675, 38_435]],
    ["€120k PAYE + €10k other", { employmentIncome: 120_000, selfEmploymentOrOtherIncome: 10_000 }, [38_450, 6_415, 5_704, 1_200, 78_232], [39_200, 6_431, 5_509, 1_200, 77_661]],
    ["renter €32k", { age: 28, employmentIncome: 32_000, rentPaid: 50_000 }, [1_000, 477, 1_404, 480, 28_639], [1_400, 493, 1_356, 480, 28_271]],
    ["widowed €40k", { maritalStatus: "widowed", age: 50, employmentIncome: 40_000 }, [3_210, 717, 1_755, 600, 33_718], [3_460, 733, 1_695, 600, 33_512]],
    ["age 72, €20k + €30k other", { age: 72, employmentIncome: 20_000, selfEmploymentOrOtherIncome: 30_000 }, [6_205, 820, 0, 0, 42_975], [6_955, 820, 0, 0, 42_225]],
    ["married €150k + €20k other, renting", { maritalStatus: "married", age: 50, employmentIncome: 150_000, spouseSelfEmploymentOrOtherIncome: 20_000, rentPaid: 50_000 }, [42_100, 8_234, 7_459, 1_200, 111_007], [43_400, 8_250, 7_204, 1_200, 109_946]],
  ];
  for (const [name, input, want2027, want2026] of cases) {
    for (const [year, want] of [[2027, want2027], [2026, want2026]] as const) {
      const r = computeIrishTax({ ...base, ...input }, year);
      const got = [
        r.incomeTax.netTax,
        r.usc.total + r.spouseUsc.total,
        r.prsi.total + r.spousePrsi.total,
        r.autoEnrolment,
        r.netIncome,
      ].map(round);
      assert.deepEqual(got, want, `${name}, ${year}: [net tax, USC, PRSI, MyFutureFund, net]`);
    }
  }
});
