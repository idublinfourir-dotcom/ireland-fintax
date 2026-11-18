/* ──────────────────────────────────────────────────────────────────────────
   Ireland Capital Allowances calculator: wear & tear / writing-down allowances
   on capital expenditure (plant & machinery, cars, industrial buildings, and
   100% accelerated allowances for energy-efficient equipment).

   PURE FUNCTIONS ONLY (no React, no I/O) so every figure is unit-testable.
   The EDITABLE rates/limits (per-class rate + years, the €24,000 car cap, the
   trading CT rate) live in CA_CONFIG_DEFAULT below: the single code source of
   truth (loader fallback AND the default arg of computeCapitalAllowance). The
   car CO2 rules (CAR_RELIEF) are STATUTORY and stay in code: not
   admin-editable.

   HOW IT WORKS
   - Capital allowances are tax depreciation: the cost of a qualifying asset is
     written off against taxable profits over a fixed life at a fixed rate.
       • Plant & machinery:  12.5% straight-line over 8 years.
       • Motor vehicles (cars): 12.5% over 8 years on a set €24,000 (full
         relief, whatever the car cost), half the cost up to €12,000, or nil,
         by CO2 emissions and when the car was bought.
       • Industrial buildings: 4% straight-line over 25 years.
       • Energy-efficient equipment (ACA): 100% in year one.
   - The cash value is the allowance × the tax rate (12.5% trading here).

   Sources (verified July 2026; rates, lives and car bands re-checked
   16 November 2026):
   - Rates + 8-year/25-year lives, 100% ACA (extended to 31 Dec 2030 in
     Budget 2026; excludes fossil-fuel-run equipment):
       revenue.ie/en/companies-and-charities/corporation-tax-for-companies/corporation-tax/capital-allowances-and-deductions
       taxsummaries.pwc.com/ireland/corporate/deductions
   - Cars, s.380L(3) TCA 1997 (read 18 November 2026): the cost is "taken to
     be" €24,000 for a full-relief car, even one that cost less (the Finance
     Act 2008 s.31 wording, kept by FA 2019 s.19 and FA 2024 s.33); half
     relief is half the lower of the cost and €24,000; otherwise nil.
     Categories (s.380K, FA 2020 s.14): A up to 120 g/km, B 121 to 140, C 141
     to 155, D to F over 155. Spending before 1 Jan 2027: A and B full, C half.
     From 1 Jan 2027 (Finance Act 2024 s.33, enacted): A full, B half, C to F
     nil. Revenue, Notes for Guidance TCA Part 11C (Finance Act 2025 edition),
     which also says a low-emission car gets €24,000 "even if the car costs
     less than that":
       revenue.ie/en/tax-professionals/documents/notes-for-guidance/tca/part11c.pdf
       irishstatutebook.ie/eli/2024/act/43/enacted/en/print.html (s.33)

   Figures are ESTIMATES for guidance only: not tax advice. Balancing
   allowances/charges on disposal, private-use restrictions, leasing rules and
   scheme-specific building reliefs are NOT modelled. Confirm with a qualified
   adviser or revenue.ie.
   ────────────────────────────────────────────────────────────────────────── */

/** When the rates/limits below were last checked against Revenue. */
export const CA_LAST_REVIEWED = "November 2026";
export const CA_SOURCE_URL =
  "https://www.revenue.ie/en/companies-and-charities/corporation-tax-for-companies/corporation-tax/capital-allowances-and-deductions.aspx";

/** Specified amount: the cost ceiling for cars. */
export const MOTOR_CAP_EUR = 24_000;
/** Trading CT rate used to show the cash value of the allowances. */
export const TRADING_CT_PERCENT = 12.5;

/* ---------- asset classes (single source of truth) ---------- */

export type AssetKey =
  | "plant-machinery"
  | "motor-vehicle"
  | "industrial-building"
  | "energy-efficient";

export interface AssetClass {
  key: AssetKey;
  label: string;
  /** Annual wear-and-tear rate, e.g. 12.5. For ACA this is 100. */
  ratePercent: number;
  /** Years the allowance is spread over (1 for a 100% first-year allowance). */
  years: number;
  /** True when the whole cost is written off in year one (ACA). */
  firstYearFull: boolean;
  /** True for cars: the €24,000 specified amount + CO2 rules apply. */
  co2Restricted?: boolean;
  note: string;
}

export const ASSET_CLASSES: AssetClass[] = [
  {
    key: "plant-machinery",
    label: "Plant & machinery",
    ratePercent: 12.5,
    years: 8,
    firstYearFull: false,
    note: "Machinery, equipment, fixtures and fittings, plus commercial vehicles (vans, trucks, tractors), written off at 12.5% a year over 8 years.",
  },
  {
    key: "motor-vehicle",
    label: "Motor vehicle (car)",
    ratePercent: 12.5,
    years: 8,
    firstYearFull: false,
    co2Restricted: true,
    note: "12.5% over 8 years on a set €24,000 whatever the car cost, halved or nil for higher CO2 emissions. Commercial vehicles (vans, trucks) aren't restricted; use Plant & machinery for those.",
  },
  {
    key: "industrial-building",
    label: "Industrial building",
    ratePercent: 4,
    years: 25,
    firstYearFull: false,
    note: "Factories, mills and similar buildings in use for a trade: 4% a year over 25 years. Many scheme-specific building reliefs have ended; check the building qualifies.",
  },
  {
    key: "energy-efficient",
    label: "Energy-efficient equipment (ACA)",
    ratePercent: 100,
    years: 1,
    firstYearFull: true,
    note: "Accelerated Capital Allowance, 100% written off in year one for approved energy-efficient equipment on the SEAI Triple-E register. Extended to 31 December 2030. Excludes equipment run on fossil fuels.",
  },
];

export function getAssetClass(key: AssetKey): AssetClass {
  const cls = ASSET_CLASSES.find((a) => a.key === key);
  if (!cls) throw new Error(`Unknown asset class: ${key}`);
  return cls;
}

/* ---------- car CO2 rules (statutory) ---------- */

/** The s.380K emissions categories, grouped as the two sets of rules need. */
export type Co2Category = "a" | "b" | "c" | "d-f";
export const CO2_CATEGORIES: Co2Category[] = ["a", "b", "c", "d-f"];

/** Which rules apply: spending before 1 January 2027, or from that date. */
export type CarRules = 2026 | 2027;
/** The newer rules first: the calculator leads with them. */
export const CAR_RULES: CarRules[] = [2027, 2026];

/** Share of the €24,000 specified amount a car gets: 1 full (whatever the
    cost), 0.5 half (of the lower of cost and €24,000), 0 nil. */
export const CAR_RELIEF: Record<CarRules, Record<Co2Category, 1 | 0.5 | 0>> = {
  2026: { a: 1, b: 1, c: 0.5, "d-f": 0 },
  2027: { a: 1, b: 0.5, c: 0, "d-f": 0 },
};

/* ---------- editable config (single source of truth) ---------- */

/** The admin-editable slice: the four asset classes plus the two scalars. The
    car CO2 rules are NOT here (statutory, stay code). */
export interface CaConfig {
  classes: AssetClass[];
  /** Car cost ceiling (specified amount), €: MOTOR_CAP_EUR. */
  motorCapEur: number;
  /** Trading CT rate used for the cash-value line, %: TRADING_CT_PERCENT. */
  tradingCtPercent: number;
}

/** Editable fields: the loader fallback AND the default arg of the compute fn.
    References the existing consts above so there is exactly ONE copy of each
    number (no drift). */
export const CA_CONFIG_DEFAULT: CaConfig = {
  classes: ASSET_CLASSES,
  motorCapEur: MOTOR_CAP_EUR,
  tradingCtPercent: TRADING_CT_PERCENT,
};

/** The four asset keys that MUST be present in any stored config. */
export const REQUIRED_ASSET_KEYS: AssetKey[] = ASSET_CLASSES.map((c) => c.key);

const finiteNum = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

function parseAssetClass(raw: unknown): AssetClass | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const key = o.key;
  if (typeof key !== "string" || !REQUIRED_ASSET_KEYS.includes(key as AssetKey)) return null;
  const rate = finiteNum(o.ratePercent);
  const years = finiteNum(o.years);
  if (rate === null || rate < 0 || rate > 100) return null;
  if (years === null || years < 1 || !Number.isInteger(years)) return null;
  if (typeof o.label !== "string" || !o.label.trim()) return null;
  if (typeof o.note !== "string" || !o.note.trim()) return null;
  if (typeof o.firstYearFull !== "boolean") return null;
  const cls: AssetClass = {
    key: key as AssetKey,
    label: o.label,
    ratePercent: rate,
    years,
    firstYearFull: o.firstYearFull,
    note: o.note,
  };
  if (o.co2Restricted === true) cls.co2Restricted = true;
  return cls;
}

/** Validate a stored config blob; null on any bad/missing/out-of-range field.
    Enforces all four statutory asset keys present exactly once. Pure, so both
    ca-data.ts and the tests can use it without the DB layer. */
export function parseCaConfig(raw: unknown): CaConfig | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.classes)) return null;

  const motorCapEur = finiteNum(o.motorCapEur);
  const tradingCtPercent = finiteNum(o.tradingCtPercent);
  if (motorCapEur === null || motorCapEur < 0) return null;
  if (tradingCtPercent === null || tradingCtPercent < 0 || tradingCtPercent > 100) return null;

  const classes: AssetClass[] = [];
  for (const item of o.classes) {
    const cls = parseAssetClass(item);
    if (!cls) return null;
    classes.push(cls);
  }

  const keys = classes.map((c) => c.key);
  for (const k of REQUIRED_ASSET_KEYS) if (!keys.includes(k)) return null;
  if (keys.length !== REQUIRED_ASSET_KEYS.length) return null;

  return { classes, motorCapEur, tradingCtPercent };
}

/* ---------- maths ---------- */

/** Round to 2 decimal places, absorbing binary-float error. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface CapitalAllowanceInput {
  assetKey: AssetKey;
  cost: number;
  /** Cars only: the CO2 category. Defaults to A (full relief). */
  co2Category?: Co2Category;
  /** Cars only: which rules apply. Defaults to 2027 (spending from 1 Jan 2027). */
  carRules?: CarRules;
}

export interface CapitalAllowanceResult {
  cost: number;
  /** The cost allowances are worked out on: for cars, set by the CO2 rules
      (can be above the cost); for other assets, the cost. */
  allowableCost: number;
  ratePercent: number;
  years: number;
  firstYearFull: boolean;
  /** Standard annual allowance (for ACA, the full year-one amount). */
  annualAllowance: number;
  /** Allowance claimed in year one. */
  firstYearAllowance: number;
  /** Final year's allowance: carries the rounding remainder so the schedule
      sums back to allowableCost exactly. */
  finalYearAllowance: number;
  /** Total allowances over the life = allowableCost. */
  totalAllowances: number;
  /** Cash value of the total allowances at the 12.5% trading rate. */
  taxSaving: number;
  /** True when the car rules made the allowable cost differ from the cost. */
  restricted: boolean;
}

/**
 * Compute the capital allowance profile for one asset.
 *
 *   allowableCost = cost, except cars (s.380L(3)): €24,000 for full relief
 *                   whatever the cost, half the lower of cost and €24,000
 *                   for half relief, nil otherwise. No cost, no allowance.
 *   annual        = allowableCost × rate       (straight-line)
 *   finalYear     = allowableCost − annual × (years − 1)   ← reconciles rounding
 *   ACA (100%)    = whole allowableCost in year one.
 */
export function computeCapitalAllowance(
  input: CapitalAllowanceInput,
  config: CaConfig = CA_CONFIG_DEFAULT,
): CapitalAllowanceResult {
  // Resolve the class from the (possibly edited) config, not the module const,
  // so admin rate/years edits flow through. The car CO2 rules stay statutory.
  const cls = config.classes.find((a) => a.key === input.assetKey);
  if (!cls) throw new Error(`Unknown asset class: ${input.assetKey}`);
  const cost = round2(Math.max(0, input.cost) || 0); // NaN is no cost

  let allowableCost = cost;
  let restricted = false;
  if (cls.co2Restricted) {
    // An unknown category or year (never from the form) gets no relief, not NaN.
    const relief = CAR_RELIEF[input.carRules ?? 2027]?.[input.co2Category ?? "a"] ?? 0;
    allowableCost =
      cost === 0 ? 0 : relief === 1 ? config.motorCapEur : round2(Math.min(cost, config.motorCapEur) * relief);
    restricted = allowableCost !== cost;
  }

  const { ratePercent, years, firstYearFull } = cls;

  let annualAllowance: number;
  let firstYearAllowance: number;
  let finalYearAllowance: number;

  if (firstYearFull) {
    annualAllowance = allowableCost;
    firstYearAllowance = allowableCost;
    finalYearAllowance = allowableCost;
  } else {
    annualAllowance = round2(allowableCost * (ratePercent / 100));
    firstYearAllowance = annualAllowance;
    finalYearAllowance = round2(allowableCost - annualAllowance * (years - 1));
  }

  return {
    cost,
    allowableCost,
    ratePercent,
    years,
    firstYearFull,
    annualAllowance,
    firstYearAllowance,
    finalYearAllowance,
    totalAllowances: allowableCost,
    taxSaving: round2(allowableCost * (config.tradingCtPercent / 100)),
    restricted,
  };
}
