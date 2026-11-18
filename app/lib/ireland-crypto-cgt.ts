/* ──────────────────────────────────────────────────────────────────────────
   Ireland crypto Capital Gains Tax: a list of buys and disposals in, the
   gain on each disposal and the CGT for each year out.

   PURE FUNCTIONS ONLY (no React, no I/O). Rates and the €1,270 exemption come
   from the same CgtConfig as the CGT calculator (admin-editable, code
   fallback in ireland-cgt.ts), so a rate changes in one place.

   Sources (read 18 November 2026):
   - Revenue TDM Part 02-01-03 "Taxation of Crypto-Asset Transactions"
     (last reviewed January 2026): selling, swapping or spending crypto is
     most likely a CGT disposal; the gain is worked out disposal by disposal;
     losses go against gains of the same year, then forward; the first €1,270
     of net gains is exempt; tax on Jan to Nov gains is due 15 December, on
     December gains 31 January; values in euro at the time.
       revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-02/02-01-03.pdf
   - Matching. The crypto manual sets no matching rule. TDM Part 19-04-03
     (s.581, last reviewed August 2023) applies the four-week rule to "shares
     or securities or any other assets dealt in without identifying the
     particular assets", which covers interchangeable coins: a disposal is
     matched first with what was bought in the four weeks before it (latest
     first, the "last in, first out" wording of Revenue's shares page), and
     any excess by the normal first in, first out rule. Sold at a loss and
     bought back within four weeks: that loss (the bought-back fraction of
     it) only goes against a gain on the coins bought back.
       revenue.ie/en/tax-professionals/tdm-wm/income-tax-capital-gains-tax-corporation-tax/part-19/19-04-03.pdf
       revenue.ie/en/gains-gifts-and-inheritance/transfering-an-asset/selling-or-disposing-of-shares.aspx
   - Two rates in one year (2026: 33% before 7 October, 31% after): losses
     (s.546(6)) and the exemption (s.601(3)) go against the higher-rate gains
     first. Revenue, TCA Notes for Guidance, Part 19, Finance Act 2025 edition.

   ── NOT MODELLED (deliberate) ──
   - Trading in crypto (income tax, not CGT), and staking, mining, airdrops,
     employment pay in crypto: income at the time received. A coin received
     that way can be entered as a buy at its euro value when received.
   - Lost keys and negligible value claims (s.538), gifts and inheritance
     (CAT; market value), spouses, non-residents and the remittance basis.
   - Companies (Corporation Tax on chargeable gains).
   ────────────────────────────────────────────────────────────────────────── */

import { round2, standardRateFor, type CgtConfig } from "./ireland-cgt.ts";

export const CRYPTO_LAST_REVIEWED = "November 2026";
export const CRYPTO_SOURCE_URL =
  "https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-02/02-01-03.pdf";

/** Disposals are taxed from 2013 (33% since 6 December 2012) to the last
    year the CGT calculator has rates for. Buys can be from any date. */
export const FIRST_TAX_YEAR = 2013;
export const LAST_TAX_YEAR = 2027;
/** Rows the calculator accepts: keeps a pasted list from freezing the tab. */
export const MAX_TRADES = 1000;

const WEEKS4 = 28;
const EPS = 1e-9;

export interface CryptoTrade {
  /** YYYY-MM-DD. */
  date: string;
  kind: "buy" | "sell";
  /** Coin name or ticker; matching is per coin, ignoring case. */
  coin: string;
  quantity: number;
  /** Buy: what it cost in euro. Sell: proceeds, or the euro value of what
      was received (a swap or a purchase). */
  amountEur: number;
  /** Exchange or network fees in euro, added to cost or taken off proceeds. */
  feesEur: number;
}

export type TradeIssue =
  | { row: number; code: "date" | "quantity" | "amount" | "coin" | "future" }
  | { row: number; code: "oversold"; short: number }
  | { row: -1; code: "tooMany" };

export interface Disposal {
  row: number;
  date: string;
  coin: string;
  quantity: number;
  proceeds: number;
  cost: number;
  /** Proceeds less fees less cost; negative is a loss. */
  gain: number;
  /** Part of the cost matched under the four-week rule. */
  fourWeekQty: number;
  /** Part of a loss that only goes against the bought-back coins. */
  restrictedLoss: number;
  /** Restricted loss from an earlier sale set against this gain. */
  restrictedUsed: number;
  ratePercent: number;
  /** Outside FIRST_TAX_YEAR..LAST_TAX_YEAR: matched, but not taxed here. */
  outOfRange: boolean;
}

export interface YearTax {
  year: number;
  gains: number;
  losses: number;
  lossesUsed: number;
  exemption: number;
  taxable: number;
  tax: number;
  /** Tax on January to November disposals, due 15 December. */
  dueDecember: number;
  /** The rest, due 31 January of the next year; 0 if December losses cut
      the year's tax below the December payment. */
  dueJanuary: number;
  lossCarried: number;
}

/** What is left of one coin after every disposal: quantity and its cost. */
export interface Holding {
  coin: string;
  quantity: number;
  cost: number;
}

export interface CryptoResult {
  issues: TradeIssue[];
  /** Coins still held, by coin as entered (lower case), largest cost first. */
  holdings: Holding[];
  disposals: Disposal[];
  years: YearTax[];
  /** Restricted losses not yet set against a gain on the bought-back coins. */
  restrictedLeft: number;
}

interface Lot {
  row: number;
  day: number;
  qty: number;
  cost: number;
  left: number;
  /** Bought-back quantity already used to restrict an earlier loss. */
  reacquired: number;
  restricted: number;
}

/** Days since 1970, or null for anything that is not a real YYYY-MM-DD. */
export function dayNumber(date: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return t / 86_400_000;
}

const ok = (n: number) => Number.isFinite(n) && n >= 0 && n < 1e12;

function yearTax(items: { gain: number; rate: number }[], losses: number, exemption: number) {
  // Highest rate first: s.546(6) for losses, s.601(3) for the exemption.
  const byRate = new Map<number, number>();
  for (const { gain, rate } of items) byRate.set(rate, (byRate.get(rate) ?? 0) + gain);
  let lossLeft = losses;
  let exLeft = exemption;
  let taxable = 0;
  let tax = 0;
  for (const rate of [...byRate.keys()].sort((a, b) => b - a)) {
    let g = byRate.get(rate)!;
    const l = Math.min(lossLeft, g);
    g -= l;
    lossLeft -= l;
    const e = Math.min(exLeft, g);
    g -= e;
    exLeft -= e;
    taxable += g;
    tax += g * (rate / 100);
  }
  return {
    lossesUsed: round2(losses - lossLeft),
    exemption: round2(exemption - exLeft),
    taxable: round2(taxable),
    tax: round2(tax),
    lossLeft: round2(lossLeft),
  };
}

/**
 * Match every disposal and work out the CGT per year. Rows are 0-based
 * positions in `trades`. Any issue means the figures are not reliable, and
 * the result carries no disposals or years.
 */
export function computeCryptoCgt(
  trades: CryptoTrade[],
  config: CgtConfig,
  broughtForwardLosses = 0,
): CryptoResult {
  const empty = (issues: TradeIssue[]): CryptoResult => ({ issues, holdings: [], disposals: [], years: [], restrictedLeft: 0 });
  if (trades.length > MAX_TRADES) return empty([{ row: -1, code: "tooMany" }]);

  const issues: TradeIssue[] = [];
  const rows = trades.map((t, row) => {
    const day = dayNumber(t.date);
    const coin = String(t.coin ?? "").trim().toLowerCase();
    if (day === null) issues.push({ row, code: "date" });
    else if (Number(t.date.slice(0, 4)) > LAST_TAX_YEAR) issues.push({ row, code: "future" });
    if (!coin || coin.length > 40) issues.push({ row, code: "coin" });
    if (!ok(t.quantity) || t.quantity === 0) issues.push({ row, code: "quantity" });
    if (!ok(t.amountEur) || !ok(t.feesEur)) issues.push({ row, code: "amount" });
    return { ...t, row, day: day ?? 0, coin };
  });
  if (issues.length) return empty(issues);

  // Date order; on one day, buys before disposals, then as entered.
  rows.sort((a, b) => a.day - b.day || (a.kind === b.kind ? a.row - b.row : a.kind === "buy" ? -1 : 1));

  /* Pass 1: match each disposal against its coin's lots. */
  const lots = new Map<string, Lot[]>();
  const pieces = new Map<number, { lot: Lot; qty: number; cost: number }[]>();
  const disposals: (Disposal & { day: number })[] = [];
  for (const t of rows) {
    const coinLots = lots.get(t.coin) ?? [];
    lots.set(t.coin, coinLots);
    if (t.kind === "buy") {
      const cost = t.amountEur + t.feesEur;
      coinLots.push({ row: t.row, day: t.day, qty: t.quantity, cost, left: t.quantity, reacquired: 0, restricted: 0 });
      continue;
    }
    let need = t.quantity;
    let fourWeekQty = 0;
    const used: { lot: Lot; qty: number; cost: number }[] = [];
    const take = (lot: Lot) => {
      const q = Math.min(need, lot.left);
      if (q <= 0) return 0;
      lot.left -= q;
      need -= q;
      used.push({ lot, qty: q, cost: (lot.cost * q) / lot.qty });
      return q;
    };
    // Four-week rule: bought in the 28 days up to the sale, latest first.
    for (let i = coinLots.length - 1; i >= 0 && need > EPS; i--) {
      if (t.day - coinLots[i].day > WEEKS4) break;
      fourWeekQty += take(coinLots[i]);
    }
    // The rest: first in, first out.
    for (const lot of coinLots) if (need > EPS) take(lot);
    if (need > EPS * Math.max(1, t.quantity)) {
      issues.push({ row: t.row, code: "oversold", short: need });
      continue;
    }
    const cost = round2(used.reduce((s, p) => s + p.cost, 0));
    const year = Number(t.date.slice(0, 4));
    pieces.set(t.row, used);
    disposals.push({
      row: t.row,
      day: t.day,
      date: t.date,
      coin: t.coin,
      quantity: t.quantity,
      proceeds: round2(t.amountEur),
      cost,
      gain: round2(t.amountEur - t.feesEur - cost),
      fourWeekQty,
      restrictedLoss: 0,
      restrictedUsed: 0,
      ratePercent: standardRateFor(config, { year, month: Number(t.date.slice(5, 7)), day: Number(t.date.slice(8)) }),
      outOfRange: year < FIRST_TAX_YEAR,
    });
  }
  if (issues.length) return empty(issues);

  /* Pass 2: a loss followed by a buy-back of the same coin within four weeks
     is restricted, by the fraction bought back, to gains on those coins. */
  for (const d of disposals) {
    if (d.gain >= 0) continue;
    let want = d.quantity;
    const backs: { lot: Lot; qty: number }[] = [];
    for (const lot of lots.get(d.coin)!) {
      if (want <= EPS) break;
      if (lot.day <= d.day || lot.day - d.day > WEEKS4) continue;
      const q = Math.min(want, lot.qty - lot.reacquired);
      if (q <= 0) continue;
      lot.reacquired += q;
      want -= q;
      backs.push({ lot, qty: q });
    }
    const back = d.quantity - want;
    if (back <= EPS) continue;
    d.restrictedLoss = round2((-d.gain * back) / d.quantity);
    for (const b of backs) b.lot.restricted += (d.restrictedLoss * b.qty) / back;
  }

  /* Pass 3: set restricted losses against later gains on those coins. */
  for (const d of disposals) {
    if (d.gain <= 0) continue;
    const net = d.gain + d.cost;
    let room = d.gain;
    for (const p of pieces.get(d.row)!) {
      // The gain on the bought-back coins themselves, not the whole sale.
      const use = Math.min(p.lot.restricted, (net * p.qty) / d.quantity - p.cost, room);
      if (use <= 0) continue;
      p.lot.restricted -= use;
      room -= use;
      d.restrictedUsed = round2(d.restrictedUsed + use);
    }
  }

  /* Per year: net gains at each rate, losses then exemption highest rate first. */
  const years: YearTax[] = [];
  let carried = Math.max(0, Number.isFinite(broughtForwardLosses) ? broughtForwardLosses : 0);
  const taxed = disposals.filter((d) => !d.outOfRange);
  const yearList = [...new Set(taxed.map((d) => Number(d.date.slice(0, 4))))].sort((a, b) => a - b);
  for (const year of yearList) {
    const inYear = taxed.filter((d) => d.date.startsWith(`${year}-`));
    const run = (ds: typeof inYear, bf: number) => {
      const gainItems = ds
        .filter((d) => d.gain > 0)
        .map((d) => ({ gain: d.gain - d.restrictedUsed, rate: d.ratePercent }));
      const losses = ds.reduce((s, d) => s + (d.gain < 0 ? -d.gain - d.restrictedLoss : 0), 0);
      return { gainItems, losses, r: yearTax(gainItems, round2(losses + bf), config.annualExemptionEur) };
    };
    const full = run(inYear, carried);
    const early = run(inYear.filter((d) => Number(d.date.slice(5, 7)) < 12), carried);
    years.push({
      year,
      gains: round2(full.gainItems.reduce((s, g) => s + g.gain, 0)),
      losses: round2(full.losses),
      lossesUsed: full.r.lossesUsed,
      exemption: full.r.exemption,
      taxable: full.r.taxable,
      tax: full.r.tax,
      dueDecember: early.r.tax,
      dueJanuary: round2(Math.max(0, full.r.tax - early.r.tax)),
      lossCarried: full.r.lossLeft,
    });
    carried = full.r.lossLeft;
  }

  let restrictedLeft = 0;
  const holdings: Holding[] = [];
  for (const [coin, coinLots] of lots) {
    let quantity = 0;
    let cost = 0;
    for (const l of coinLots) {
      restrictedLeft += l.restricted;
      quantity += l.left;
      cost += (l.cost * l.left) / l.qty;
    }
    if (quantity > EPS) holdings.push({ coin, quantity, cost: round2(cost) });
  }
  holdings.sort((a, b) => b.cost - a.cost);

  return {
    issues: [],
    holdings,
    disposals: disposals.sort((a, b) => a.date.localeCompare(b.date) || a.row - b.row),
    years,
    restrictedLeft: round2(restrictedLeft),
  };
}
