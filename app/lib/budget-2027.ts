/* ──────────────────────────────────────────────────────────────────────────
   Budget 2027 for you: the measures, as data, and the personal view of them.

   PURE FUNCTIONS ONLY: no React, no I/O. The page collects a BudgetProfile
   (what applies to the visitor, plus a few numbers) and `personalise` returns
   only the measures that apply, in three tiers that are never mixed:

     exact    worked out from the published rules and the visitor's own
              numbers. Only these are added up, per year and one-off apart.
     perUnit  the official change per litre, pack or hour. A personal figure
              appears only when the visitor gives their own usage, and it is
              never added into the total.
     info     changes that cost or save nothing until the visitor acts.

   Every figure was checked against an official source (docs/budget-2027-plan.md
   section 6 has how). Anything no official source has published yet carries
   `starts.label` "Not announced yet" and states no date as fact.

   Tax lines come from the income tax engine (compareYears 2027 vs 2026), so
   an admin edit to the stored rates flows through here too.

   General information, not advice: the page says so, and nothing here may be
   phrased as a recommendation.
   ────────────────────────────────────────────────────────────────────────── */

import {
  computeIrishTax,
  eur,
  RATES_BY_YEAR,
  type IncomeTaxInput,
  type IncomeTaxResult,
  type YearRates,
} from "./ireland-income-tax.ts";
import { BUDGETS } from "./budgets.ts";

/** The two tax years this Budget compares. Copying the module for a later
    Budget means moving these (and the prose dates), nothing else in code. */
export const YEARS = { before: 2026, after: 2027 } as const;

/** When the figures below were last checked: `checked` on this Budget in budgets.ts,
    which the calculator pages and home page show too. Move it whenever one changes. */
export const BUDGET_DATA_AS_OF = BUDGETS.find((b) => b.year === YEARS.after)?.checked ?? "";

/* ---------- sources ---------- */

export const BUDGET_SOURCES = {
  dofTax: {
    label: "Department of Finance, Budget 2027 Tax Policy Changes",
    url: "https://assets.gov.ie/static/documents/c6792805/20261012_Budget_2027_Tax_Policy_Changes_Book.pdf",
  },
  budgetInBrief: {
    label: "Budget in Brief 2027",
    url: "https://assets.gov.ie/static/documents/4131c603/BIB2027_Online_Interactive_Version_Final_V2.pdf",
  },
  expenditure: {
    label: "2027 Expenditure Report",
    url: "https://assets.gov.ie/static/documents/b1dd35a3/2027_Expenditure_Report_For_Print.pdf",
  },
  speech: {
    label: "Minister for Finance, Budget 2027 statement",
    url: "https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/",
  },
  dsp: {
    label: "Department of Social Protection, Budget 2027",
    url: "https://www.gov.ie/en/department-of-social-protection/publications/budget-2027/",
  },
  dcde: {
    label: "Department of Children, Disability and Equality, Budget 2027",
    url: "https://www.gov.ie/en/department-of-children-disability-and-equality/press-releases/press-release-budget-2027/",
  },
  revenueHtb: {
    label: "Revenue, Help to Buy: how much can you claim",
    url: "https://www.revenue.ie/en/property/help-to-buy-incentive/how-much-can-you-claim.aspx",
  },
  revenueRent: {
    label: "Revenue, Rent Tax Credit",
    url: "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-credit/how-much-claim.aspx",
  },
  revenueCat: {
    label: "Revenue eBrief 149/26, CAT group thresholds",
    url: "https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-1492026.aspx",
  },
  revenueCgt: {
    label: "Revenue eBrief 142/26, CGT rate",
    url: "https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-1422026.aspx",
  },
  revenueTobacco: {
    label: "Revenue, Tobacco Products Tax manual",
    url: "https://www.revenue.ie/en/tax-professionals/tdm/excise/tobacco-products-tax/tobacco-products-tax-manual.pdf",
  },
  revenueEnergy: {
    label: "Revenue, energy excise duty rates",
    url: "https://www.revenue.ie/en/tax-professionals/tdm/excise/excise-duty-rates/energy-excise-duty-rates.pdf",
  },
  revenueMortgage: {
    label: "Revenue, Mortgage Interest Tax Credit",
    url: "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/mortgage/interest-paid.aspx",
  },
  financeAct2025: {
    label: "Finance Act 2025",
    url: "https://www.irishstatutebook.ie/eli/2025/act/18/enacted/en/print.html",
  },
  roadmap: {
    label: "Department of Finance, Roadmap for the Taxation of Retail Investment",
    url: "https://assets.gov.ie/static/documents/a5d640c2/Roadmap_for_the_Taxation_of_Retail_Investment.pdf",
  },
} as const;

type SourceKey = keyof typeof BUDGET_SOURCES;

/* ---------- the visitor ---------- */

export interface BudgetProfile {
  // Work and income
  employee: boolean;
  selfEmployed: boolean;
  minimumWage: boolean;
  /** Gross pay for 2026, euro a year. */
  employmentIncome: number;
  selfEmploymentIncome: number;
  /** Hours a week at the minimum wage, for the minimum wage line. */
  minimumWageHours: number;

  // Home
  renting: boolean;
  /** Rent paid for your home, euro a month. */
  rentMonthly: number;
  mortgage: boolean;
  buyingFirstHome: boolean;
  homePrice: number;
  /** Income tax and DIRT paid in the four years before applying; 0 = not given. */
  taxPaidFourYears: number;
  lettingRoom: boolean;
  solarExport: boolean;
  /** Owns a vacant or run-down building (Derelict Property Tax). */
  derelictProperty: boolean;

  // Family
  married: boolean;
  spouseIncome: number;
  homeCarer: boolean;
  singleParent: boolean;
  /** Gates the child counts below (an unticked chip keeps its old counts). */
  hasChildren: boolean;
  childrenUnder12: number;
  children12Plus: number;
  childcare: boolean;
  childcareHours: number;
  /** Gates studentsInCollege. */
  college: boolean;
  studentsInCollege: number;

  // Age and support
  age66Plus: boolean;
  medicalCard: boolean;
  welfarePayment: boolean;
  livingAlone: boolean;
  fuelAllowance: boolean;
  workingFamilyPayment: boolean;
  disabilityPayment: boolean;
  carer: boolean;

  // Money
  funds: boolean;
  mightSell: boolean;
  giftOrInheritance: boolean;

  // Spending
  petrol: boolean;
  diesel: boolean;
  /** Litres a week, optional, for the personal estimate. */
  petrolLitresPerWeek: number;
  dieselLitresPerWeek: number;
  heatingOil: boolean;
  /** Litres a year, optional. */
  heatingOilLitresPerYear: number;
  gas: boolean;
  /** kWh a year (on the bill), optional. */
  gasKwhPerYear: number;
  smoker: boolean;
  /** Packs of 20 a week, optional. */
  packsPerWeek: number;
  vaper: boolean;
  buyingCar: boolean;

  // Business
  companyDirector: boolean;
  farmer: boolean;
  childminder: boolean;
}

export const EMPTY_PROFILE: BudgetProfile = {
  employee: false,
  selfEmployed: false,
  minimumWage: false,
  employmentIncome: 0,
  selfEmploymentIncome: 0,
  minimumWageHours: 0,
  renting: false,
  rentMonthly: 0,
  mortgage: false,
  buyingFirstHome: false,
  homePrice: 0,
  taxPaidFourYears: 0,
  lettingRoom: false,
  solarExport: false,
  derelictProperty: false,
  married: false,
  spouseIncome: 0,
  homeCarer: false,
  singleParent: false,
  hasChildren: false,
  childrenUnder12: 0,
  children12Plus: 0,
  childcare: false,
  childcareHours: 0,
  college: false,
  studentsInCollege: 0,
  age66Plus: false,
  medicalCard: false,
  welfarePayment: false,
  livingAlone: false,
  fuelAllowance: false,
  workingFamilyPayment: false,
  disabilityPayment: false,
  carer: false,
  funds: false,
  mightSell: false,
  giftOrInheritance: false,
  petrol: false,
  diesel: false,
  petrolLitresPerWeek: 0,
  dieselLitresPerWeek: 0,
  heatingOil: false,
  heatingOilLitresPerYear: 0,
  gas: false,
  gasKwhPerYear: 0,
  smoker: false,
  packsPerWeek: 0,
  vaper: false,
  buyingCar: false,
  companyDirector: false,
  farmer: false,
  childminder: false,
};

/* ---------- measures ---------- */

type Status = "in-force" | "awaiting-finance-act" | "announced" | "already-law";

const STATUS_LABEL: Record<Status, string> = {
  "in-force": "In effect now, becomes final with the Finance Act",
  "awaiting-finance-act": "Announced, becomes law with the Finance Act",
  announced: "Announced",
  "already-law": "Already law before this Budget",
};

/** The areas, in the order they are shown everywhere. */
export const GROUPS = ["Tax and pay", "Home", "Family", "Support", "Money", "Spending", "Business"] as const;
export type Group = (typeof GROUPS)[number];

/* `vars` carries the visitor's figures behind a sentence below, and
   `variant` which form of it was used, so a page in another language can
   phrase the same facts (messages/budget.ts; checked in i18n.test.ts). */
type Words = { vars?: Record<string, number>; variant?: string };

type Impact = Words &
  (
  | {
      kind: "exact";
      /** Euro; positive means better off. */
      amount: number;
      period: "year" | "once";
      detail: string;
    }
  | {
      kind: "perUnit";
      /** The official change per unit, in words: "27c a litre more". */
      change: string;
      /** True when the change saves money (shown as a saving). */
      cheaper: boolean;
      text: string;
      /** A yearly figure, only when the visitor gave their own usage. Never
          added to the statement's totals. */
      estimate?: string;
    }
  | { kind: "info"; text: string }
  );

interface Starts {
  /** ISO date when one is officially known; used to order the timeline. */
  date?: string;
  label: string;
}

const NOT_ANNOUNCED: Starts = { label: "Not announced yet" };

interface MeasureDef {
  id: string;
  /** One line, the same for everyone: the "everything in the Budget" list. */
  summary: string;
  group: Group;
  title: string;
  starts: Starts;
  status: Status;
  source: SourceKey;
  calculator?: { href: string; label: string };
  appliesTo: (p: BudgetProfile) => boolean;
  impact: (p: BudgetProfile, ctx: Ctx) => Impact;
}

interface Ctx {
  rates: Record<number, YearRates>;
  /** The engine's result for this visitor, computed once per (year, rent
      credit on or off) and shared by every measure that needs it. */
  tax: (year: number, rent: boolean) => IncomeTaxResult;
}

/** What every view of a measure shows, personal or not. */
function toLine(m: MeasureDef) {
  return {
    id: m.id,
    group: m.group,
    title: m.title,
    starts: m.starts,
    status: m.status,
    statusLabel: STATUS_LABEL[m.status],
    source: BUDGET_SOURCES[m.source] as { label: string; url: string },
    calculator: m.calculator,
  };
}

export type PersonalLine = ReturnType<typeof toLine> & { impact: Impact };
export type ExactLine = PersonalLine & { impact: Extract<Impact, { kind: "exact" }> };

/* ---------- helpers ---------- */

const EUR2 = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const eur2 = (n: number) => EUR2.format(n);

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

const children = (p: BudgetProfile) => (p.hasChildren ? pos(p.childrenUnder12) + pos(p.children12Plus) : 0);
const students = (p: BudgetProfile) => (p.college ? pos(p.studentsInCollege) : 0);

const hasIncome = (p: BudgetProfile) =>
  pos(p.employmentIncome) + pos(p.selfEmploymentIncome) + (p.married ? pos(p.spouseIncome) : 0) > 0;

/** The engine's input for this visitor. `rent` switches the rent credit on. */
function taxInput(p: BudgetProfile, opts: { rent: boolean; employmentIncome?: number }): IncomeTaxInput {
  const kids = children(p) > 0;
  return {
    maritalStatus: p.married ? "married" : "single",
    hasChildOnChildBenefit: kids,
    isPrincipalCarerOfDependentChild: !p.married && p.singleParent && kids,
    // Only 65+ changes anything here (the age credit), and the planner does not
    // ask for an exact age, so under 66 is left blank rather than invented.
    age: p.age66Plus ? 66 : 0,
    employmentIncome: opts.employmentIncome ?? pos(p.employmentIncome),
    selfEmploymentOrOtherIncome: pos(p.selfEmploymentIncome),
    pensionContribution: 0,
    spouseEmploymentIncome: p.married ? pos(p.spouseIncome) : 0,
    spouseSelfEmploymentOrOtherIncome: 0,
    rentPaid: opts.rent && p.renting ? pos(p.rentMonthly) * 12 : 0,
    claimHomeCarerCredit: p.married && p.homeCarer,
  };
}

const itUsc = (r: IncomeTaxResult) =>
  r.incomeTax.netTax + r.usc.total + r.spouseUsc.total;
const prsiOf = (r: IncomeTaxResult) => r.prsi.total + r.spousePrsi.total;

/** Weekly welfare rises paid all year. */
const weekly = (perWeek: number) => perWeek * 52;

/** Minimum wage, euro an hour (DoF Tax Policy Changes, Table 2 notes). */
const MINIMUM_WAGE = { from: 14.15, to: 14.94 } as const;

/** Help to Buy (Revenue): the lesser of the cap, 10% of the price and the tax
    paid in the previous four years; new homes up to €500,000 only. */
const HELP_TO_BUY = { capBefore: 30_000, capNow: 35_000, priceShare: 0.1, maxPrice: 500_000 } as const;

export function helpToBuy(price: number, taxPaid: number, cap: number): number {
  const paid = taxPaid > 0 ? taxPaid : Infinity;
  return Math.min(cap, pos(price) * HELP_TO_BUY.priceShare, paid);
}

/** Petrol / diesel, euro a litre at the pump, VAT included. Excise restoration
    recomputed from Revenue's rate tables (non-carbon €541.84 → €338.58 petrol,
    €425.72 → €181.81 diesel per 1,000 litres, plus 23% VAT); carbon per 60-litre
    fill from the Budget in Brief (€1.28 / €1.48 from 1 May 2027). */
const FUEL = {
  petrol: { excise: 0.25, carbonPerFill: 1.28 },
  diesel: { excise: 0.3, carbonPerFill: 1.48 },
  fillLitres: 60,
} as const;

/** Heating, from the Budget in Brief's typical bundles (checked against
    Revenue's rates: kerosene €160.81 → €122.82 per 1,000 litres plus 13.5%
    VAT; gas €11.48 → €8.77 per MWh plus 9% VAT). */
const HEATING = { oilPer1000Litres: 43, gasPer11000Kwh: 32 } as const;

/** Full pump rise per litre once the excise cut has ended and the 1 May 2027
    carbon rise applies. */
const fuelPerLitre = (f: { excise: number; carbonPerFill: number }) =>
  f.excise + f.carbonPerFill / FUEL.fillLitres;

const yearly = (amount: number, more: boolean) => `About ${eur(amount)} a year ${more ? "more" : "less"}`;

/* ---------- the catalogue ---------- */

const MEASURES: MeasureDef[] = [
  /* Tax and pay */
  {
    id: "income-tax",
    summary: "The 20% band rises €2,500 to €46,500 for a single person; personal, employee and earned income credits rise €125; the USC 2% band widens to €30,300.",
    group: "Tax and pay",
    title: "Income tax and USC",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: hasIncome,
    impact: (p, { rates, tax }) => {
      const [a, b] = [tax(YEARS.before, false), tax(YEARS.after, false)];
      const it = a.incomeTax.netTax - b.incomeTax.netTax;
      const usc = a.usc.total + a.spouseUsc.total - (b.usc.total + b.spouseUsc.total);
      // The explanation reads the same rates as the amount, so an admin edit
      // to the stored rates can never leave the two disagreeing.
      const [ra, rb] = [rates[YEARS.before], rates[YEARS.after]];
      const homeCarer = rb.incomeTax.credits.homeCarer - ra.incomeTax.credits.homeCarer;
      const shownHomeCarer = p.married && p.homeCarer && homeCarer > 0 ? homeCarer : 0;
      return {
        kind: "exact",
        amount: it + usc,
        period: "year",
        vars: {
          it,
          usc,
          band: rb.incomeTax.srcop.single - ra.incomeTax.srcop.single,
          credits: rb.incomeTax.credits.personalSingle - ra.incomeTax.credits.personalSingle,
          homeCarer: shownHomeCarer,
          uscBand: rb.usc.bands[1].upTo - ra.usc.bands[1].upTo,
        },
        detail: `${eur(it)} less income tax, ${eur(usc)} less USC. The 20% band rises by ${eur(
          rb.incomeTax.srcop.single - ra.incomeTax.srcop.single,
        )}, the main credits by ${eur(rb.incomeTax.credits.personalSingle - ra.incomeTax.credits.personalSingle)}${
          p.married && p.homeCarer && homeCarer > 0 ? `, the Home Carer credit by ${eur(homeCarer)}` : ""
        } and the USC 2% band by ${eur(rb.usc.bands[1].upTo - ra.usc.bands[1].upTo)}.`,
      };
    },
  },
  {
    id: "prsi",
    summary: "Not a Budget measure: PRSI went from 4.2% to 4.35% on 1 October 2026 and goes to 4.5% on 1 October 2027 under a 2024 law.",
    group: "Tax and pay",
    title: "PRSI rise",
    starts: { date: "2026-10-01", label: "1 October 2026, then 1 October 2027" },
    status: "already-law",
    source: "dofTax",
    appliesTo: (p) => pos(p.employmentIncome) + pos(p.selfEmploymentIncome) > 0,
    impact: (_p, { tax }) => {
      const diff = prsiOf(tax(YEARS.before, false)) - prsiOf(tax(YEARS.after, false));
      return {
        kind: "exact",
        amount: diff,
        period: "year",
        detail:
          "Not part of this Budget: PRSI rose from 4.2% to 4.35% on 1 October 2026 and rises to 4.5% on 1 October 2027 under a 2024 law. Each year uses its blended rate: nine months at the old rate and three at the new one.",
      };
    },
  },
  {
    id: "minimum-wage",
    summary: "Rises 79c to €14.94 an hour.",
    group: "Tax and pay",
    title: "Minimum wage",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "announced",
    source: "dofTax",
    appliesTo: (p) => p.minimumWage && pos(p.minimumWageHours) > 0,
    impact: (p, { rates, tax }) => {
      const rise = (MINIMUM_WAGE.to - MINIMUM_WAGE.from) * pos(p.minimumWageHours) * 52;
      const before = tax(YEARS.after, true).netIncome;
      const after = computeIrishTax(
        taxInput(p, { rent: true, employmentIncome: pos(p.employmentIncome) + rise }),
        YEARS.after,
        rates[YEARS.after],
      ).netIncome;
      return {
        kind: "exact",
        amount: after - before,
        period: "year",
        vars: { from: MINIMUM_WAGE.from, to: MINIMUM_WAGE.to, rise, hours: pos(p.minimumWageHours) },
        detail: `€${MINIMUM_WAGE.from} to €${MINIMUM_WAGE.to} an hour: ${eur(rise)} more gross pay at ${pos(p.minimumWageHours)} hours a week, shown after tax.`,
      };
    },
  },

  /* Home */
  {
    id: "rent-credit",
    summary: "Up €150 to €1,150 a person (€2,300 for a couple), for 2027 and 2028.",
    group: "Home",
    title: "Rent Tax Credit",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "revenueRent",
    appliesTo: (p) => p.renting && pos(p.rentMonthly) > 0 && hasIncome(p),
    impact: (p, { rates, tax }) => {
      const gain = (year: number) => itUsc(tax(year, false)) - itUsc(tax(year, true));
      const [ra, rb] = [rates[YEARS.before].incomeTax.rentCredit, rates[YEARS.after].incomeTax.rentCredit];
      const [max, rise] = p.married
        ? [rb.maxJoint, rb.maxJoint - ra.maxJoint]
        : [rb.maxSingle, rb.maxSingle - ra.maxSingle];
      return {
        kind: "exact",
        amount: gain(YEARS.after) - gain(YEARS.before),
        period: "year",
        vars: { rate: Math.round(rb.rate * 100), max, rise },
        variant: p.married ? "couple" : "person",
        detail: `${Math.round(rb.rate * 100)}% of the rent you pay, now up to ${eur(max)} ${
          p.married ? "for a couple" : "a person"
        } (${eur(rise)} more), never more than the income tax you pay. Not for HAP, RAS, Rent Supplement or approved housing body tenancies.`,
      };
    },
  },
  {
    id: "help-to-buy",
    summary: "The most a first-time buyer of a new home can get rises from €30,000 to €35,000.",
    group: "Home",
    title: "Help to Buy",
    starts: { date: "2026-10-07", label: "Applications from 7 October 2026" },
    status: "in-force",
    source: "revenueHtb",
    appliesTo: (p) => p.buyingFirstHome && pos(p.homePrice) > 0,
    impact: (p): Impact => {
      if (p.homePrice > HELP_TO_BUY.maxPrice) {
        return {
          kind: "info",
          variant: "tooExpensive",
          vars: { price: p.homePrice },
          text: `The limit rose from €30,000 to €35,000, but Help to Buy only covers new homes costing €500,000 or less, so a ${eur(p.homePrice)} home does not qualify.`,
        };
      }
      const before = helpToBuy(p.homePrice, p.taxPaidFourYears, HELP_TO_BUY.capBefore);
      const now = helpToBuy(p.homePrice, p.taxPaidFourYears, HELP_TO_BUY.capNow);
      return {
        kind: "exact",
        amount: now - before,
        period: "once",
        vars: { now, price: p.homePrice, before },
        variant: p.taxPaidFourYears > 0 ? "taxGiven" : "taxMissing",
        detail: `Up to ${eur(now)} on a ${eur(p.homePrice)} new home (was ${eur(before)}): the lesser of €35,000, 10% of the price${
          p.taxPaidFourYears > 0 ? " and the tax you paid in the last four years" : ", and the income tax and DIRT you paid in the last four years, which you did not enter"
        }. First-time buyers, new homes only, mortgage of at least 70%, and you must live there for five years.`,
      };
    },
  },
  {
    id: "mortgage-interest",
    summary: "Not extended: 2026 is the last year it can be claimed.",
    group: "Home",
    title: "Mortgage Interest Tax Credit ends",
    starts: { date: "2026-12-31", label: "Ends with 2026" },
    status: "already-law",
    source: "financeAct2025",
    appliesTo: (p) => p.mortgage,
    impact: () => ({
      kind: "info",
      text: "Not extended. The law covers 2023 to 2026 only; 2026 is the last year, with up to €625 claimed on your 2026 tax return in 2027.",
    }),
  },
  {
    id: "rent-a-room",
    summary: "Tax-free room income rises from €14,000 to €16,000 and covers certain garden units.",
    group: "Home",
    title: "Rent-a-room relief",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.lettingRoom,
    impact: () => ({
      kind: "info",
      text: "Room income up to €16,000 a year is tax-free (was €14,000). It now also covers certain garden or auxiliary units installed after 27 July 2026.",
    }),
  },
  {
    id: "solar",
    summary: "Tax-free profit from selling home-generated electricity rises from €400 to €600.",
    group: "Home",
    title: "Selling solar power to the grid",
    starts: NOT_ANNOUNCED,
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.solarExport,
    impact: () => ({
      kind: "info",
      text: "Up to €600 a year of profit from electricity you sell to the grid is free of income tax, USC and PRSI (was €400). The first tax year has not been announced.",
    }),
  },

  {
    id: "derelict-property",
    summary: "A new tax of 7% of a derelict property's value a year, starting in towns of 4,000 people or more; first payment June 2028.",
    group: "Home",
    title: "Derelict Property Tax",
    starts: { date: "2027-09-01", label: "Preliminary registers 1 September 2027; first payment 23 June 2028" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.derelictProperty,
    impact: () => ({
      kind: "info",
      text: "A new tax of 7% of the property's self-assessed value a year, on residential and commercial buildings the local authority records as derelict. It starts in 107 towns of 4,000 people or more, then 171 towns of 2,000 or more. Owners can ask for a review between 1 September and 30 November 2027; the final register is published on 1 March 2028 and the first payment is due on 23 June 2028. Fixing, clearing or selling the property takes it off the register.",
    }),
  },

  /* Family */
  {
    id: "student-contribution",
    summary: "Cut by €150 to €2,350 a year.",
    group: "Family",
    title: "Student contribution",
    starts: NOT_ANNOUNCED,
    status: "announced",
    source: "expenditure",
    appliesTo: (p) => students(p) > 0,
    impact: (p) => ({
      kind: "exact",
      amount: 150 * students(p),
      period: "year",
      detail: `€150 less a year for each student (€2,500 to €2,350). Which academic year it starts from, and refunds for fees already paid, have not been announced.`,
    }),
  },
  {
    id: "childcare-subsidy",
    summary: "The universal hourly subsidy rises from €2.14 to €2.50 from September 2027; the top weekly fee in Core Funding services falls from €280 to €250.",
    group: "Family",
    title: "Childcare subsidy",
    starts: { date: "2027-09-01", label: "September 2027" },
    status: "announced",
    source: "dcde",
    appliesTo: (p) => p.childcare,
    impact: (p) => {
      const hours = pos(p.childcareHours);
      return {
        kind: "perUnit",
        change: "36c an hour less",
        cheaper: true,
        vars: { perWeek: 0.36 * hours, hours },
        text: "The National Childcare Scheme subsidy rises from €2.14 to €2.50 an hour for children up to senior infants. Separately, the most a Core Funding service can charge for a typical full-time place falls from €280 to €250 a week; its start date has not been announced.",
        estimate:
          hours > 0 ? `${eur2(0.36 * hours)} a week less at ${hours} subsidised hours a week.` : undefined,
      };
    },
  },
  {
    id: "home-carer",
    summary: "Up €100 to €2,050.",
    group: "Family",
    title: "Home Carer Tax Credit",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.married && p.homeCarer,
    impact: () => ({
      kind: "info",
      text: "Up €100 to €2,050. It is already counted in your income tax line above. It tapers away once the home carer's own income passes €7,200.",
    }),
  },
  {
    id: "childminder",
    summary: "Tax-free childminding income rises from €15,000 to €20,000, with no limit on the number of children.",
    group: "Family",
    title: "Childminding relief",
    starts: { date: "2027-01-01", label: "2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.childminder,
    impact: () => ({
      kind: "info",
      text: "Childminding income in your own home is tax-free up to €20,000 a year (was €15,000), and the limit on how many children you mind is removed.",
    }),
  },

  /* Support */
  {
    id: "welfare-rates",
    summary: "Most weekly payments and pensions rise €10 a week from January 2027.",
    group: "Support",
    title: "Weekly social welfare payment",
    starts: { date: "2027-01-01", label: "January 2027" },
    status: "announced",
    source: "dsp",
    appliesTo: (p) => p.welfarePayment,
    impact: () => ({
      kind: "exact",
      amount: weekly(10),
      period: "year",
      detail: "€10 a week more on the personal rate of most weekly payments, including the State Pension. Qualified adult increases rise in proportion.",
    }),
  },
  {
    id: "child-support",
    summary: "Up €6 a week per child, to €64 (under 12) and €84 (12 and over).",
    group: "Support",
    title: "Child Support Payment",
    starts: { date: "2027-01-01", label: "January 2027" },
    status: "announced",
    source: "expenditure",
    appliesTo: (p) => p.welfarePayment && children(p) > 0,
    impact: (p) => ({
      kind: "exact",
      amount: weekly(6) * children(p),
      period: "year",
      detail: `€6 a week more for each child paid with your payment: €64 a week under 12, €84 aged 12 and over.`,
    }),
  },
  {
    id: "living-alone",
    summary: "Up €3 to €25 a week.",
    group: "Support",
    title: "Living Alone Increase",
    starts: { date: "2027-01-01", label: "January 2027" },
    status: "announced",
    source: "expenditure",
    appliesTo: (p) => p.livingAlone,
    impact: () => ({
      kind: "exact",
      amount: weekly(3),
      period: "year",
      detail: "€22 to €25 a week.",
    }),
  },
  {
    id: "fuel-allowance",
    summary: "Up €5 to €43 a week from January 2027.",
    group: "Support",
    title: "Fuel Allowance",
    starts: { date: "2027-01-01", label: "January 2027 (first higher payment in March)" },
    status: "announced",
    source: "dsp",
    appliesTo: (p) => p.fuelAllowance,
    impact: () => ({
      kind: "exact",
      amount: 5 * 28,
      period: "year",
      detail: "€38 to €43 a week. The Department puts a full year at over €1,200, which is 28 weeks at €43; this line is €5 for those 28 weeks. The means limit for a single person aged 66 or over rises from €534 to €640.80 a week.",
    }),
  },
  {
    id: "working-family-payment",
    summary: "Income limits rise €30 a week.",
    group: "Support",
    title: "Working Family Payment",
    starts: { date: "2027-01-01", label: "January 2027" },
    status: "announced",
    source: "expenditure",
    appliesTo: (p) => p.workingFamilyPayment,
    impact: () => ({
      kind: "exact",
      amount: weekly(18),
      period: "year",
      detail: "The income limits rise €30 a week. The payment is 60% of the gap between your family income and the limit, so it rises by up to €18 a week.",
    }),
  },
  {
    id: "cost-of-disability",
    summary: "A one-off €500 in 2027 for people on long-term disability payments.",
    group: "Support",
    title: "Cost of Disability payment",
    starts: { date: "2027-01-01", label: "2027, date not announced" },
    status: "announced",
    source: "expenditure",
    appliesTo: (p) => p.disabilityPayment,
    impact: () => ({
      kind: "exact",
      amount: 500,
      period: "once",
      detail: "A one-off €500 for people getting a long-term disability payment, about 240,000 people. Which payments count has not been published yet.",
    }),
  },
  {
    id: "carers-allowance",
    summary: "The income disregard rises to €1,150 a week (€2,300 for a couple) from July 2027.",
    group: "Support",
    title: "Carer's Allowance income limit",
    starts: { date: "2027-07-01", label: "July 2027" },
    status: "announced",
    source: "expenditure",
    appliesTo: (p) => p.carer,
    impact: () => ({
      kind: "info",
      text: "The income disregard rises to €1,150 a week for a single person and €2,300 for a couple, so more carers qualify or get a higher rate.",
    }),
  },
  {
    id: "christmas-bonus",
    summary: "A 100% Christmas bonus in December 2026.",
    group: "Support",
    title: "Christmas bonus",
    starts: { date: "2026-12-01", label: "December 2026" },
    status: "announced",
    source: "dsp",
    appliesTo: (p) => p.welfarePayment || p.disabilityPayment,
    impact: () => ({
      kind: "info",
      text: "A 100% Christmas bonus is paid in December 2026 to people on long-term social welfare payments.",
    }),
  },
  {
    id: "medical-card-usc",
    summary: "The reduced USC rates for full medical card holders continue to the end of 2027.",
    group: "Support",
    title: "USC with a medical card",
    starts: { label: "Unchanged, runs to the end of 2027" },
    status: "already-law",
    source: "financeAct2025",
    appliesTo: (p) => p.medicalCard,
    impact: () => ({
      kind: "info",
      text: "If you hold a full medical card and your income is €60,000 or less, the reduced USC rates (0.5% and 2%) continue to the end of 2027. Not shown in the income tax line above.",
    }),
  },

  /* Money */
  {
    id: "cgt",
    summary: "The standard rate falls from 33% to 31% for disposals from 7 October 2026.",
    group: "Money",
    title: "Capital gains tax",
    starts: { date: "2026-10-07", label: "Disposals from 7 October 2026" },
    status: "in-force",
    source: "revenueCgt",
    calculator: { href: "/tools/ireland-cgt", label: "CGT calculator" },
    appliesTo: (p) => p.mightSell,
    impact: () => ({
      kind: "info",
      text: "The standard rate falls from 33% to 31%. Development land stays at 33%. The €1,270 annual exemption is unchanged.",
    }),
  },
  {
    id: "cat",
    summary: "Thresholds rise to €420,000, €44,000 and €22,000 for gifts and inheritances from 7 October 2026.",
    group: "Money",
    title: "Gift and inheritance tax",
    starts: { date: "2026-10-07", label: "Gifts and inheritances from 7 October 2026" },
    status: "in-force",
    source: "revenueCat",
    calculator: { href: "/tools/ireland-cat", label: "CAT calculator" },
    appliesTo: (p) => p.giftOrInheritance,
    impact: () => ({
      kind: "info",
      text: "Tax-free thresholds rise: Group A (from a parent) €420,000, Group B (other close relatives) €44,000, Group C €22,000. The 33% rate is unchanged.",
    }),
  },
  {
    id: "exit-tax",
    summary: "Falls from 38% to 35% from 1 January 2027.",
    group: "Money",
    title: "Exit tax on funds, ETFs and life policies",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "speech",
    calculator: { href: "/personal/investment", label: "Investment planner" },
    appliesTo: (p) => p.funds,
    impact: () => ({
      kind: "info",
      text: "Falls from 38% to 35%. The eight-year deemed disposal still applies.",
    }),
  },
  {
    id: "investment-account",
    summary: "A new account from 1 July 2027: 1% a year on value above €50,000, up to €12,000 paid in a year, no deemed disposal.",
    group: "Money",
    title: "New Investment Account",
    starts: { date: "2027-07-01", label: "1 July 2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    calculator: { href: "/investment-account", label: "Investment Account guide" },
    appliesTo: (p) => p.funds || p.mightSell,
    impact: () => ({
      kind: "info",
      text: "For people resident in Ireland, aged 18 or over, with a PPS number: 1% a year on the account's average value above €50,000, up to €12,000 paid in a year, no deemed disposal, and the provider handles the tax. Shares, bonds, UCITS funds (most European ETFs) and insurance-based investment products only; no crypto or derivatives.",
    }),
  },

  /* Spending */
  ...(["petrol", "diesel"] as const).map(
    (kind): MeasureDef => ({
      id: kind,
      summary:
        kind === "petrol"
          ? "The temporary excise cut ends in steps from 28 February to 30 June 2027 (25c a litre); carbon tax rises on 1 May 2027."
          : "The temporary excise cut ends in steps from 28 February to 30 June 2027 (30c a litre); carbon tax rises on 1 May 2027.",
      group: "Spending",
      title: kind === "petrol" ? "Petrol" : "Diesel",
      starts: { date: "2027-02-28", label: "28 February to 30 June 2027" },
      status: "announced",
      source: "dofTax",
      appliesTo: (p) => p[kind],
      impact: (p) => {
        const f = FUEL[kind];
        const perLitre = fuelPerLitre(f);
        const litres = pos(kind === "petrol" ? p.petrolLitresPerWeek : p.dieselLitresPerWeek);
        return {
          kind: "perUnit",
          change: `${Math.round(perLitre * 100)}c a litre more`,
          cheaper: false,
          vars: {
            cents: Math.round(perLitre * 100),
            excise: Math.round(f.excise * 100),
            carbon: f.carbonPerFill,
            yearly: perLitre * litres * 52,
            litres,
          },
          text: `The temporary excise cut ends in steps between 28 February and 30 June 2027, adding ${Math.round(f.excise * 100)}c a litre, VAT included. Carbon tax adds ${eur2(f.carbonPerFill)} to a 60-litre fill from 1 May 2027, and rises again on 13 October 2027.`,
          estimate:
            litres > 0
              ? `${yearly(perLitre * litres * 52, true)} at ${litres} litres a week, once the full rise applies.`
              : undefined,
        };
      },
    }),
  ),
  {
    id: "heating-oil",
    summary: "Carbon tax falls to €48.50 a tonne, about €43 less per 1,000 litres.",
    group: "Spending",
    title: "Home heating oil",
    starts: NOT_ANNOUNCED,
    status: "announced",
    source: "budgetInBrief",
    appliesTo: (p) => p.heatingOil,
    impact: (p) => {
      const litres = pos(p.heatingOilLitresPerYear);
      return {
        kind: "perUnit",
        change: "€43 less per 1,000 litres",
        cheaper: true,
        vars: { yearly: (HEATING.oilPer1000Litres * litres) / 1000, litres },
        text: "Carbon tax falls from €63.50 to €48.50 a tonne and stays there until 2030. The start date has not been announced.",
        estimate:
          litres > 0
            ? `${yearly((HEATING.oilPer1000Litres * litres) / 1000, false)} at ${litres.toLocaleString("en-IE")} litres a year.`
            : undefined,
      };
    },
  },
  {
    id: "gas",
    summary: "Carbon tax falls to €48.50 a tonne, about €32 less per 11,000 kWh.",
    group: "Spending",
    title: "Gas heating",
    starts: NOT_ANNOUNCED,
    status: "announced",
    source: "budgetInBrief",
    appliesTo: (p) => p.gas,
    impact: (p) => {
      const kwh = pos(p.gasKwhPerYear);
      return {
        kind: "perUnit",
        change: "€32 less per 11,000 kWh",
        cheaper: true,
        vars: { yearly: (HEATING.gasPer11000Kwh * kwh) / 11_000, kwh },
        text: "Carbon tax falls from €63.50 to €48.50 a tonne. 11,000 kWh is the Budget's typical home for a year. The start date has not been announced.",
        estimate:
          kwh > 0
            ? `${yearly((HEATING.gasPer11000Kwh * kwh) / 11_000, false)} at ${kwh.toLocaleString("en-IE")} kWh a year.`
            : undefined,
      };
    },
  },
  {
    id: "cigarettes",
    summary: "€1 more on a pack of 20 from 7 October 2026.",
    group: "Spending",
    title: "Cigarettes and tobacco",
    starts: { date: "2026-10-07", label: "7 October 2026" },
    status: "in-force",
    source: "revenueTobacco",
    appliesTo: (p) => p.smoker,
    impact: (p) => {
      const packs = pos(p.packsPerWeek);
      return {
        kind: "perUnit",
        change: "€1 a pack more",
        cheaper: false,
        vars: { yearly: packs * 52, packs },
        text: "€1 more on a pack of 20 in the most popular price band, and in proportion on other tobacco.",
        estimate: packs > 0 ? `${yearly(packs * 52, true)} at ${packs} packs a week.` : undefined,
      };
    },
  },
  {
    id: "vapes",
    summary: "E-liquid excise rises 20c a ml from 1 January 2027.",
    group: "Spending",
    title: "Vapes",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.vaper,
    impact: () => ({
      kind: "perUnit",
      change: "20c a ml more, before VAT",
      cheaper: false,
      text: "Excise on e-liquid rises by 20c a ml before VAT, to 70c a ml in all.",
    }),
  },
  {
    id: "new-car",
    summary: "VRT up 1 point for cars over 80g/km; electric car VRT relief extended to the end of 2028.",
    group: "Spending",
    title: "Buying a new car",
    starts: { date: "2027-01-01", label: "1 January 2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    appliesTo: (p) => p.buyingCar,
    impact: () => ({
      kind: "perUnit",
      change: "1 point more VRT",
      cheaper: false,
      text: "VRT rates rise by 1 percentage point for cars over 80g/km of CO2. The VRT relief on electric cars is extended to the end of 2028.",
    }),
  },

  /* Business */
  {
    id: "company",
    summary: "Employer PRSI threshold €600 a week, start-up relief to 2030, R&D first-year payment €105,000, preliminary tax small company limit €350,000.",
    group: "Business",
    title: "Running a company",
    starts: { date: "2027-01-01", label: "Various" },
    status: "awaiting-finance-act",
    source: "dofTax",
    calculator: { href: "/tools/ireland-corporation-tax", label: "Corporation tax calculator" },
    appliesTo: (p) => p.companyDirector,
    impact: () => ({
      kind: "info",
      text: "Employer PRSI's lower rate applies up to €600 a week of pay (was €552) from 1 January 2027. Start-up relief is extended to the end of 2030. The \"small company\" limit for preliminary tax rises from €200,000 to €350,000. The R&D credit paid in full in year one rises from €87,500 to €105,000.",
    }),
  },
  {
    id: "farm",
    summary: "Flat-rate addition 4.8%, Succession Farm Partnership credit €10,000, farm safety allowances to 2029.",
    group: "Business",
    title: "Farming",
    starts: { date: "2027-01-01", label: "2027" },
    status: "awaiting-finance-act",
    source: "dofTax",
    calculator: { href: "/tools/ireland-capital-allowances", label: "Capital allowances calculator" },
    appliesTo: (p) => p.farmer,
    impact: () => ({
      kind: "info",
      text: "The flat-rate addition for unregistered farmers is 4.8%. The Succession Farm Partnership credit doubles to €10,000 for partnerships registered from 1 January 2027. Accelerated allowances on farm safety equipment run to the end of 2029, with 12 more items.",
    }),
  },
];

/* ---------- the personal view ---------- */

export interface PersonalBudget {
  /** Every exact line: yearly then one-off. */
  exact: ExactLine[];
  yearly: ExactLine[];
  once: ExactLine[];
  perUnit: PersonalLine[];
  info: PersonalLine[];
  totalPerYear: number;
  totalOnce: number;
  /** Dated lines first, in date order; undated ones after. */
  timeline: { starts: Starts; title: string }[];
}

export function personalise(
  profile: BudgetProfile,
  rates: Record<number, YearRates> = RATES_BY_YEAR,
): PersonalBudget {
  const results = new Map<string, IncomeTaxResult>();
  const ctx: Ctx = {
    rates,
    tax: (year, rent) => {
      const key = `${year}:${rent}`;
      let r = results.get(key);
      if (!r) {
        r = computeIrishTax(taxInput(profile, { rent }), year, rates[year]);
        results.set(key, r);
      }
      return r;
    },
  };
  const lines: PersonalLine[] = MEASURES.filter((m) => m.appliesTo(profile)).map((m) => ({
    ...toLine(m),
    impact: m.impact(profile, ctx),
  }));

  const isExact = (l: PersonalLine): l is ExactLine => l.impact.kind === "exact";
  const yearly = lines.filter(isExact).filter((l) => l.impact.period === "year");
  const once = lines.filter(isExact).filter((l) => l.impact.period === "once");
  const total = (ls: ExactLine[]) => ls.reduce((s, l) => s + l.impact.amount, 0);

  const timeline = lines
    .map((l) => ({ starts: l.starts, title: l.title }))
    .sort((a, b) => {
      if (a.starts.date && b.starts.date) return a.starts.date.localeCompare(b.starts.date);
      return a.starts.date ? -1 : b.starts.date ? 1 : 0;
    });

  return {
    exact: [...yearly, ...once],
    yearly,
    once,
    perUnit: lines.filter((l) => l.impact.kind === "perUnit"),
    info: lines.filter((l) => l.impact.kind === "info"),
    totalPerYear: total(yearly),
    totalOnce: total(once),
    timeline,
  };
}

/** Every measure, for the "everything in the Budget" list and for tests. */
export function allMeasures() {
  return MEASURES.map((m) => ({ ...toLine(m), summary: m.summary }));
}

/** The visitor's figures as the income tax calculator's input. */
export function incomeTaxInputFor(profile: BudgetProfile): IncomeTaxInput {
  return taxInput(profile, { rent: true });
}
