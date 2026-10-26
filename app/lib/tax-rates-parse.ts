/* The stored shape of one tax year's income tax rates, both ways: YearRates →
   JSON for the tax_rates collection, and a stored document → YearRates,
   validated. Pure, so it is unit-tested; tax-data.ts does the database read.

   The stored shape has no Infinity: the open-ended upper bound of the last USC
   band and the last pension age band are stored as null and converted back on
   read, so an exported config stays portable JSON. */

import {
  RATES_BY_YEAR,
  type PensionAgeBand,
  type UscBand,
  type YearRates,
} from "./ireland-income-tax.ts";

/* The years come from the code configs, so adding a year is one entry in
   RATES_BY_YEAR: the admin editor, the DB read and the fallback follow. */
export const FALLBACK: Record<number, YearRates> = RATES_BY_YEAR;
export const TAX_YEARS: number[] = Object.keys(FALLBACK)
  .map(Number)
  .sort((a, b) => b - a);

/* ---------- YearRates → JSON-safe object (Infinity → null) ---------- */

export function yearRatesToJson(r: YearRates): unknown {
  const band = (b: UscBand) => ({
    upTo: Number.isFinite(b.upTo) ? b.upTo : null,
    rate: b.rate,
  });
  return {
    ...r,
    usc: {
      ...r.usc,
      bands: r.usc.bands.map(band),
      reduced: { ...r.usc.reduced, bands: r.usc.reduced.bands.map(band) },
    },
    pension: {
      ...r.pension,
      ageBands: r.pension.ageBands.map((b) => ({
        maxAge: Number.isFinite(b.maxAge) ? b.maxAge : null,
        rate: b.rate,
      })),
    },
  };
}

/* ---------- stored JSON → YearRates (validated; null on any bad field) ---- */

class BadRates extends Error {}

function req(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) throw new BadRates();
  return v;
}

/** Finite number, or null meaning "no upper bound" (→ Infinity). */
function reqBound(v: unknown): number {
  if (v === null) return Infinity;
  return req(v);
}

function obj(v: unknown): Record<string, unknown> {
  if (typeof v !== "object" || v === null) throw new BadRates();
  return v as Record<string, unknown>;
}

/** A field added after launch: rows saved before it exists take the code
    fallback for that year instead of failing the whole year's validation. */
function reqOr(v: unknown, fallback: number | undefined): number {
  if (v === undefined && fallback !== undefined) return fallback;
  return req(v);
}

function uscBands(v: unknown): UscBand[] {
  if (!Array.isArray(v) || v.length === 0) throw new BadRates();
  return v.map((b) => {
    const o = obj(b);
    return { upTo: reqBound(o.upTo), rate: req(o.rate) };
  });
}

export function parseYearRates(year: number, raw: unknown): YearRates | null {
  try {
    const r = obj(raw);
    const it = obj(r.incomeTax);
    const srcop = obj(it.srcop);
    const credits = obj(it.credits);
    const usc = obj(r.usc);
    const reduced = obj(usc.reduced);
    const prsi = obj(r.prsi);
    const pension = obj(r.pension);
    const base = FALLBACK[year]?.incomeTax;
    const rent = it.rentCredit === undefined ? {} : obj(it.rentCredit);
    const ageBandsRaw = pension.ageBands;
    if (!Array.isArray(ageBandsRaw) || ageBandsRaw.length === 0) throw new BadRates();
    const ageBands: PensionAgeBand[] = ageBandsRaw.map((b) => {
      const o = obj(b);
      return { maxAge: reqBound(o.maxAge), rate: req(o.rate) };
    });

    return {
      year,
      incomeTax: {
        standardRate: req(it.standardRate),
        higherRate: req(it.higherRate),
        srcop: {
          single: req(srcop.single),
          singleWithSpccc: req(srcop.singleWithSpccc),
          marriedOneIncome: req(srcop.marriedOneIncome),
          marriedBandIncrease: reqOr(srcop.marriedBandIncrease, base?.srcop.marriedBandIncrease),
        },
        credits: {
          personalSingle: req(credits.personalSingle),
          personalMarried: req(credits.personalMarried),
          personalWidowed: reqOr(credits.personalWidowed, base?.credits.personalWidowed),
          employeePaye: req(credits.employeePaye),
          earnedIncome: req(credits.earnedIncome),
          employmentCombinedCap: req(credits.employmentCombinedCap),
          spccc: req(credits.spccc),
          ageSingle: req(credits.ageSingle),
          ageMarried: req(credits.ageMarried),
          homeCarer: reqOr(credits.homeCarer, base?.credits.homeCarer),
        },
        ageCreditThreshold: req(it.ageCreditThreshold),
        homeCarerIncomeThreshold: reqOr(it.homeCarerIncomeThreshold, base?.homeCarerIncomeThreshold),
        rentCredit: {
          rate: reqOr(rent.rate, base?.rentCredit.rate),
          maxSingle: reqOr(rent.maxSingle, base?.rentCredit.maxSingle),
          maxJoint: reqOr(rent.maxJoint, base?.rentCredit.maxJoint),
        },
      },
      usc: {
        exemptionThreshold: req(usc.exemptionThreshold),
        bands: uscBands(usc.bands),
        reduced: {
          ageThreshold: req(reduced.ageThreshold),
          incomeCeiling: req(reduced.incomeCeiling),
          bands: uscBands(reduced.bands),
        },
        selfEmployedSurchargeThreshold: req(usc.selfEmployedSurchargeThreshold),
        selfEmployedSurchargeRate: req(usc.selfEmployedSurchargeRate),
      },
      prsi: {
        rate: req(prsi.rate),
        selfEmployedMinimum: req(prsi.selfEmployedMinimum),
        weeklyExemptionThreshold: req(prsi.weeklyExemptionThreshold),
        weeklyCreditMax: req(prsi.weeklyCreditMax),
        weeklyCreditTaperUpper: req(prsi.weeklyCreditTaperUpper),
        weeklyCreditTaperDivisor: req(prsi.weeklyCreditTaperDivisor),
      },
      pension: {
        earningsCap: req(pension.earningsCap),
        ageBands,
      },
      // Statutory and not admin-editable: always the code's value.
      autoEnrolment: FALLBACK[year]?.autoEnrolment ?? FALLBACK[Math.max(...TAX_YEARS)].autoEnrolment,
    };
  } catch (err) {
    if (err instanceof BadRates) return null;
    throw err;
  }
}
