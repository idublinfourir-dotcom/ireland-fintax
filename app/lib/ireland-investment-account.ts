/* ──────────────────────────────────────────────────────────────────────────
   The Irish Investment Account (Budget 2027; Finance (No. 2) Bill 2026, s.26,
   new Part 27A, ss.747H to 747AA of the TCA 1997). Pure: no React, no I/O.

   compareWrappers() puts the same money on the same dates into the account,
   an ETF outside it and shares bought directly, and taxes each under its own
   rules. It is a port of the design preview's simulate() (version 15, 22 Oct
   2026), whose results were checked across 12,096 input combinations; the
   goldens in the test file come from it. docs/investment-account-plan.md,
   section 3, has the rules and their sources.

   Every rule here is "in the Finance Bill, not yet law". Update
   ACCOUNT_DATA_AS_OF whenever a figure or rule below changes.
   ────────────────────────────────────────────────────────────────────────── */

import { TAX } from "./ireland-investment.ts";
import { RATES_2027 } from "./ireland-income-tax.ts";

export const ACCOUNT_DATA_AS_OF = "22 October 2026";

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

/** Investment account tax for a year: (average value − €50,000) × 1%, nil below. */
export function accountTax(averageValue: number): number {
  return Math.max(0, averageValue - INVESTMENT_ACCOUNT.taxFreeThreshold) * INVESTMENT_ACCOUNT.rate;
}

/* Top rate on dividends for 2027: income tax + USC + PRSI (Revenue, Dividend
   income). PRSI is included as in Revenue's own example. */
const { incomeTax, usc, prsi } = RATES_2027;
const uscAt = (income: number) => usc.bands.find((b) => income <= b.upTo)!.rate;
export const TOP_RATES = [
  { id: "standard", label: "20%", rate: incomeTax.standardRate + uscAt(46_500) + prsi.rate },
  { id: "higher", label: "40%, under €70,044", rate: incomeTax.higherRate + uscAt(70_044) + prsi.rate },
  { id: "top", label: "40%, over €70,044", rate: incomeTax.higherRate + uscAt(70_045) + prsi.rate },
] as const;

export interface CompareInputs {
  lump: number;
  monthly: number;
  years: number;
  /** Total return a year, as a fraction (0.05 = 5%). */
  ret: number;
  /** The part of `ret` paid out as dividends on direct shares. */
  dividendYield: number;
  /** Tax on dividends, as a fraction. */
  topRate: number;
  /** Markets fall 20% in year 3. */
  badYear?: boolean;
}

export interface CompareResult {
  account: {
    final: number;
    /** The 1% investment account tax. */
    tax: number;
    /** Tax on money over the limit while it waits outside, and on moving it in. */
    outsideTax: number;
    overflow: number;
    moved: number;
    /** Still outside at the end, before tax. */
    left: number;
    heldAs: "etf" | "shares";
    firstTaxYear: number | null;
  };
  etf: { final: number; tax: number };
  shares: { final: number; tax: number };
  paid: number;
  rows: { year: number; average: number; accountTax: number; deemedTax: number }[];
}

type Kind = "etf" | "shares";
interface Batch { t: number; v: number; c: number; cr: number; d: number }

export function compareWrappers(i: CompareInputs): CompareResult {
  const { annualLimit: LIMIT } = INVESTMENT_ACCOUNT;
  const { exit: EXIT, cgt: CGT, cgtExemption: EXEMPT } = TAX;
  const Y = i.years, r = i.ret, dy = i.dividendYield, marg = i.topRate;
  const rateFor = (y: number) => (i.badYear && y === 3 ? -0.2 : r);
  const growth = (y: number, minus = 0) => Math.pow(1 + rateFor(y) - minus, 1 / 12) - 1;
  const cash = (y: number, m: number) => i.monthly + (y === 1 && m === 0 ? i.lump : 0);

  /* Money held outside the account, as an ETF or as shares bought directly.
     Each month's purchase is its own batch, sold oldest first. */
  const holding = (kind: Kind) => {
    const batches: Batch[] = [];
    const ddY: number[] = [];
    let tax = 0, gainY = 0, taxY = 0, losses = 0;
    const cgtFor = (gain: number) => Math.max(0, gain - losses - EXEMPT) * CGT;
    /* ETF tax if a batch were sold now: 35% of value less cost, less the
       credit for deemed disposal tax already paid; an overpaid credit comes
       back. Per batch, because a loss on a unit is nil (s.739DA(5)). */
    const settle = (b: Batch) => {
      const x = EXIT * (b.v - b.c) - b.cr;
      return x < 0 ? -Math.min(-x, b.cr) : x;
    };
    return {
      ddY,
      tax: () => tax,
      add(t: number, amount: number) {
        if (amount > 0) batches.push({ t, v: amount, c: amount, cr: 0, d: 0 });
      },
      /* ETF deemed disposal on each batch's 8th, 16th, 24th anniversary, paid
         by selling units; the units sold use up their share of the credit
         (Revenue TDM 27-01a-02, example note E). */
      startMonth(t: number, y: number) {
        if (kind !== "etf") return;
        for (const b of batches) {
          const age = t - b.t;
          if (age > 0 && age % 96 === 0 && b.v > 0) {
            const due = Math.max(0, EXIT * (b.v - b.c) - b.cr);
            if (due > 0) {
              const f = due / b.v, taxOnSold = Math.max(0, EXIT * (due - b.c * f));
              b.v -= due; b.c *= 1 - f; b.cr += due - taxOnSold;
              tax += due; ddY[y] = (ddY[y] ?? 0) + due;
            }
          }
        }
      },
      grow(y: number) {
        const g = growth(y, kind === "shares" ? dy : 0);
        for (const b of batches) {
          b.v *= 1 + g;
          if (kind === "shares") b.d += (b.v * dy) / 12;
        }
      },
      /* Shares: each year's dividends are taxed at the top rate and the rest
         is reinvested as a new batch. Losses carry forward against later gains. */
      endYear(t: number) {
        if (kind === "shares") {
          let divs = 0;
          for (const b of batches) { divs += b.d; b.d = 0; }
          tax += divs * marg;
          this.add(t, divs * (1 - marg));
        }
        if (gainY < 0) losses -= gainY; else losses = Math.max(0, losses - gainY);
        gainY = 0; taxY = 0;
      },
      /** Sell units to raise `want` after tax, oldest first. Returns what it raised. */
      sell(want: number) {
        let got = 0;
        for (const b of batches) {
          if (want - got <= 0.005) break;
          if (b.v <= 0) continue;
          let f: number;
          if (kind === "etf") {
            const tx = settle(b);
            f = Math.min(1, (want - got) / (b.v - tx));
            tax += f * tx; got += f * (b.v - tx);
          } else {
            /* CGT on this batch's slice, with the year's €1,270 exemption and
               any losses: find the slice that nets what is still wanted. */
            const gainOf = (x: number) => (x * (b.v - b.c)) / b.v;
            const netOf = (x: number) => x - (cgtFor(gainY + gainOf(x)) - taxY);
            let x = b.v;
            if (netOf(b.v) > want - got) {
              let lo = 0, hi = b.v;
              for (let k = 0; k < 60; k++) { x = (lo + hi) / 2; if (netOf(x) < want - got) lo = x; else hi = x; }
              x = hi;
            }
            const paid = cgtFor(gainY + gainOf(x)) - taxY;
            gainY += gainOf(x); taxY += paid; tax += paid; got += x - paid;
            f = x / b.v;
          }
          b.v *= 1 - f; b.c *= 1 - f; b.cr *= 1 - f;
        }
        return got;
      },
      value: () => batches.reduce((v, b) => v + b.v, 0),
      /** Sell everything at the end; returns the value after tax. */
      close() {
        let val = 0, out = 0, gain = 0;
        for (const b of batches) {
          if (kind === "etf") { const x = settle(b); val += b.v - x; out += x; }
          else { val += b.v; gain += b.v - b.c; }
        }
        if (kind === "shares") { out = cgtFor(gainY + gain) - taxY; val -= out; }
        tax += out;
        return val;
      },
    };
  };

  /* One run. With the account: up to €12,000 a year goes in; the rest waits
     outside in `kind` and moves in each January as the limit allows, taxed on
     the way out. Without it: everything goes to `kind`. */
  const run = (kind: Kind, useAccount: boolean) => {
    const out = holding(kind);
    let acc = 0, accTax = 0, over = 0, moved = 0;
    let firstTax: number | null = null;
    const years: { average: number; tax: number }[] = [];
    for (let y = 1; y <= Y; y++) {
      const toAcc: number[] = [], toOut: number[] = [];
      let allow = useAccount ? LIMIT : 0;
      for (let m = 0; m < 12; m++) {
        const a = cash(y, m), inAcc = Math.min(a, allow);
        allow -= inAcc; toAcc[m] = inAcc; toOut[m] = a - inAcc;
        if (useAccount) over += a - inAcc;
      }
      const t0 = (y - 1) * 12, g = growth(y);
      let sum = 0;
      out.startMonth(t0, y);
      if (useAccount && y > 1 && allow > 0) { const got = out.sell(allow); moved += got; toAcc[0] += got; }
      for (let m = 0; m < 12; m++) {
        if (m > 0) out.startMonth(t0 + m, y);
        acc += toAcc[m]; out.add(t0 + m, toOut[m]);
        acc *= 1 + g; out.grow(y);
        sum += acc;
      }
      // ponytail: 12 month-end values stand in for the law's daily average (747Q(5)).
      const tax = accountTax(sum / 12);
      acc -= tax; accTax += tax;
      if (tax > 0 && firstTax === null) firstTax = y;
      years.push({ average: sum / 12, tax });
      out.endYear(t0 + 12);
    }
    const left = out.value(), outVal = out.close();
    return { final: acc + outVal, accTax, outTax: out.tax(), firstTax, over, moved, left, ddY: out.ddY, years };
  };

  const etf = run("etf", false), sh = run("shares", false);
  const viaEtf = run("etf", true), viaSh = run("shares", true);
  const a = viaSh.final > viaEtf.final + 0.005 ? viaSh : viaEtf;

  return {
    account: {
      final: a.final, tax: a.accTax, outsideTax: a.outTax, overflow: a.over, moved: a.moved, left: a.left,
      heldAs: a === viaSh ? "shares" : "etf", firstTaxYear: a.firstTax,
    },
    etf: { final: etf.final, tax: etf.outTax },
    shares: { final: sh.final, tax: sh.outTax },
    paid: i.lump + i.monthly * 12 * Y,
    rows: a.years.map((row, k) => ({ year: k + 1, average: row.average, accountTax: row.tax, deemedTax: etf.ddY[k + 1] ?? 0 })),
  };
}

export type IneligibleReason = "minor" | "nonResident" | "noPpsn" | "hasAccount" | "closedThisYear";
export interface EligibilityAnswer {
  adult: boolean;
  resident: boolean;
  ppsn: boolean;
  hasAccount: boolean;
  closedThisYear: boolean;
}

/** Reasons someone could not open an account (747H, 747L(2)(a), 747L(4)); empty means they could. */
export function eligibility(a: EligibilityAnswer): IneligibleReason[] {
  const out: IneligibleReason[] = [];
  if (!a.adult) out.push("minor");
  if (!a.resident) out.push("nonResident");
  if (!a.ppsn) out.push("noPpsn");
  if (a.hasAccount) out.push("hasAccount");
  if (a.closedThisYear) out.push("closedThisYear");
  return out;
}
