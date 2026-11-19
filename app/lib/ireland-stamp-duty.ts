/* ──────────────────────────────────────────────────────────────────────────
   Irish stamp duty on buying property (Stamp Duties Consolidation Act 1999,
   Schedule 1, "CONVEYANCE or TRANSFER on sale of any property other than
   stocks or marketable securities ...").

   PURE FUNCTIONS ONLY. Sources, checked 19 November 2026:
   - Residential: 1% to €1,000,000, 2% to €1,500,000, 6% above, each on its
     own slice, for instruments executed on or after 2 October 2024 (s.90
     Finance Act 2024). Non-residential: 7.5% of the whole consideration
     since 9 October 2019. Mixed property: the consideration is apportioned
     and each part charged at its own rate, never aggregated. Revenue Stamp
     Duty Manual, Schedule 1, 2.4.1 to 2.4.3 (last reviewed January 2026).
   - No duty on VAT: a VAT-inclusive price is divided by 1 + the VAT rate
     (revenue.ie/en/property/stamp-duty/consideration/vat-exclusive-consideration.aspx).
     New houses carry 13.5% VAT; qualifying new apartments 9% from 8 October
     2025 to 31 December 2030 (VAT TDM "Supply and Construction of Qualifying
     Apartments and Apartment Blocks").
   - Each part's duty is "rounded down to the nearest €": the residential
     total (Finance Act 2024 s.90, Schedule 1 para (1)(b)(i)) and the
     non-residential amount (para (4), wording from Finance Act 2012).
   - Finance (No. 2) Bill 2026 Part 4 (as initiated, 19 October 2026) leaves
     these rates alone: it changes farm consolidation relief and adds a sports
     body relief only.
   ────────────────────────────────────────────────────────────────────────── */

export const STAMP_DUTY_LAST_REVIEWED = "November 2026";
export const STAMP_DUTY_SOURCE_URL =
  "https://www.revenue.ie/en/tax-professionals/tdm/stamp-duty/stamp-duty-manual/schedules/schedule1-to-SDCA-1999.pdf";

/** Each rate applies to the slice of the residential price up to `upTo`. */
export const RESIDENTIAL_BANDS = [
  { upTo: 1_000_000, rate: 0.01 },
  { upTo: 1_500_000, rate: 0.02 },
  { upTo: Infinity, rate: 0.06 },
] as const;
export const NON_RESIDENTIAL_RATE = 0.075;
export const NEW_HOME_VAT = { house: 0.135, apartment: 0.09 } as const;

export type PropertyKind = "residential" | "nonResidential" | "mixed";
/** A home's price: second-hand (no VAT) or new with VAT in the price. */
export type HomeVat = "none" | keyof typeof NEW_HOME_VAT;

export interface StampDutyInput {
  kind: PropertyKind;
  /** The price paid (the market value for a gift), VAT included for a new home. */
  price: number;
  /** Mixed only: the part of the price for the home and up to an acre of grounds. */
  residentialPart: number;
  /** Residential only: whether the price includes VAT, and at what rate. */
  vat: HomeVat;
}

export interface StampDutySlice {
  amount: number;
  rate: number;
  duty: number;
}

export interface StampDutyResult {
  price: number;
  /** VAT taken out of a new home's price; 0 otherwise. */
  vat: number;
  vatRate: number;
  /** The residential and non-residential consideration, VAT excluded. */
  residential: number;
  nonResidential: number;
  /** One line per band the residential part reaches, then the 7.5% part,
      before rounding. */
  slices: StampDutySlice[];
  /** The cents dropped when each part is rounded down to the euro. */
  rounding: number;
  total: number;
  /** Duty as a share of the price paid. */
  effectiveRate: number;
}

const clean = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
const cents = (n: number) => Math.round(n * 100) / 100;
/* Down to the euro. The 1e-7 only absorbs float noise: real duty fractions
   are multiples of €0.00005 (a cent times 0.5%), far above it. */
const euros = (n: number) => Math.floor(n + 1e-7);
const sum = (slices: StampDutySlice[]) => slices.reduce((total, s) => total + s.duty, 0);

export function computeStampDuty(input: StampDutyInput): StampDutyResult {
  const price = clean(input.price);
  const vatRate = input.kind === "residential" && input.vat !== "none" ? NEW_HOME_VAT[input.vat] : 0;
  const exVat = cents(price / (1 + vatRate));
  const residential =
    input.kind === "residential" ? exVat : input.kind === "mixed" ? Math.min(clean(input.residentialPart), exVat) : 0;
  const nonResidential = cents(exVat - residential);

  const slices: StampDutySlice[] = [];
  let from = 0;
  for (const { upTo, rate } of RESIDENTIAL_BANDS) {
    const amount = Math.min(residential, upTo) - from;
    if (amount <= 0) break;
    slices.push({ amount, rate, duty: amount * rate });
    from = upTo;
  }
  const residentialDuty = euros(sum(slices));
  if (nonResidential > 0) {
    slices.push({ amount: nonResidential, rate: NON_RESIDENTIAL_RATE, duty: nonResidential * NON_RESIDENTIAL_RATE });
  }
  const total = residentialDuty + euros(nonResidential * NON_RESIDENTIAL_RATE);

  return {
    price,
    vat: cents(price - exVat),
    vatRate,
    residential,
    nonResidential,
    slices,
    rounding: sum(slices) - total,
    total,
    effectiveRate: price > 0 ? total / price : 0,
  };
}
