/* Guardrails and the change preview for the income tax admin editor
   (/admin/tax-rates). PURE. The form already rejects non-numbers and
   impossible percentages; these catch the plausible-looking slips (a band of
   4,400 instead of 44,000, a credit of 20,000 instead of 2,000, the two income
   tax rates swapped). The two-step preview is the guard against subtle ones.
   Field keys are the form's input names. */

// Value import needs the explicit .ts extension so `node --test` (native
// type-stripping) can resolve it. Type-only imports are erased.
import { diffRecords, type DiffEntry, type DiffField } from "./rate-diff.ts";
import type { YearRates } from "./ireland-income-tax";

type Kind = "pct" | "euro" | "plain";

interface TaxField {
  key: string;
  label: string;
  kind: Kind;
  get: (r: YearRates) => number;
  /** Plausible range, in stored units (fractions for "pct"). */
  min: number;
  max: number;
}

const CREDIT = { kind: "euro" as const, min: 0, max: 10_000 };
const BAND = { kind: "euro" as const, min: 1_000, max: 1_000_000 };
const USC_RATE = { kind: "pct" as const, min: 0, max: 0.15 };
const RELIEF = { kind: "pct" as const, min: 0, max: 0.5 };
const AGE = { kind: "plain" as const, min: 50, max: 100 };

const PENSION_KEYS = [
  ["pension_rate_u30", "under 30"],
  ["pension_rate_30_39", "30 to 39"],
  ["pension_rate_40_49", "40 to 49"],
  ["pension_rate_50_54", "50 to 54"],
  ["pension_rate_55_59", "55 to 59"],
  ["pension_rate_60_plus", "60+"],
] as const;

export const TAX_RATE_FIELDS: TaxField[] = [
  { key: "it_standard_rate", label: "Standard income tax rate", kind: "pct", min: 0.1, max: 0.4, get: (r) => r.incomeTax.standardRate },
  { key: "it_higher_rate", label: "Higher income tax rate", kind: "pct", min: 0.2, max: 0.6, get: (r) => r.incomeTax.higherRate },
  { key: "age_credit_threshold", label: "Age credit from age", ...AGE, get: (r) => r.incomeTax.ageCreditThreshold },
  { key: "srcop_single", label: "SRCOP (single)", ...BAND, min: 10_000, max: 200_000, get: (r) => r.incomeTax.srcop.single },
  { key: "srcop_single_spccc", label: "SRCOP (single with SPCCC)", ...BAND, min: 10_000, max: 200_000, get: (r) => r.incomeTax.srcop.singleWithSpccc },
  { key: "srcop_married_one", label: "SRCOP (married, one income)", ...BAND, min: 10_000, max: 200_000, get: (r) => r.incomeTax.srcop.marriedOneIncome },
  { key: "srcop_married_increase", label: "SRCOP (married second-income increase)", kind: "euro", min: 0, max: 200_000, get: (r) => r.incomeTax.srcop.marriedBandIncrease },
  { key: "credit_personal_single", label: "Personal credit (single)", ...CREDIT, get: (r) => r.incomeTax.credits.personalSingle },
  { key: "credit_personal_married", label: "Personal credit (married)", ...CREDIT, get: (r) => r.incomeTax.credits.personalMarried },
  { key: "credit_personal_widowed", label: "Personal credit (widowed, no children)", ...CREDIT, get: (r) => r.incomeTax.credits.personalWidowed },
  { key: "credit_employee_paye", label: "Employee PAYE credit", ...CREDIT, get: (r) => r.incomeTax.credits.employeePaye },
  { key: "credit_earned_income", label: "Earned income credit", ...CREDIT, get: (r) => r.incomeTax.credits.earnedIncome },
  { key: "credit_employment_cap", label: "PAYE + earned income combined cap", ...CREDIT, get: (r) => r.incomeTax.credits.employmentCombinedCap },
  { key: "credit_spccc", label: "Single person child carer credit", ...CREDIT, get: (r) => r.incomeTax.credits.spccc },
  { key: "credit_age_single", label: "Age credit (single)", ...CREDIT, get: (r) => r.incomeTax.credits.ageSingle },
  { key: "credit_age_married", label: "Age credit (married)", ...CREDIT, get: (r) => r.incomeTax.credits.ageMarried },
  { key: "credit_home_carer", label: "Home carer credit", ...CREDIT, get: (r) => r.incomeTax.credits.homeCarer },
  { key: "home_carer_threshold", label: "Home carer income threshold", kind: "euro", min: 0, max: 100_000, get: (r) => r.incomeTax.homeCarerIncomeThreshold },
  { key: "rent_credit_rate", label: "Rent credit rate", ...RELIEF, get: (r) => r.incomeTax.rentCredit.rate },
  { key: "rent_credit_max_single", label: "Rent credit maximum (one person)", ...CREDIT, get: (r) => r.incomeTax.rentCredit.maxSingle },
  { key: "rent_credit_max_joint", label: "Rent credit maximum (couple)", ...CREDIT, get: (r) => r.incomeTax.rentCredit.maxJoint },
  { key: "usc_exemption_threshold", label: "USC exemption threshold", ...BAND, max: 100_000, get: (r) => r.usc.exemptionThreshold },
  { key: "usc_band1_up_to", label: "USC band 1 upper bound", ...BAND, get: (r) => r.usc.bands[0].upTo },
  { key: "usc_band2_up_to", label: "USC band 2 upper bound", ...BAND, get: (r) => r.usc.bands[1].upTo },
  { key: "usc_band3_up_to", label: "USC band 3 upper bound", ...BAND, get: (r) => r.usc.bands[2].upTo },
  { key: "usc_band1_rate", label: "USC band 1 rate", ...USC_RATE, get: (r) => r.usc.bands[0].rate },
  { key: "usc_band2_rate", label: "USC band 2 rate", ...USC_RATE, get: (r) => r.usc.bands[1].rate },
  { key: "usc_band3_rate", label: "USC band 3 rate", ...USC_RATE, get: (r) => r.usc.bands[2].rate },
  { key: "usc_band4_rate", label: "USC balance rate", ...USC_RATE, get: (r) => r.usc.bands[3].rate },
  { key: "usc_reduced_age", label: "Reduced USC age threshold", ...AGE, get: (r) => r.usc.reduced.ageThreshold },
  { key: "usc_reduced_ceiling", label: "Reduced USC income ceiling", ...BAND, get: (r) => r.usc.reduced.incomeCeiling },
  { key: "usc_reduced_band1_up_to", label: "Reduced USC band 1 upper bound", ...BAND, get: (r) => r.usc.reduced.bands[0].upTo },
  { key: "usc_reduced_band1_rate", label: "Reduced USC band 1 rate", ...USC_RATE, get: (r) => r.usc.reduced.bands[0].rate },
  { key: "usc_reduced_band2_rate", label: "Reduced USC balance rate", ...USC_RATE, get: (r) => r.usc.reduced.bands[1].rate },
  { key: "usc_surcharge_threshold", label: "USC surcharge threshold", ...BAND, get: (r) => r.usc.selfEmployedSurchargeThreshold },
  { key: "usc_surcharge_rate", label: "USC surcharge rate", ...USC_RATE, get: (r) => r.usc.selfEmployedSurchargeRate },
  { key: "prsi_rate", label: "PRSI rate", kind: "pct", min: 0, max: 0.15, get: (r) => r.prsi.rate },
  { key: "prsi_min", label: "Class S minimum contribution", ...CREDIT, get: (r) => r.prsi.selfEmployedMinimum },
  { key: "prsi_weekly_exemption", label: "PRSI weekly exemption", kind: "euro", min: 0, max: 10_000, get: (r) => r.prsi.weeklyExemptionThreshold },
  { key: "prsi_weekly_credit_max", label: "PRSI weekly credit max", kind: "euro", min: 0, max: 10_000, get: (r) => r.prsi.weeklyCreditMax },
  { key: "prsi_taper_upper", label: "PRSI credit taper upper", kind: "euro", min: 0, max: 10_000, get: (r) => r.prsi.weeklyCreditTaperUpper },
  { key: "prsi_taper_divisor", label: "PRSI credit taper divisor", kind: "plain", min: 0.000001, max: 100, get: (r) => r.prsi.weeklyCreditTaperDivisor },
  { key: "pension_earnings_cap", label: "Pension relief earnings cap", ...BAND, min: 10_000, get: (r) => r.pension.earningsCap },
  ...PENSION_KEYS.map(([key, band], i) => ({
    key,
    label: `Pension relief % (${band})`,
    ...RELIEF,
    get: (r: YearRates) => r.pension.ageBands[i]?.rate ?? 0,
  })),
];

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function show(kind: Kind, v: number): string {
  if (kind === "pct") return `${+(v * 100).toFixed(4)}%`;
  if (kind === "euro") return euro.format(v);
  return String(v);
}

/** The first clearly-wrong value, as a message for the admin, or null. */
export function checkYearRates(r: YearRates): string | null {
  for (const f of TAX_RATE_FIELDS) {
    const v = f.get(r);
    if (!Number.isFinite(v) || v < f.min || v > f.max) {
      return `${f.label} looks wrong (${show(f.kind, v)}). Expected ${show(f.kind, f.min)} to ${show(f.kind, f.max)}.`;
    }
  }
  if (r.incomeTax.standardRate >= r.incomeTax.higherRate) {
    return "The standard income tax rate must be lower than the higher rate.";
  }
  return null;
}

/** Only the fields that differ between `before` and `after`, for the preview
    and the audit log. */
export function changedFields(before: YearRates, after: YearRates): DiffEntry[] {
  const flat = (r: YearRates) => Object.fromEntries(TAX_RATE_FIELDS.map((f) => [f.key, f.get(r)]));
  const fields: DiffField[] = TAX_RATE_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    format: (v) => show(f.kind, Number(v)),
  }));
  return diffRecords(flat(before), flat(after), fields).filter((d) => d.kind !== "unchanged");
}
