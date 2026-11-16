/* ──────────────────────────────────────────────────────────────────────────
   Irish rental income tax, and Rent-a-Room Relief against it.

   PURE FUNCTIONS ONLY. The tax on rent is the extra income tax, USC and PRSI
   the rent causes: the income tax engine run on your other income, then again
   with the rental profit added (as unearned income: no Earned Income Credit,
   no pension relief). Revenue works it out the same way in its examples
   (revenue.ie, Irish rental income, "How do you calculate your taxable
   income?", Example 2).

   Sources, checked 16 November 2026:
   - Rent-a-Room Relief, s.216A TCA 1997: €14,000 of gross income a year,
     including meals and other services; a cent over and all of it is taxed;
     no income tax, USC or PRSI under the limit; a jointly assessed couple
     shares one limit. revenue.ie/.../land-and-property/rent-a-room-relief
   - 2027: €16,000, Finance (No. 2) Bill 2026 s.16(1)(d) and (2), as amended
     in Dáil committee on 12 November 2026. Not yet law.
   - Allowable expenses, mortgage interest (RTB registration) and wear and
     tear at 12.5% a year for 8 years: revenue.ie/en/property/rental-income/
     irish-rental-income/what-expenses-are-allowed.aspx
   - Rental losses carry forward against Irish rental profit only:
     .../rental-profit-and-losses.aspx
   - Residential Premises Rental Income Relief (RPRIR): the lowest of €1,000
     (2026 and 2027) and 20% of rental profit, income tax only, not
     refundable. revenue.ie/.../land-and-property/rprir/how-much-can-you-claim.aspx
   ────────────────────────────────────────────────────────────────────────── */

import {
  computeIrishTax,
  RATES_BY_YEAR,
  type IncomeTaxInput,
  type IncomeTaxResult,
  type YearRates,
} from "./ireland-income-tax.ts";

export const RENTAL_LAST_REVIEWED = "November 2026";
export const RENTAL_SOURCE_URL =
  "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/index.aspx";

/** Rent-a-Room limit on gross room income, by tax year. The years listed are
    the years the calculator offers. */
export const RENT_A_ROOM_LIMIT: Record<number, number> = { 2026: 14_000, 2027: 16_000 };
/** Years whose limit is announced but not yet law. */
export const RENT_A_ROOM_PENDING = [2027];
/** RPRIR maximum by tax year: the relief ends after 2027. */
export const RPRIR_MAX: Record<number, number> = { 2026: 1_000, 2027: 1_000 };
export const RPRIR_RATE = 0.2;
export const WEAR_AND_TEAR_RATE = 0.125;

export type Letting = "room" | "property";

export interface RentalInput {
  /** A room in your own home (Rent-a-Room can apply) or a separate property. */
  letting: Letting;
  /** Gross rent for the year, with anything charged for meals, laundry or bills. */
  grossRent: number;
  /** Allowable costs for the let, mortgage interest included. */
  expenses: number;
  /** Cost of furniture and appliances still inside their 8 years. */
  furnishings: number;
  /** A separate property meeting the RPRIR conditions on 31 December. */
  rprir: boolean;
  /** Your other income and circumstances (unearnedIncome is ignored). */
  person: IncomeTaxInput;
}

export interface TaxOnRent {
  incomeTax: number;
  usc: number;
  prsi: number;
  /** Already taken off incomeTax. */
  rprir: number;
  total: number;
}

export interface RentalResult {
  year: number;
  limit: number;
  grossRent: number;
  expenses: number;
  wearAndTear: number;
  /** Rent less expenses and wear and tear, never below 0. */
  profit: number;
  /** The shortfall when costs beat the rent: carried forward, never set
      against salary. */
  loss: number;
  /** The rent taxed as rental income. */
  standard: TaxOnRent;
  /** Room lets only: whether the gross rent is within the limit. */
  room: { qualifies: boolean; headroom: number; overBy: number } | null;
}

const clean = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
const usc = (r: IncomeTaxResult) => r.usc.total + r.spouseUsc.total;
const prsi = (r: IncomeTaxResult) => r.prsi.total + r.spousePrsi.total;

export function computeRentalTax(
  input: RentalInput,
  year: number,
  rates: YearRates | undefined = RATES_BY_YEAR[year],
): RentalResult {
  const limit = RENT_A_ROOM_LIMIT[year];
  if (limit === undefined || !rates) throw new Error(`No rental tax figures for ${year}`);

  const grossRent = clean(input.grossRent);
  const expenses = clean(input.expenses);
  const wearAndTear = clean(input.furnishings) * WEAR_AND_TEAR_RATE;
  const net = grossRent - expenses - wearAndTear;
  const profit = Math.max(0, net);

  const person = { ...input.person, unearnedIncome: 0 };
  const base = computeIrishTax(person, year, rates);
  const withRent = computeIrishTax({ ...person, unearnedIncome: profit }, year, rates);

  const rprir =
    input.letting === "property" && input.rprir
      ? Math.min(RPRIR_MAX[year] ?? 0, profit * RPRIR_RATE, withRent.incomeTax.netTax)
      : 0;
  const incomeTax = Math.max(0, withRent.incomeTax.netTax - rprir - base.incomeTax.netTax);
  const uscOnRent = usc(withRent) - usc(base);
  const prsiOnRent = prsi(withRent) - prsi(base);

  return {
    year,
    limit,
    grossRent,
    expenses,
    wearAndTear,
    profit,
    loss: Math.max(0, -net),
    standard: {
      incomeTax,
      usc: uscOnRent,
      prsi: prsiOnRent,
      rprir,
      total: incomeTax + uscOnRent + prsiOnRent,
    },
    room:
      input.letting === "room"
        ? {
            qualifies: grossRent <= limit,
            headroom: Math.max(0, limit - grossRent),
            overBy: Math.max(0, grossRent - limit),
          }
        : null,
  };
}
