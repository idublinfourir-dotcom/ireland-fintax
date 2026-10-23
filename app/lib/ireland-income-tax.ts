/* ──────────────────────────────────────────────────────────────────────────
   Irish personal income tax engine — Income Tax + USC + PRSI.
   Mirrors the public Deloitte Ireland "Income Tax Calculator"
   (https://services.deloitte.ie) input/output model for the 2026 tax year,
   with a 2025 comparison.

   PURE FUNCTIONS ONLY — no React, no I/O — so every figure is unit-testable
   and traceable back to a specific Revenue.ie / gov.ie rule. This is a
   CA-facing tool: nothing here is a black box.

   All rates/bands/credits live in the versioned RATES_<year> config objects
   below, kept separate from the calculation functions, so a future Budget
   change is a DATA update, not a rewrite.

   Sources (verified per line in the config):
   - Income tax bands & credits:
       revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts
   - USC rates & thresholds:
       revenue.ie/en/jobs-and-pensions/usc/standard-rates-thresholds
   - PRSI Class A / Class S:
       gov.ie/en/department-of-social-protection/publications/prsi-class-a-rates
   - Pension contribution relief age bands & €115,000 earnings cap:
       revenue.ie/en/jobs-and-pensions/pensions/tax-relief-for-pension-contributions
   - Home Carer Tax Credit (amount, €7,200 threshold, half-the-excess taper):
       revenue.ie/.../home-carer-credit/home-carer-tax-credit-rates.aspx
   - Rent Tax Credit (20%, maximums, capped at income tax due):
       revenue.ie/.../land-and-property/rent-credit/how-much-claim.aspx
   - 2027: Department of Finance, "Budget 2027 Tax Policy Changes" (6 Oct
       2026), ch. 2 and 3. Its text prints the USC 3% ceiling as €70,444; that
       is a typo, its own Table 2 only reconciles with €70,044 (unchanged).

   These figures are ESTIMATES for guidance only. Known limitations are marked
   `TODO` inline and MUST stay TODOs until checked against the live Revenue
   guidance page — do not silently resolve them.
   ────────────────────────────────────────────────────────────────────────── */

/* Currency / percent formatters (local so this module has no dependencies). */
export const eur = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

export const pct = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);

/* ========================================================================== */
/* Inputs (mirror the fields the Deloitte public calculator collects)          */
/* ========================================================================== */

export type MaritalStatus = "single" | "married" | "widowed";

export interface IncomeTaxInput {
  maritalStatus: MaritalStatus;
  /** "Do you have a child(ren) in respect of whom you are in receipt of child benefit?" */
  hasChildOnChildBenefit: boolean;
  /** "Do you have any dependent child(ren) of which you are the principal carer?" */
  isPrincipalCarerOfDependentChild: boolean;
  /** Age attained during the tax year. */
  age: number;
  employmentIncome: number;
  selfEmploymentOrOtherIncome: number;
  pensionContribution: number;
  /** Spouse/civil partner income — only read when maritalStatus is "married".
      Optional so single-person call sites don't need to pass zeros. */
  spouseEmploymentIncome?: number;
  spouseSelfEmploymentOrOtherIncome?: number;
  /** Rent paid for your home in the year, for the Rent Tax Credit. Whether the
      tenancy qualifies (not HAP / RAS / an approved housing body, registered
      with the RTB) is for the user to confirm. */
  rentPaid?: number;
  /** Married / civil partners only: one spouse works in the home caring for a
      child on Child Benefit, someone aged 65+, or someone permanently
      incapacitated, so the couple may claim the Home Carer Tax Credit. */
  claimHomeCarerCredit?: boolean;
}

/* ========================================================================== */
/* Versioned rate config                                                       */
/* ========================================================================== */

export interface UscBand {
  /** Cumulative upper bound of this band (income up to here). */
  upTo: number;
  rate: number;
}

export interface PensionAgeBand {
  /** Inclusive upper age for this relief band. */
  maxAge: number;
  rate: number;
}

export interface YearRates {
  year: number;

  incomeTax: {
    standardRate: number;
    higherRate: number;
    srcop: {
      /** Single / widowed, no SPCCC. */
      single: number;
      /** Single / widowed WITH the Single Person Child Carer Credit. */
      singleWithSpccc: number;
      /** Married, one income — the base married band. */
      marriedOneIncome: number;
      /** Max band increase for a second income (lower of this and the smaller
          spouse's income is added to the base — €35,000 for 2025/2026). */
      marriedBandIncrease: number;
    };
    credits: {
      personalSingle: number;
      personalMarried: number;
      /** Widowed / surviving civil partner without dependent children, from the
          year after the bereavement year (revenue.ie tax-relief-charts). */
      personalWidowed: number;
      /** Employee (PAYE) credit — applies when employmentIncome > 0. */
      employeePaye: number;
      /** Earned Income credit — applies when self-employment income > 0. */
      earnedIncome: number;
      /**
       * Combined ceiling for the Employee PAYE + Earned Income credits. They do
       * NOT stack: someone with both income types gets this once, not twice.
       */
      employmentCombinedCap: number;
      /** Single Person Child Carer Credit. */
      spccc: number;
      ageSingle: number;
      ageMarried: number;
      /** Home Carer Tax Credit, in full. */
      homeCarer: number;
    };
    /** Age at/above which the Age Tax Credit applies. */
    ageCreditThreshold: number;
    /** Home carer's own income up to this keeps the full Home Carer credit;
        above it the credit falls by half of the excess. */
    homeCarerIncomeThreshold: number;
    /** Rent Tax Credit: `rate` of rent paid, up to the maximum (the joint one
        for a jointly assessed couple). */
    rentCredit: {
      rate: number;
      maxSingle: number;
      maxJoint: number;
    };
  };

  usc: {
    /** Total income at/below this is fully exempt (cliff edge — see computeUSC). */
    exemptionThreshold: number;
    bands: UscBand[];
    reduced: {
      /** Reduced bands apply when age >= this AND total income <= incomeCeiling. */
      ageThreshold: number;
      incomeCeiling: number;
      bands: UscBand[];
    };
    /** Extra USC on self-employment income above this threshold. */
    selfEmployedSurchargeThreshold: number;
    selfEmployedSurchargeRate: number;
  };

  prsi: {
    /**
     * Employee (Class A) / self-employed (Class S) rate, blended over the year:
     * the rate rises each 1 October (4.1% from 2024, 4.2% from 2025, 4.35%
     * from 2026, 4.5% from 2027, Social Welfare (Miscellaneous Provisions)
     * Act 2024), so a year is 9/12 at the old rate and 3/12 at the new one.
     * The Deloitte Ireland calculator does the same ("a composite rate").
     */
    rate: number;
    /** Class S (self-employed) minimum annual contribution. */
    selfEmployedMinimum: number;
    /** Weekly income at/below this is PRSI-exempt (Class A). */
    weeklyExemptionThreshold: number;
    /** Max weekly PRSI Credit (Class A), tapered above the exemption. */
    weeklyCreditMax: number;
    /** Upper weekly income at which the tapered PRSI Credit reaches zero. */
    weeklyCreditTaperUpper: number;
    /** Divisor for the taper: credit reduced by (excess / this). */
    weeklyCreditTaperDivisor: number;
  };

  pension: {
    /** Net relevant earnings are capped at this for relief purposes. */
    earningsCap: number;
    /** Age-banded maximum relief as a % of capped earnings. */
    ageBands: PensionAgeBand[];
  };

  /** MyFutureFund auto-enrolment, from 1 January 2026 (Automatic Enrolment
      Retirement Savings System Act 2024). Set by statute, so it is not in the
      admin editor; the stored-rates parser always takes it from code. */
  autoEnrolment: AutoEnrolmentRates;
}

export interface AutoEnrolmentRates {
  /** Employee contribution as a fraction of pay; 0 before the scheme began. */
  employeeRate: number;
  /** Enrolled when the age reached in the year is strictly between these. */
  minAge: number;
  maxAge: number;
  /** Employment income must be more than this. */
  minEarnings: number;
  /** No contribution on pay above this (s.58 of the 2024 Act). */
  earningsCap: number;
}

/* 1.5% for the first three years (2026 to 2028), then 3%, 4.5% and 6%. */
const AUTO_ENROLMENT: AutoEnrolmentRates = {
  employeeRate: 0.015,
  minAge: 23,
  maxAge: 60,
  minEarnings: 20_000,
  earningsCap: 80_000,
};

/* Age-banded pension relief % — identical across years.
   revenue.ie/en/jobs-and-pensions/pensions/tax-relief-for-pension-contributions
   <30: 15%, 30–39: 20%, 40–49: 25%, 50–54: 30%, 55–59: 35%, 60+: 40%. */
const PENSION_AGE_BANDS: PensionAgeBand[] = [
  { maxAge: 29, rate: 0.15 },
  { maxAge: 39, rate: 0.2 },
  { maxAge: 49, rate: 0.25 },
  { maxAge: 54, rate: 0.3 },
  { maxAge: 59, rate: 0.35 },
  { maxAge: Infinity, rate: 0.4 },
];

export const RATES_2026: YearRates = {
  year: 2026,
  incomeTax: {
    standardRate: 0.2,
    higherRate: 0.4,
    srcop: {
      single: 44_000, // revenue.ie tax-relief-charts (unchanged 2025→2026)
      singleWithSpccc: 48_000, // €44,000 + €4,000 SPCCC band increase
      marriedOneIncome: 53_000,
      marriedBandIncrease: 35_000, // max combined band €88,000
    },
    credits: {
      personalSingle: 2_000,
      personalMarried: 4_000,
      personalWidowed: 2_540,
      employeePaye: 2_000,
      earnedIncome: 2_000,
      employmentCombinedCap: 2_000, // PAYE + Earned Income share ONE €2,000 ceiling
      spccc: 1_900,
      ageSingle: 245,
      ageMarried: 490,
      homeCarer: 1_950, // revenue.ie home-carer-tax-credit-rates (2026 table)
    },
    ageCreditThreshold: 65,
    homeCarerIncomeThreshold: 7_200, // nil at €11,100 = 7,200 + 2 × 1,950
    rentCredit: { rate: 0.2, maxSingle: 1_000, maxJoint: 2_000 },
  },
  usc: {
    exemptionThreshold: 13_000,
    // revenue.ie usc/standard-rates-thresholds (2026):
    // 0.5% on first €12,012; 2% on next €16,688; 3% on next €41,344; 8% balance.
    bands: [
      { upTo: 12_012, rate: 0.005 },
      { upTo: 28_700, rate: 0.02 }, // 12,012 + 16,688
      { upTo: 70_044, rate: 0.03 }, // 28,700 + 41,344
      { upTo: Infinity, rate: 0.08 },
    ],
    reduced: {
      ageThreshold: 70,
      incomeCeiling: 60_000,
      // TODO: also applies to full medical-card holders — there is no medical-card
      // input in this form, so this can only be triggered by age here.
      bands: [
        { upTo: 12_012, rate: 0.005 },
        { upTo: Infinity, rate: 0.02 },
      ],
    },
    selfEmployedSurchargeThreshold: 100_000,
    selfEmployedSurchargeRate: 0.03,
  },
  prsi: {
    rate: 0.042375, // 9/12 at 4.2% + 3/12 at 4.35%
    selfEmployedMinimum: 650,
    weeklyExemptionThreshold: 352,
    weeklyCreditMax: 12,
    weeklyCreditTaperUpper: 424,
    weeklyCreditTaperDivisor: 6,
  },
  pension: {
    earningsCap: 115_000,
    ageBands: PENSION_AGE_BANDS,
  },
  autoEnrolment: AUTO_ENROLMENT,
};

export const RATES_2025: YearRates = {
  year: 2025,
  incomeTax: {
    standardRate: 0.2,
    higherRate: 0.4,
    // Income tax bands and the main credits were unchanged 2025 → 2026.
    srcop: {
      single: 44_000,
      singleWithSpccc: 48_000,
      marriedOneIncome: 53_000,
      marriedBandIncrease: 35_000,
    },
    credits: {
      personalSingle: 2_000,
      personalMarried: 4_000,
      personalWidowed: 2_540,
      employeePaye: 2_000,
      earnedIncome: 2_000,
      employmentCombinedCap: 2_000,
      spccc: 1_900,
      ageSingle: 245,
      ageMarried: 490,
      homeCarer: 1_950, // Finance Act 2024 s466A(2): €1,800 → €1,950
    },
    ageCreditThreshold: 65,
    homeCarerIncomeThreshold: 7_200,
    rentCredit: { rate: 0.2, maxSingle: 1_000, maxJoint: 2_000 },
  },
  usc: {
    exemptionThreshold: 13_000,
    // 2025 bands: 0.5% first €12,012; 2% next €15,370; 3% next €42,662; 8% balance.
    bands: [
      { upTo: 12_012, rate: 0.005 },
      { upTo: 27_382, rate: 0.02 }, // 12,012 + 15,370
      { upTo: 70_044, rate: 0.03 }, // 27,382 + 42,662
      { upTo: Infinity, rate: 0.08 },
    ],
    reduced: {
      ageThreshold: 70,
      incomeCeiling: 60_000,
      bands: [
        { upTo: 12_012, rate: 0.005 },
        { upTo: Infinity, rate: 0.02 },
      ],
    },
    selfEmployedSurchargeThreshold: 100_000,
    selfEmployedSurchargeRate: 0.03,
  },
  prsi: {
    rate: 0.04125, // 9/12 at 4.1% + 3/12 at 4.2%
    selfEmployedMinimum: 650,
    weeklyExemptionThreshold: 352,
    weeklyCreditMax: 12,
    weeklyCreditTaperUpper: 424,
    weeklyCreditTaperDivisor: 6,
  },
  pension: {
    earningsCap: 115_000,
    ageBands: PENSION_AGE_BANDS,
  },
  autoEnrolment: { ...AUTO_ENROLMENT, employeeRate: 0 }, // began 1 Jan 2026
};

/* 2027: Budget 2027 (6 Oct 2026), Department of Finance "Tax Policy Changes"
   ch. 2.1 and 3.1. Announced, not yet law: the Finance Bill enacts it. */
export const RATES_2027: YearRates = {
  ...RATES_2026,
  year: 2027,
  incomeTax: {
    ...RATES_2026.incomeTax,
    srcop: {
      single: 46_500, // +€2,500
      singleWithSpccc: 50_500,
      marriedOneIncome: 55_500,
      marriedBandIncrease: 37_500, // max combined band €93,000
    },
    credits: {
      ...RATES_2026.incomeTax.credits,
      personalSingle: 2_125, // +€125
      personalMarried: 4_250,
      // Not itemised in the Tax Policy Changes book; the Deloitte Ireland
      // calculator applies the same +€125. Re-check against Revenue's 2027 chart.
      personalWidowed: 2_665,
      employeePaye: 2_125,
      earnedIncome: 2_125,
      employmentCombinedCap: 2_125,
      homeCarer: 2_050, // +€100
    },
    rentCredit: { rate: 0.2, maxSingle: 1_150, maxJoint: 2_300 }, // +€150 / +€300
  },
  usc: {
    ...RATES_2026.usc,
    // 2% band ceiling €28,700 → €30,300; the 3% ceiling stays €70,044.
    bands: [
      { upTo: 12_012, rate: 0.005 },
      { upTo: 30_300, rate: 0.02 },
      { upTo: 70_044, rate: 0.03 },
      { upTo: Infinity, rate: 0.08 },
    ],
  },
  prsi: {
    ...RATES_2026.prsi,
    rate: 0.043875, // 9/12 at 4.35% + 3/12 at 4.5%
  },
};

export const RATES_BY_YEAR: Record<number, YearRates> = {
  2027: RATES_2027,
  2026: RATES_2026,
  2025: RATES_2025,
};

/**
 * The tax year a calculator leads with: the calendar year on `now`, limited to
 * the years that have rates, compared with the year before. The income tax
 * page renders per request, so it moves to 2027 v 2026 on 1 January 2027 with
 * no deploy, and holds there until 2028 rates exist. Ireland is on UTC in
 * winter, so the server's UTC date is the Irish date at New Year.
 */
export function comparisonYears(
  now: Date,
  ratesByYear: Record<number, YearRates> = RATES_BY_YEAR,
): { current: number; prior: number } {
  const years = Object.keys(ratesByYear)
    .map(Number)
    .filter((y) => ratesByYear[y - 1])
    .sort((a, b) => b - a);
  const calendar = now.getUTCFullYear();
  const current = years.find((y) => y <= calendar) ?? years[years.length - 1];
  return { current, prior: current - 1 };
}

/* ========================================================================== */
/* Result shape (fully audited — every number carries its reason)              */
/* ========================================================================== */

export interface AppliedCredit {
  name: string;
  amount: number;
  reason: string;
}

export interface UscBandLine {
  rate: number;
  slice: number;
  amount: number;
}

export interface IncomeTaxResult {
  year: number;
  /** Household total: your income + spouse income when married. */
  grossIncome: number;
  yourIncome: number;
  /** 0 unless married with a second income. */
  spouseIncome: number;

  pension: {
    entered: number;
    reliefRate: number;
    /** Amount that actually qualifies for relief (deducted for income tax). */
    qualifying: number;
    /** Contribution above the qualifying cap — gets NO relief. */
    nonQualifyingExcess: number;
  };

  incomeTax: {
    taxableIncome: number;
    standardRateCutOff: number;
    standardPortion: number;
    taxAtStandard: number;
    higherPortion: number;
    taxAtHigher: number;
    grossTax: number;
    credits: AppliedCredit[];
    totalCredits: number;
    netTax: number;
  };

  usc: {
    exempt: boolean;
    reducedBandsApplied: boolean;
    bandBreakdown: UscBandLine[];
    standardUsc: number;
    selfEmployedSurcharge: number;
    total: number;
  };
  /** USC is an individual charge — the spouse's is computed separately on
      their own income (zeroed when not married / no spouse income). */
  spouseUsc: IncomeTaxResult["usc"];

  prsi: {
    classA: number;
    classS: number;
    total: number;
  };
  /** PRSI is an individual charge — see spouseUsc. */
  spousePrsi: IncomeTaxResult["prsi"];

  netIncomeBeforePrsi: number;
  /** MyFutureFund contributions, yours plus your spouse's. Taken from net pay,
      with no tax relief, so they change take-home but not the tax. */
  autoEnrolment: number;
  netIncome: number;
  monthlyNetIncome: number;
  weeklyNetIncome: number;
  effectiveRate: number;
}

/* ========================================================================== */
/* Helpers                                                                     */
/* ========================================================================== */

const clampMin0 = (n: number) => (n > 0 ? n : 0);
const sanitize = (n: number) => (Number.isFinite(n) ? clampMin0(n) : 0);

/** Spouse incomes — zeros unless married (the fields are only read then). */
function spouseIncomes(input: IncomeTaxInput): {
  employment: number;
  selfEmp: number;
  total: number;
} {
  if (input.maritalStatus !== "married") {
    return { employment: 0, selfEmp: 0, total: 0 };
  }
  const employment = sanitize(input.spouseEmploymentIncome ?? 0);
  const selfEmp = sanitize(input.spouseSelfEmploymentOrOtherIncome ?? 0);
  return { employment, selfEmp, total: employment + selfEmp };
}

/* ========================================================================== */
/* Pension relief                                                              */
/* ========================================================================== */

export function pensionReliefRate(age: number, rates: YearRates): number {
  const band = rates.pension.ageBands.find((b) => age <= b.maxAge);
  return band ? band.rate : rates.pension.ageBands[rates.pension.ageBands.length - 1].rate;
}

/**
 * Qualifying pension contribution (the slice that gets income-tax relief).
 *   relief cap = age-band % × min(net relevant earnings, €115,000)
 * Only the QUALIFYING amount reduces taxable income (and later take-home);
 * any excess above the cap gets no relief and is NOT subtracted from net pay.
 */
export function computeQualifyingPension(
  input: IncomeTaxInput,
  rates: YearRates,
): { reliefRate: number; qualifying: number; nonQualifyingExcess: number } {
  const entered = sanitize(input.pensionContribution);
  const relevantEarnings =
    sanitize(input.employmentIncome) + sanitize(input.selfEmploymentOrOtherIncome);
  const reliefRate = pensionReliefRate(input.age, rates);
  const cap = reliefRate * Math.min(relevantEarnings, rates.pension.earningsCap);
  const qualifying = Math.min(entered, cap);
  return {
    reliefRate,
    qualifying,
    nonQualifyingExcess: clampMin0(entered - qualifying),
  };
}

/* ========================================================================== */
/* Income tax                                                                  */
/* ========================================================================== */

function spcccEligible(input: IncomeTaxInput): boolean {
  return (
    input.hasChildOnChildBenefit &&
    input.isPrincipalCarerOfDependentChild &&
    (input.maritalStatus === "single" || input.maritalStatus === "widowed")
  );
}

export function computeIncomeTax(
  input: IncomeTaxInput,
  rates: YearRates,
  qualifyingPension: number,
): IncomeTaxResult["incomeTax"] {
  const it = rates.incomeTax;
  const employment = sanitize(input.employmentIncome);
  const selfEmp = sanitize(input.selfEmploymentOrOtherIncome);
  const yourIncome = employment + selfEmp;
  const spouse = spouseIncomes(input);

  // Married couples are jointly assessed: one tax computation on the combined
  // income. Pension relief reduces taxable income for INCOME TAX ONLY.
  const grossIncome = yourIncome + spouse.total;
  const taxableIncome = clampMin0(grossIncome - qualifyingPension);
  const married = input.maritalStatus === "married";
  const spccc = spcccEligible(input);

  // Standard-rate cut-off point (SRCOP).
  let srcop: number;
  let homeCarerCredit = 0;
  if (married) {
    // €53,000 base + (for two incomes) the lower of the band-increase cap
    // (€35,000) and the smaller income — so a one-income couple stays at the
    // base and the combined band never exceeds €88,000 (2026 values).
    const smallerIncome = Math.min(yourIncome, spouse.total);
    const bandIncrease = Math.min(it.srcop.marriedBandIncrease, smallerIncome);
    srcop = it.srcop.marriedOneIncome + bandIncrease;

    // Home Carer Tax Credit: the home carer is the spouse with the smaller
    // income; above the threshold the credit falls by half the excess.
    // Revenue: a couple cannot have both this credit and the band increase
    // in the same year, so keep whichever leaves less tax.
    if (input.claimHomeCarerCredit) {
      const credit = clampMin0(
        it.credits.homeCarer - clampMin0(smallerIncome - it.homeCarerIncomeThreshold) / 2,
      );
      const taxOn = (cutOff: number) =>
        Math.min(taxableIncome, cutOff) * it.standardRate +
        clampMin0(taxableIncome - cutOff) * it.higherRate;
      const saving = credit - (taxOn(it.srcop.marriedOneIncome) - taxOn(srcop));
      if (credit > 0 && saving > 0) {
        srcop = it.srcop.marriedOneIncome;
        homeCarerCredit = credit;
      }
    }
  } else {
    srcop = spccc ? it.srcop.singleWithSpccc : it.srcop.single;
  }

  const standardPortion = Math.min(taxableIncome, srcop);
  const higherPortion = clampMin0(taxableIncome - srcop);
  const taxAtStandard = standardPortion * it.standardRate;
  const taxAtHigher = higherPortion * it.higherRate;
  const grossTax = taxAtStandard + taxAtHigher;

  // ---- Credits (non-refundable: cannot push tax below zero) ----
  const credits: AppliedCredit[] = [];

  // Personal credit.
  if (married) {
    credits.push({
      name: "Personal Tax Credit",
      amount: it.credits.personalMarried,
      reason: "Married",
    });
  } else {
    // A widowed person without dependent children gets the higher widowed
    // credit; with children it is the single credit (plus the SPCCC below).
    // The bereavement year itself (€4,000) and the Widowed Parent credit need a
    // year-of-bereavement field the form doesn't have, so they are excluded.
    const widowedNoChildren = input.maritalStatus === "widowed" && !input.hasChildOnChildBenefit;
    credits.push({
      name: "Personal Tax Credit",
      amount: widowedNoChildren ? it.credits.personalWidowed : it.credits.personalSingle,
      reason:
        input.maritalStatus === "widowed"
          ? widowedNoChildren
            ? "Widowed, without dependent children"
            : "Widowed, with dependent children"
          : "Single",
    });
  }

  // Employee PAYE + Earned Income credits share ONE combined ceiling, and each
  // is limited to 20% of the income it relates to (revenue.ie employee tax
  // credit and earned income credit pages).
  const hasEmployment = employment > 0;
  const hasSelfEmp = selfEmp > 0;
  const rawEmploymentCredit = employmentCredits(employment, selfEmp, it.credits);
  const employmentCredit = Math.min(rawEmploymentCredit, it.credits.employmentCombinedCap);
  if (employmentCredit > 0) {
    const capped =
      hasEmployment && hasSelfEmp && rawEmploymentCredit > employmentCredit;
    const label =
      hasEmployment && hasSelfEmp
        ? "Employee PAYE + Earned Income Credit"
        : hasEmployment
          ? "Employee PAYE Credit"
          : "Earned Income Credit";
    credits.push({
      name: label,
      amount: employmentCredit,
      reason: capped
        ? "Both employment and self-employment income: shared €2,000 ceiling, does not stack"
        : hasEmployment
          ? "Has employment income"
          : "Has self-employment income",
    });
  }

  // Spouse's own Employee PAYE / Earned Income credits (same combined cap).
  if (married) {
    const spouseRaw = employmentCredits(spouse.employment, spouse.selfEmp, it.credits);
    const spouseCredit = Math.min(spouseRaw, it.credits.employmentCombinedCap);
    if (spouseCredit > 0) {
      credits.push({
        name:
          spouse.employment > 0 && spouse.selfEmp > 0
            ? "Spouse Employee PAYE + Earned Income Credit"
            : spouse.employment > 0
              ? "Spouse Employee PAYE Credit"
              : "Spouse Earned Income Credit",
        amount: spouseCredit,
        reason:
          spouseRaw > spouseCredit
            ? "Spouse has both income types: shared ceiling, does not stack"
            : "Spouse has their own income",
      });
    }
  }

  // Single Person Child Carer Credit.
  if (spccc) {
    credits.push({
      name: "Single Person Child Carer Credit",
      amount: it.credits.spccc,
      reason: "Single/widowed principal carer in receipt of child benefit",
    });
  }

  // Age Tax Credit.
  if (input.age >= it.ageCreditThreshold) {
    credits.push({
      name: "Age Tax Credit",
      amount: married ? it.credits.ageMarried : it.credits.ageSingle,
      reason: `Age ${input.age} ≥ ${it.ageCreditThreshold}`,
    });
  }

  // Home Carer Tax Credit (chosen over the second-income band increase above).
  if (homeCarerCredit > 0) {
    credits.push({
      name: "Home Carer Tax Credit",
      amount: homeCarerCredit,
      reason:
        homeCarerCredit < it.credits.homeCarer
          ? `Reduced by half of the carer's income above €${it.homeCarerIncomeThreshold.toLocaleString("en-IE")}; worth more than the second-income band increase`
          : "Spouse works in the home caring for a dependent person; worth more than the second-income band increase",
    });
  }

  // Rent Tax Credit: a share of rent paid, up to the maximum (joint for a
  // couple). Like every credit it cannot take tax below zero, which is
  // Revenue's "capped at your income tax" rule.
  const rentPaid = sanitize(input.rentPaid ?? 0);
  if (rentPaid > 0) {
    const max = married ? it.rentCredit.maxJoint : it.rentCredit.maxSingle;
    const amount = Math.min(rentPaid * it.rentCredit.rate, max);
    credits.push({
      name: "Rent Tax Credit",
      amount,
      reason:
        amount < max
          ? `${Math.round(it.rentCredit.rate * 100)}% of rent paid`
          : `Maximum for ${married ? "a jointly assessed couple" : "one person"}`,
    });
  }

  const totalCredits = credits.reduce((s, c) => s + c.amount, 0);
  const netTax = clampMin0(grossTax - totalCredits);

  return {
    taxableIncome,
    standardRateCutOff: srcop,
    standardPortion,
    taxAtStandard,
    higherPortion,
    taxAtHigher,
    grossTax,
    credits,
    totalCredits,
    netTax,
  };
}

/* ========================================================================== */
/* USC — charged on GROSS income; pension does NOT reduce it                    */
/* ========================================================================== */

/* USC is charged per individual, so a married couple gets two independent
   computations — each spouse has their own exemption threshold and bands. */
function uscForPerson(
  employment: number,
  selfEmp: number,
  age: number,
  rates: YearRates,
): IncomeTaxResult["usc"] {
  const u = rates.usc;
  const income = employment + selfEmp;

  // Cliff edge: at/below the exemption threshold, NOTHING is charged. One euro
  // over and the full income is taxed through the bands from zero.
  if (income <= u.exemptionThreshold) {
    return {
      exempt: true,
      reducedBandsApplied: false,
      bandBreakdown: [],
      standardUsc: 0,
      selfEmployedSurcharge: 0,
      total: 0,
    };
  }

  const reducedBandsApplied =
    age >= u.reduced.ageThreshold && income <= u.reduced.incomeCeiling;
  const bands = reducedBandsApplied ? u.reduced.bands : u.bands;

  const bandBreakdown: UscBandLine[] = [];
  let lower = 0;
  let standardUsc = 0;
  for (const band of bands) {
    if (income <= lower) break;
    const slice = Math.min(income, band.upTo) - lower;
    const amount = slice * band.rate;
    bandBreakdown.push({ rate: band.rate, slice, amount });
    standardUsc += amount;
    lower = band.upTo;
  }

  // Self-employed surcharge: +3% on self-employment income above €100,000.
  const selfEmployedSurcharge =
    selfEmp > u.selfEmployedSurchargeThreshold
      ? (selfEmp - u.selfEmployedSurchargeThreshold) * u.selfEmployedSurchargeRate
      : 0;

  return {
    exempt: false,
    reducedBandsApplied,
    bandBreakdown,
    standardUsc,
    selfEmployedSurcharge,
    total: standardUsc + selfEmployedSurcharge,
  };
}

export function computeUSC(input: IncomeTaxInput, rates: YearRates): IncomeTaxResult["usc"] {
  return uscForPerson(
    sanitize(input.employmentIncome),
    sanitize(input.selfEmploymentOrOtherIncome),
    input.age,
    rates,
  );
}

/** Spouse USC on the spouse's own income. The form has no spouse-age field
    (Deloitte's doesn't either), so the main applicant's age decides whether
    the 70+ reduced bands apply — an estimate, flagged in the UI footer. */
export function computeSpouseUSC(
  input: IncomeTaxInput,
  rates: YearRates,
): IncomeTaxResult["usc"] {
  const spouse = spouseIncomes(input);
  return uscForPerson(spouse.employment, spouse.selfEmp, input.age, rates);
}

/* ========================================================================== */
/* PRSI — charged on GROSS income at the flat rate; pension does NOT reduce it  */
/* ========================================================================== */

/** Class A (employment income). */
function computePrsiClassA(employment: number, rates: YearRates): number {
  const p = rates.prsi;
  if (employment <= 0) return 0;
  const weekly = employment / 52;
  // Exempt at/below the weekly threshold.
  if (weekly <= p.weeklyExemptionThreshold) return 0;

  const gross = employment * p.rate;

  // Tapered PRSI Credit: max €12/week, reduced by 1/6 of weekly earnings above
  // the exemption, reaching zero at €424/week.
  if (weekly <= p.weeklyCreditTaperUpper) {
    const weeklyCredit = clampMin0(
      p.weeklyCreditMax - (weekly - p.weeklyExemptionThreshold) / p.weeklyCreditTaperDivisor,
    );
    return clampMin0(gross - weeklyCredit * 52);
  }
  return gross;
}

/** Self-employment / other income under this pays no PRSI (revenue.ie). */
const PRSI_OTHER_INCOME_THRESHOLD = 5_000;

/** Class S (self-employment / other income). The €650 minimum is for the
    self-employed; on top of a PAYE job the rate alone applies, as in the
    Deloitte calculator (the field also covers rent and interest, which carry
    no minimum). */
function computePrsiClassS(selfEmp: number, employment: number, rates: YearRates): number {
  const p = rates.prsi;
  if (selfEmp < PRSI_OTHER_INCOME_THRESHOLD) return 0;
  const charge = selfEmp * p.rate;
  return employment > 0 ? charge : Math.max(charge, p.selfEmployedMinimum);
}

function prsiForPerson(
  employment: number,
  selfEmp: number,
  rates: YearRates,
): IncomeTaxResult["prsi"] {
  const classA = computePrsiClassA(employment, rates);
  const classS = computePrsiClassS(selfEmp, employment, rates);
  return { classA, classS, total: classA + classS };
}

/** Age from which PRSI stops being charged. */
export const PRSI_EXEMPT_AGE = 66;

export function computePRSI(input: IncomeTaxInput, rates: YearRates): IncomeTaxResult["prsi"] {
  // No PRSI from 66, as the Deloitte calculator also assumes: that holds for
  // anyone getting the State Pension (Contributory). Someone who defers it
  // keeps paying until 70 (revenue.ie, since 1 Jan 2024); the footnote says so.
  if (input.age >= PRSI_EXEMPT_AGE) return { classA: 0, classS: 0, total: 0 };
  return prsiForPerson(
    sanitize(input.employmentIncome),
    sanitize(input.selfEmploymentOrOtherIncome),
    rates,
  );
}

/** Spouse PRSI on the spouse's own income (individual charge, like USC). */
export function computeSpousePRSI(
  input: IncomeTaxInput,
  rates: YearRates,
): IncomeTaxResult["prsi"] {
  // The form has no spouse age; like USC, the spouse is taken to be in your band.
  if (input.age >= PRSI_EXEMPT_AGE) return { classA: 0, classS: 0, total: 0 };
  const spouse = spouseIncomes(input);
  return prsiForPerson(spouse.employment, spouse.selfEmp, rates);
}

/** Employee PAYE + Earned Income credits before the shared ceiling, each
    limited to 20% of its own income. */
function employmentCredits(
  employment: number,
  selfEmp: number,
  credits: YearRates["incomeTax"]["credits"],
): number {
  return (
    Math.min(credits.employeePaye, employment * 0.2) +
    Math.min(credits.earnedIncome, selfEmp * 0.2)
  );
}

/* ========================================================================== */
/* MyFutureFund auto-enrolment                                                 */
/* ========================================================================== */

/** One person's yearly contribution, as the Deloitte calculator assumes it:
    an employee aged over 23 and under 60 (age reached in the year), earning
    over €20,000, who is enrolled because no pension contribution was entered.
    The boundaries follow Deloitte and the published summaries ("over
    €20,000"); the Act's own wording on the ages is not checked here. The form has no
    spouse age, so the spouse is taken to be in your age range. */
export function computeAutoEnrolment(
  input: IncomeTaxInput,
  rates: YearRates,
  employmentIncome: number,
): number {
  const ae = rates.autoEnrolment;
  if (ae.employeeRate <= 0 || sanitize(input.pensionContribution) > 0) return 0;
  if (input.age <= ae.minAge || input.age >= ae.maxAge) return 0;
  if (employmentIncome <= ae.minEarnings) return 0;
  return Math.min(employmentIncome, ae.earningsCap) * ae.employeeRate;
}

/* ========================================================================== */
/* Top-level: full calculation for one year                                    */
/* ========================================================================== */

export function computeIrishTax(
  input: IncomeTaxInput,
  year: number,
  ratesOverride?: YearRates,
): IncomeTaxResult {
  // Rates normally come from the admin-managed tax_rates table (see
  // tax-data.ts); the versioned configs above are the seed + fallback.
  const rates = ratesOverride ?? RATES_BY_YEAR[year];
  if (!rates) throw new Error(`No rate config for tax year ${year}`);

  const employment = sanitize(input.employmentIncome);
  const selfEmp = sanitize(input.selfEmploymentOrOtherIncome);
  const yourIncome = employment + selfEmp;
  const spouseIncome = spouseIncomes(input).total;
  // Household total — married couples are jointly assessed for income tax.
  const grossIncome = yourIncome + spouseIncome;

  const pension = computeQualifyingPension(input, rates);
  const incomeTax = computeIncomeTax(input, rates, pension.qualifying);
  const usc = computeUSC(input, rates);
  const spouseUsc = computeSpouseUSC(input, rates);
  const prsi = computePRSI(input, rates);
  const spousePrsi = computeSpousePRSI(input, rates);
  const uscTotal = usc.total + spouseUsc.total;
  const prsiTotal = prsi.total + spousePrsi.total;

  // Take-home. The qualifying pension is money actually paid into a pension, so
  // it leaves take-home; the non-qualifying excess is NOT subtracted here.
  const netIncomeBeforePrsi =
    grossIncome - incomeTax.netTax - uscTotal - pension.qualifying;
  const autoEnrolment =
    computeAutoEnrolment(input, rates, sanitize(input.employmentIncome)) +
    computeAutoEnrolment(input, rates, spouseIncomes(input).employment);
  const netIncome = netIncomeBeforePrsi - prsiTotal - autoEnrolment;

  const totalDeductions = incomeTax.netTax + uscTotal + prsiTotal;

  return {
    year,
    grossIncome,
    yourIncome,
    spouseIncome,
    pension: {
      entered: sanitize(input.pensionContribution),
      reliefRate: pension.reliefRate,
      qualifying: pension.qualifying,
      nonQualifyingExcess: pension.nonQualifyingExcess,
    },
    incomeTax,
    usc,
    spouseUsc,
    prsi,
    spousePrsi,
    netIncomeBeforePrsi,
    autoEnrolment,
    netIncome,
    monthlyNetIncome: netIncome / 12,
    weeklyNetIncome: netIncome / 52,
    effectiveRate: grossIncome > 0 ? totalDeductions / grossIncome : 0,
  };
}

/* ========================================================================== */
/* Two-year comparison (Deloitte shows the current + prior year side by side)   */
/* ========================================================================== */

export interface YearComparison {
  current: IncomeTaxResult;
  prior: IncomeTaxResult;
  delta: {
    annual: number;
    monthly: number;
    weekly: number;
  };
}

export function compareYears(
  input: IncomeTaxInput,
  currentYear = 2026,
  priorYear = 2025,
  ratesByYear?: Record<number, YearRates>,
): YearComparison {
  const current = computeIrishTax(input, currentYear, ratesByYear?.[currentYear]);
  const prior = computeIrishTax(input, priorYear, ratesByYear?.[priorYear]);
  return {
    current,
    prior,
    delta: {
      annual: current.netIncome - prior.netIncome,
      monthly: current.monthlyNetIncome - prior.monthlyNetIncome,
      weekly: current.weeklyNetIncome - prior.weeklyNetIncome,
    },
  };
}
