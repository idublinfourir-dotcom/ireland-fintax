/* Daily euro prices for the crypto calculator, from two public APIs that need
   no key (both checked 18 November 2026):
   - Coinbase Exchange candles: GET api.exchange.coinbase.com/products/BTC-EUR/
     candles?granularity=86400&start&end, up to 300 days a call, newest first,
     rows [time, low, high, open, close, volume]; 404 for an unknown pair;
     public limit 10 requests a second per IP.
       docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-candles
   - Bitstamp OHLC: GET www.bitstamp.net/api/v2/ohlc/btceur/?step=86400&start&
     limit (up to 1000; it ignores `start` when `end` is given, so `end` is
     never sent); 404 for an unknown pair.
   Coinbase first; Bitstamp when Coinbase lacks the coin or fails. The price is
   the day's close (UTC). A past day's close never changes, so the route caches
   every day it fetches; today's is not cached.

   Pure apart from the injected `fetch` and cache, so the tests use fakes and
   never reach the network. */

export interface Coin {
  ticker: string;
  name: string;
}

/**
 * Every coin Coinbase or Bitstamp currently prices in euro, for the dropdown:
 * Coinbase's EUR products (named from its currency list) and Bitstamp's
 * "xxxeur" pairs. Bitcoin and Ethereum first, then by name. Never throws: an
 * exchange that fails just adds nothing, and any ticker can still be typed.
 * The page caches the answer for a day (`init`). The timeout is short because
 * the page waits for this before it renders.
 */
export async function listCoins(f: Fetch, init?: RequestInit): Promise<Coin[]> {
  const get = async (url: string) => {
    try {
      const r = await f(url, { ...init, signal: AbortSignal.timeout(2500) });
      return r.ok ? ((await r.json()) as unknown) : null;
    } catch (err) {
      console.error(`[crypto-prices] coin list ${url}:`, err);
      return null;
    }
  };
  const [products, currencies, pairs] = await Promise.all([
    get("https://api.exchange.coinbase.com/products"),
    get("https://api.exchange.coinbase.com/currencies"),
    get("https://www.bitstamp.net/api/v2/trading-pairs-info/"),
  ]);
  const names = new Map<string, string>();
  for (const c of Array.isArray(currencies) ? currencies : []) if (c?.id && c?.name) names.set(String(c.id), String(c.name));
  const coins = new Map<string, string>();
  for (const p of Array.isArray(products) ? products : []) {
    const t = String(p?.base_currency ?? "");
    if (p?.quote_currency === "EUR" && p?.status === "online" && SYMBOL.test(t)) coins.set(t, names.get(t) ?? t);
  }
  for (const p of Array.isArray(pairs) ? pairs : []) {
    const sym = String(p?.url_symbol ?? "");
    const t = sym.slice(0, -3).toUpperCase();
    if (sym.endsWith("eur") && p?.trading === "Enabled" && SYMBOL.test(t) && !coins.has(t)) {
      coins.set(t, String(p?.description ?? "").split(" / ")[0] || t);
    }
  }
  const first = ["BTC", "ETH"];
  return [...coins]
    .map(([ticker, name]) => ({ ticker, name: name.slice(0, 40) }))
    .sort((x, y) => {
      const [i, j] = [first.indexOf(x.ticker), first.indexOf(y.ticker)];
      if (i !== j) return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
      return x.name.localeCompare(y.name, "en");
    });
}

/* Tests only: CRYPTO_PRICE_TEST_ORIGIN sends every exchange call to a fake
   (e2e/crypto-prices.spec.ts), as <origin>/<exchange host>/<path>. Set by the
   operator, never by a request. */
const testOrigin = process.env.CRYPTO_PRICE_TEST_ORIGIN;
export const exchangeFetch: Fetch = testOrigin
  ? (url, init) => {
      const u = new URL(url);
      return fetch(`${testOrigin}/${u.hostname}${u.pathname}${u.search}`, init);
    }
  : (url, init) => fetch(url, init);

export type PriceSource = "Coinbase" | "Bitstamp";
export interface DayPrice {
  eur: number;
  source: PriceSource;
}
/** Keyed "BTC:2026-03-19". */
export type PriceMap = Record<string, DayPrice>;

export interface PriceCache {
  get(keys: string[]): Promise<PriceMap>;
  put(prices: PriceMap): Promise<void>;
}

/** What may be sent on to the exchanges: a plain ticker, nothing else. */
export const SYMBOL = /^[A-Z0-9]{2,10}$/;
export const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_ITEMS = 200;
/** Before this no exchange has a euro price; also keeps half-typed years
    ("0202-03-01") away from the exchanges. */
export const MIN_DATE = "2010-01-01";
/* One request's share of the exchanges: at most this many (coin, date range)
   look-ups, each one or two calls, and no new one started after the time
   budget. What is left over is reported through `onIncomplete`, and the page
   asks again; what was fetched is cached by then, so each round gets further. */
const MAX_TASKS = 16;
const TIME_BUDGET_MS = 7000;
const DAY = 86_400_000;
const SPAN = 290; // days per call, under Coinbase's 300

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const ms = (date: string) => Date.parse(`${date}T00:00:00Z`);

/** Closes by date for one coin over [from, from + days), or null if the
    exchange does not list the coin against the euro. Throws on any other
    failure, so the caller can try the other source. */
async function coinbase(sym: string, from: number, days: number, f: Fetch): Promise<Map<string, number> | null> {
  const url =
    `https://api.exchange.coinbase.com/products/${sym}-EUR/candles?granularity=86400` +
    `&start=${iso(from)}T00:00:00Z&end=${iso(from + (days - 1) * DAY)}T00:00:00Z`;
  const r = await f(url, { signal: AbortSignal.timeout(4000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Coinbase ${r.status}`);
  const rows = (await r.json()) as unknown;
  if (!Array.isArray(rows)) throw new Error("Coinbase: not a list");
  const out = new Map<string, number>();
  for (const row of rows) {
    if (Array.isArray(row) && Number.isFinite(row[0]) && Number.isFinite(row[4]) && row[4] > 0) out.set(iso(row[0] * 1000), row[4]);
  }
  return out;
}

async function bitstamp(sym: string, from: number, days: number, f: Fetch): Promise<Map<string, number> | null> {
  const url = `https://www.bitstamp.net/api/v2/ohlc/${sym.toLowerCase()}eur/?step=86400&start=${from / 1000}&limit=${days}`;
  const r = await f(url, { signal: AbortSignal.timeout(4000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Bitstamp ${r.status}`);
  const body = (await r.json()) as { data?: { ohlc?: { timestamp?: string; close?: string }[] } };
  const out = new Map<string, number>();
  for (const c of body.data?.ohlc ?? []) {
    const t = Number(c.timestamp);
    const close = Number(c.close);
    if (Number.isFinite(t) && close > 0) out.set(iso(t * 1000), close);
  }
  return out;
}

/** Group a coin's dates into spans one call can cover. */
function spans(dates: string[]): { from: number; days: number; dates: string[] }[] {
  const sorted = [...new Set(dates)].sort();
  const out: { from: number; days: number; dates: string[] }[] = [];
  for (const date of sorted) {
    const t = ms(date);
    const last = out[out.length - 1];
    if (last && t < last.from + SPAN * DAY) {
      last.days = Math.max(last.days, (t - last.from) / DAY + 1);
      last.dates.push(date);
    } else out.push({ from: t, days: 1, dates: [date] });
  }
  return out;
}

/**
 * Prices for each requested coin and date. Bad or future items, and coins
 * neither exchange prices in euro, are simply missing from the answer.
 * `onIncomplete` is called when some look-ups were left for the next request
 * (see MAX_TASKS): their keys are missing too, but not because no price exists.
 */
export async function lookUpPrices(
  items: { coin: string; date: string }[],
  {
    fetch: f,
    cache,
    today = iso(Date.now()),
    now = Date.now,
    onIncomplete,
  }: { fetch: Fetch; cache: PriceCache; today?: string; now?: () => number; onIncomplete?: () => void },
): Promise<PriceMap> {
  const wanted = items
    .slice(0, MAX_ITEMS)
    .map((i) => ({ coin: String(i.coin).trim().toUpperCase(), date: String(i.date) }))
    .filter((i) => SYMBOL.test(i.coin) && DATE.test(i.date) && iso(ms(i.date) || 0) === i.date && i.date >= MIN_DATE && i.date <= today);
  const keys = [...new Set(wanted.map((i) => `${i.coin}:${i.date}`))];
  if (!keys.length) return {};

  const found = await cache.get(keys);
  const byCoin = new Map<string, string[]>();
  for (const k of keys) {
    if (found[k]) continue;
    const [coin, date] = k.split(":");
    byCoin.set(coin, [...(byCoin.get(coin) ?? []), date]);
  }

  const fresh: PriceMap = {};
  /* One task per coin and date range. Coinbase first; Bitstamp only for the
     asked dates Coinbase did not cover (a coin it lists from a later date, or
     not at all, or a call that failed). */
  const tasks = [...byCoin].flatMap(([coin, dates]) => spans(dates).map((span) => ({ coin, ...span })));
  const run = async ({ coin, from, days, dates }: (typeof tasks)[number]) => {
    for (const [source, get] of [["Coinbase", coinbase], ["Bitstamp", bitstamp]] as const) {
      if (dates.every((d) => fresh[`${coin}:${d}`])) return;
      let closes: Map<string, number> | null = null;
      try {
        closes = await get(coin, from, days, f);
      } catch (err) {
        console.error(`[crypto-prices] ${source} ${coin}:`, err);
      }
      for (const [date, eur] of closes ?? []) fresh[`${coin}:${date}`] ??= { eur, source };
    }
  };
  // Four at a time: quicker than one by one, and inside Coinbase's 10 a second.
  const started = now();
  let done = 0;
  for (; done < Math.min(tasks.length, MAX_TASKS) && now() - started < TIME_BUDGET_MS; done += 4) {
    await Promise.all(tasks.slice(done, Math.min(done + 4, MAX_TASKS)).map(run));
  }
  if (done < tasks.length) onIncomplete?.();

  // Cache past days only: today's candle is still moving.
  const keep = Object.fromEntries(Object.entries(fresh).filter(([k]) => k.split(":")[1] < today));
  if (Object.keys(keep).length) await cache.put(keep).catch((err) => console.error("[crypto-prices] cache write failed:", err));

  const all = { ...fresh, ...found };
  return Object.fromEntries(keys.filter((k) => all[k]).map((k) => [k, all[k]]));
}
