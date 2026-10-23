/* ──────────────────────────────────────────────────────────────────────────
   The Irish Investment Account (Budget 2027; Finance (No. 2) Bill 2026, s.26,
   new Part 27A, ss.747H to 747AA of the TCA 1997). Pure: no React, no I/O.

   projectAccount() follows the account day by day, the way 747Q measures it:
   the value at close of business on every calendar day the account is open,
   averaged over those days, so an account opened mid-year is averaged over
   the part year only and the €50,000 is not reduced. Payments stop at the
   €12,000 limit for each calendar year. Nothing else is taxed: no exit tax,
   CGT or deemed disposal inside the account, and nothing on withdrawal.

   Every rule here is "in the Finance Bill, not yet law". Update
   ACCOUNT_DATA_AS_OF whenever a figure or rule below changes.
   ────────────────────────────────────────────────────────────────────────── */

export const ACCOUNT_DATA_AS_OF = "23 October 2026";

export const INVESTMENT_ACCOUNT = {
  /** Government plan date (Revenue, CCPC); the legal start is a ministerial order. */
  opensOn: "2027-07-01",
  minAge: 18,
  /** Per calendar year, withdrawals ignored (747H, 747L(2)(d)). */
  annualLimit: 12_000,
  /** B in 747Q(4). */
  taxFreeThreshold: 50_000,
  /** Z in 747Q(7). */
  rate: 0.01,
} as const;

/** Investment account tax for a year: (average value − €50,000) × 1%, nil below, to the cent. */
export function accountTax(averageValue: number): number {
  const tax = Math.max(0, averageValue - INVESTMENT_ACCOUNT.taxFreeThreshold) * INVESTMENT_ACCOUNT.rate;
  return Math.round(tax * 100) / 100;
}

export interface ProjectInputs {
  /** The account opens on the 1st of this month (0 = January). */
  openYear: number;
  openMonth: number;
  /** Paid in on the day the account opens. */
  firstPayment: number;
  /** Paid in on the 1st of every month, from the opening month on. */
  monthly: number;
  /** Paid in every 1 January after the opening year. */
  yearly: number;
  /** The projection runs to 31 December of this year. */
  untilYear: number;
  /** Growth a year of the investments, after their own charges, as a fraction (0.05 = 5%). */
  ret: number;
  /** The provider's fee a year, as a fraction of the value. */
  fee: number;
}

export interface YearRow {
  year: number;
  /** Days the account was open: the D in 747Q(5). */
  days: number;
  paidIn: number;
  /** Growth after fees, before this tax. */
  growth: number;
  /** A in 747Q(4). */
  average: number;
  tax: number;
  /** At 31 December, after the tax is taken. */
  endValue: number;
}

export interface ProjectResult {
  rows: YearRow[];
  paid: number;
  growth: number;
  tax: number;
  final: number;
  /** Planned payments the €12,000 limit keeps out, over the whole period. */
  refused: number;
  firstTaxYear: number | null;
}

const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

export function projectAccount(i: ProjectInputs): ProjectResult {
  const { annualLimit } = INVESTMENT_ACCOUNT;
  const rows: YearRow[] = [];
  let value = 0, paid = 0, totalTax = 0, refused = 0;
  let firstTaxYear: number | null = null;

  for (let year = i.openYear; year <= i.untilYear; year++) {
    const daysInYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
    /* One day's growth, so that a full year of days compounds to exactly
       (1 + ret) × (1 − fee). */
    const daily = Math.pow((1 + i.ret) * (1 - i.fee), 1 / daysInYear);
    const start = value;
    let room = annualLimit, paidIn = 0, sum = 0, days = 0;
    const payIn = (amount: number) => {
      const inAcc = Math.min(Math.max(0, amount), room);
      room -= inAcc; paidIn += inAcc; value += inAcc;
      refused += Math.max(0, amount) - inAcc;
    };

    for (let month = year === i.openYear ? i.openMonth : 0; month < 12; month++) {
      for (let day = 1; day <= daysIn(year, month); day++) {
        if (day === 1) {
          if (year === i.openYear && month === i.openMonth) payIn(i.firstPayment);
          else if (month === 0) payIn(i.yearly);
          payIn(i.monthly);
        }
        value *= daily;
        sum += value; // close of business
        days++;
      }
    }

    const average = sum / days;
    const tax = accountTax(average);
    const growth = value - start - paidIn;
    // The provider takes the tax from the account; we take it on 31 December.
    value -= tax;
    paid += paidIn; totalTax += tax;
    if (tax > 0 && firstTaxYear === null) firstTaxYear = year;
    rows.push({ year, days, paidIn, growth, average, tax, endValue: value });
  }

  return { rows, paid, growth: value + totalTax - paid, tax: totalTax, final: value, refused, firstTaxYear };
}
