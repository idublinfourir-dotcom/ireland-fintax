"use server";

/* Admin save action for the income tax calculator. TWO-PHASE, like the other
   rate editors: the first submit validates, runs the guardrails and previews
   the fields that changed, writing nothing; the Confirm submit carries the
   normalized `payload` and only THAT is written, then audited. Re-checks
   requireAdmin on both phases. */

import { revalidatePath } from "next/cache";
import { taxRatesCollection } from "../../lib/collections";
import { requireAdmin } from "../../lib/auth/guards";
import { formNumber } from "../../lib/form-number";
import { TAX_YEARS, getTaxRates, parseYearRates, yearRatesToJson } from "../../lib/tax-data";
import { RATES_BY_YEAR, type YearRates } from "../../lib/ireland-income-tax";
import { changedFields, checkYearRates } from "../../lib/tax-rates-guardrails";
import { recordAudit } from "../../lib/rate-audit";
import type { DiffEntry } from "../../lib/rate-diff";

export type TwoPhaseState =
  | { status: "idle" }
  | { status: "preview"; payload: string; diff: DiffEntry[] }
  | { status: "saved"; message: string }
  | { status: "error"; message: string };

function revalidate() {
  revalidatePath("/tools/ireland-income-tax");
  revalidatePath("/admin/tax-rates");
  revalidatePath("/admin");
}

const num = formNumber;

/* Percentages are ENTERED as percent (e.g. 20, 0.5) and STORED as fractions
   (0.2, 0.005), matching the mortgage admin convention. */

class Invalid extends Error {}

function euro(formData: FormData, name: string, label: string): number {
  const n = num(formData.get(name));
  if (!Number.isFinite(n) || n < 0) throw new Invalid(`${label} must be a number ≥ 0.`);
  return n;
}

function pctFrac(formData: FormData, name: string, label: string): number {
  const n = num(formData.get(name));
  if (!Number.isFinite(n) || n < 0 || n > 100)
    throw new Invalid(`${label} must be between 0 and 100 (%).`);
  return n / 100;
}

/* Pension relief age bands: the age boundaries are fixed (Revenue has kept
   them stable for decades); only the relief % per band is editable. */
const PENSION_BAND_FIELDS = [
  { name: "pension_rate_u30", label: "Pension relief % (under 30)", maxAge: 29 },
  { name: "pension_rate_30_39", label: "Pension relief % (30 to 39)", maxAge: 39 },
  { name: "pension_rate_40_49", label: "Pension relief % (40 to 49)", maxAge: 49 },
  { name: "pension_rate_50_54", label: "Pension relief % (50 to 54)", maxAge: 54 },
  { name: "pension_rate_55_59", label: "Pension relief % (55 to 59)", maxAge: 59 },
  { name: "pension_rate_60_plus", label: "Pension relief % (60+)", maxAge: Infinity },
] as const;

function parseYearForm(formData: FormData): { year: number; rates: YearRates } {
  const year = num(formData.get("year"));
  if (!TAX_YEARS.includes(year))
    throw new Invalid("Unknown tax year.");

  const uscBand1UpTo = euro(formData, "usc_band1_up_to", "USC band 1 upper bound");
  const uscBand2UpTo = euro(formData, "usc_band2_up_to", "USC band 2 upper bound");
  const uscBand3UpTo = euro(formData, "usc_band3_up_to", "USC band 3 upper bound");
  if (!(uscBand1UpTo < uscBand2UpTo && uscBand2UpTo < uscBand3UpTo))
    throw new Invalid("USC band upper bounds must be increasing.");

  const rates: YearRates = {
    year,
    // Statutory, not on the form: always the code's value for the year.
    autoEnrolment: RATES_BY_YEAR[year].autoEnrolment,
    incomeTax: {
      standardRate: pctFrac(formData, "it_standard_rate", "Standard income tax rate"),
      higherRate: pctFrac(formData, "it_higher_rate", "Higher income tax rate"),
      srcop: {
        single: euro(formData, "srcop_single", "SRCOP (single)"),
        singleWithSpccc: euro(formData, "srcop_single_spccc", "SRCOP (single with SPCCC)"),
        marriedOneIncome: euro(formData, "srcop_married_one", "SRCOP (married, one income)"),
        marriedBandIncrease: euro(
          formData,
          "srcop_married_increase",
          "SRCOP (married second-income increase)",
        ),
      },
      credits: {
        personalSingle: euro(formData, "credit_personal_single", "Personal credit (single)"),
        personalMarried: euro(formData, "credit_personal_married", "Personal credit (married)"),
        personalWidowed: euro(formData, "credit_personal_widowed", "Personal credit (widowed, no children)"),
        employeePaye: euro(formData, "credit_employee_paye", "Employee PAYE credit"),
        earnedIncome: euro(formData, "credit_earned_income", "Earned income credit"),
        employmentCombinedCap: euro(
          formData,
          "credit_employment_cap",
          "PAYE + earned income combined cap",
        ),
        spccc: euro(formData, "credit_spccc", "Single person child carer credit"),
        ageSingle: euro(formData, "credit_age_single", "Age credit (single)"),
        ageMarried: euro(formData, "credit_age_married", "Age credit (married)"),
        homeCarer: euro(formData, "credit_home_carer", "Home carer credit"),
      },
      ageCreditThreshold: euro(formData, "age_credit_threshold", "Age credit threshold"),
      homeCarerIncomeThreshold: euro(
        formData,
        "home_carer_threshold",
        "Home carer income threshold",
      ),
      rentCredit: {
        rate: pctFrac(formData, "rent_credit_rate", "Rent credit rate"),
        maxSingle: euro(formData, "rent_credit_max_single", "Rent credit maximum (one person)"),
        maxJoint: euro(formData, "rent_credit_max_joint", "Rent credit maximum (couple)"),
      },
    },
    usc: {
      exemptionThreshold: euro(formData, "usc_exemption_threshold", "USC exemption threshold"),
      bands: [
        { upTo: uscBand1UpTo, rate: pctFrac(formData, "usc_band1_rate", "USC band 1 rate") },
        { upTo: uscBand2UpTo, rate: pctFrac(formData, "usc_band2_rate", "USC band 2 rate") },
        { upTo: uscBand3UpTo, rate: pctFrac(formData, "usc_band3_rate", "USC band 3 rate") },
        { upTo: Infinity, rate: pctFrac(formData, "usc_band4_rate", "USC balance rate") },
      ],
      reduced: {
        ageThreshold: euro(formData, "usc_reduced_age", "Reduced USC age threshold"),
        incomeCeiling: euro(formData, "usc_reduced_ceiling", "Reduced USC income ceiling"),
        bands: [
          {
            upTo: euro(formData, "usc_reduced_band1_up_to", "Reduced USC band 1 upper bound"),
            rate: pctFrac(formData, "usc_reduced_band1_rate", "Reduced USC band 1 rate"),
          },
          {
            upTo: Infinity,
            rate: pctFrac(formData, "usc_reduced_band2_rate", "Reduced USC balance rate"),
          },
        ],
      },
      selfEmployedSurchargeThreshold: euro(
        formData,
        "usc_surcharge_threshold",
        "USC surcharge threshold",
      ),
      selfEmployedSurchargeRate: pctFrac(formData, "usc_surcharge_rate", "USC surcharge rate"),
    },
    prsi: {
      rate: pctFrac(formData, "prsi_rate", "PRSI rate"),
      selfEmployedMinimum: euro(formData, "prsi_min", "Class S minimum contribution"),
      weeklyExemptionThreshold: euro(formData, "prsi_weekly_exemption", "PRSI weekly exemption"),
      weeklyCreditMax: euro(formData, "prsi_weekly_credit_max", "PRSI weekly credit max"),
      weeklyCreditTaperUpper: euro(formData, "prsi_taper_upper", "PRSI credit taper upper"),
      weeklyCreditTaperDivisor: euro(formData, "prsi_taper_divisor", "PRSI credit taper divisor"),
    },
    pension: {
      earningsCap: euro(formData, "pension_earnings_cap", "Pension relief earnings cap"),
      ageBands: PENSION_BAND_FIELDS.map((f) => ({
        maxAge: f.maxAge,
        rate: pctFrac(formData, f.name, f.label),
      })),
    },
  };

  if (rates.prsi.weeklyCreditTaperDivisor <= 0)
    throw new Invalid("PRSI credit taper divisor must be greater than 0.");

  return { year, rates };
}

/** Preview, then save, one tax year's full rate config (upsert into
    tax_rates). */
export async function saveTaxYear(
  _prev: TwoPhaseState,
  formData: FormData,
): Promise<TwoPhaseState> {
  const user = await requireAdmin();

  if (formData.get("cancel")) return { status: "idle" };

  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string" || !payloadRaw) {
    // Phase 1, preview: parse the form, run the guardrails, show the change.
    let parsed: { year: number; rates: YearRates };
    try {
      parsed = parseYearForm(formData);
    } catch (err) {
      if (err instanceof Invalid) return { status: "error", message: err.message };
      throw err;
    }
    const problem = checkYearRates(parsed.rates);
    if (problem) return { status: "error", message: problem };

    const current = (await getTaxRates())[parsed.year];
    const diff = changedFields(current, parsed.rates);
    if (diff.length === 0) return { status: "error", message: "Nothing has changed." };
    return {
      status: "preview",
      payload: JSON.stringify({ year: parsed.year, rates: yearRatesToJson(parsed.rates) }),
      diff,
    };
  }

  // Phase 2, confirm: write the previewed payload only. Re-parse strictly and
  // re-run the guardrails: never trust the round-tripped JSON.
  let parsed: { year: number; rates: YearRates };
  try {
    const raw = JSON.parse(payloadRaw) as { year?: unknown; rates?: unknown };
    const year = Number(raw.year);
    const rates = TAX_YEARS.includes(year) ? parseYearRates(year, raw.rates) : null;
    if (!rates || checkYearRates(rates)) {
      return { status: "error", message: "The change didn't validate. Try again." };
    }
    parsed = { year, rates };
  } catch {
    return { status: "error", message: "Could not read the change. Try again." };
  }
  const before = (await getTaxRates())[parsed.year];

  try {
    const taxRates = await taxRatesCollection();
    await taxRates.updateOne(
      { _id: parsed.year },
      {
        $set: {
          // Stored as a subdocument, not a JSON string. yearRatesToJson still
          // runs: it maps the open-ended Infinity bounds to null, which is the
          // shape parseYearRates reads back.
          rates: yearRatesToJson(parsed.rates),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error("[tax-rates] save failed:", err);
    return { status: "error", message: "Could not save: check the values." };
  }

  await recordAudit({
    area: "tax-rates",
    action: "update",
    summary: `Updated ${parsed.year} income tax rates`,
    details: {
      year: parsed.year,
      changes: changedFields(before, parsed.rates).map((d) => ({
        field: d.label,
        from: d.from,
        to: d.to,
      })),
    },
    changedBy: user.email ?? "admin",
  });
  revalidate();
  return { status: "saved", message: `${parsed.year} rates saved.` };
}
