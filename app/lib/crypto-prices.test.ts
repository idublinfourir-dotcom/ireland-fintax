/* Price look-up for the crypto calculator, against fake exchanges and a fake
   cache: no test reaches the network or a database.
   Run: node --test --experimental-strip-types app/lib/crypto-prices.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { listCoins, lookUpPrices, MAX_ITEMS, type PriceCache, type PriceMap } from "./crypto-prices.ts";
import { cpuMs } from "./cpu-time.ts";

const DAY = 86_400;
const t = (date: string) => Date.parse(`${date}T00:00:00Z`) / 1000;

/** A fake of both APIs: every day in the asked range closes at `price(day)`. */
function fakeExchanges(opts: { coinbase?: number | "throw"; bitstamp?: number; price?: (sec: number) => number; coinbaseFrom?: string } = {}) {
  const calls: string[] = [];
  const price = opts.price ?? ((s: number) => 1000 + (s / DAY) % 100);
  const fetch = async (url: string) => {
    calls.push(url);
    const u = new URL(url);
    if (u.hostname === "api.exchange.coinbase.com") {
      if (opts.coinbase === "throw") throw new Error("network down");
      if (opts.coinbase) return new Response("{}", { status: opts.coinbase });
      const [a, b] = [t(u.searchParams.get("start")!.slice(0, 10)), t(u.searchParams.get("end")!.slice(0, 10))];
      const rows = [];
      const listed = opts.coinbaseFrom ? t(opts.coinbaseFrom) : 0;
      for (let s = b; s >= Math.max(a, listed); s -= DAY) rows.push([s, 1, 2, 3, price(s), 9]);
      return Response.json(rows);
    }
    if (opts.bitstamp) return new Response("{}", { status: opts.bitstamp });
    const start = Number(u.searchParams.get("start"));
    const ohlc = [];
    for (let i = 0; i < Number(u.searchParams.get("limit")); i++) ohlc.push({ timestamp: String(start + i * DAY), close: String(price(start + i * DAY) + 0.5) });
    return Response.json({ data: { ohlc } });
  };
  return { fetch, calls };
}

function memoryCache(start: PriceMap = {}, failPut = false) {
  const store: PriceMap = { ...start };
  const cache: PriceCache = {
    async get(keys) {
      return Object.fromEntries(keys.filter((k) => store[k]).map((k) => [k, store[k]]));
    },
    async put(p) {
      if (failPut) throw new Error("db down");
      Object.assign(store, p);
    },
  };
  return { cache, store };
}

const TODAY = "2026-11-18";

test("Coinbase answers: the day's close, labelled Coinbase", async () => {
  const ex = fakeExchanges({ price: () => 60401.47 });
  const { cache } = memoryCache();
  const got = await lookUpPrices([{ coin: "btc", date: "2026-03-19" }], { fetch: ex.fetch, cache, today: TODAY });
  assert.deepEqual(got, { "BTC:2026-03-19": { eur: 60401.47, source: "Coinbase" } });
  assert.match(ex.calls[0], /products\/BTC-EUR\/candles\?granularity=86400&start=2026-03-19T00:00:00Z&end=2026-03-19T00:00:00Z$/);
});

test("A cached day is not fetched again", async () => {
  const ex = fakeExchanges();
  const { cache } = memoryCache({ "BTC:2026-03-19": { eur: 1, source: "Bitstamp" } });
  const got = await lookUpPrices([{ coin: "BTC", date: "2026-03-19" }], { fetch: ex.fetch, cache, today: TODAY });
  assert.equal(ex.calls.length, 0);
  assert.equal(got["BTC:2026-03-19"].eur, 1);
});

test("Every past day in a fetched span is cached; today is not", async () => {
  const ex = fakeExchanges();
  const { cache, store } = memoryCache();
  await lookUpPrices([{ coin: "ETH", date: "2026-11-10" }, { coin: "ETH", date: TODAY }], { fetch: ex.fetch, cache, today: TODAY });
  assert.equal(ex.calls.length, 1);
  assert.equal(Object.keys(store).length, 8); // 10 to 17 November
  assert.equal(store[`ETH:${TODAY}`], undefined);
});

test("Dates close together share one call; years apart get one each", async () => {
  const ex = fakeExchanges();
  await lookUpPrices(
    [{ coin: "BTC", date: "2026-01-01" }, { coin: "BTC", date: "2026-09-01" }, { coin: "BTC", date: "2018-01-08" }],
    { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY },
  );
  assert.equal(ex.calls.length, 2);
});

test("Coinbase lacks the coin (404): Bitstamp is used, lower-case pair, no end date", async () => {
  const ex = fakeExchanges({ coinbase: 404, price: () => 100 });
  const got = await lookUpPrices([{ coin: "XRP", date: "2026-03-19" }], { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY });
  assert.deepEqual(got["XRP:2026-03-19"], { eur: 100.5, source: "Bitstamp" });
  assert.match(ex.calls[1], /ohlc\/xrpeur\/\?step=86400&start=\d+&limit=1$/);
});

test("Coinbase down or rate-limited: Bitstamp is used", async () => {
  for (const coinbase of ["throw", 429, 500] as const) {
    const ex = fakeExchanges({ coinbase });
    const got = await lookUpPrices([{ coin: "BTC", date: "2026-03-19" }], { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY });
    assert.equal(got["BTC:2026-03-19"].source, "Bitstamp");
  }
});

test("Neither exchange has it: no price, and nothing cached", async () => {
  const ex = fakeExchanges({ coinbase: 404, bitstamp: 404 });
  const { cache, store } = memoryCache();
  assert.deepEqual(await lookUpPrices([{ coin: "NOPE", date: "2026-03-19" }], { fetch: ex.fetch, cache, today: TODAY }), {});
  assert.deepEqual(store, {});
});

test("A failing cache write still returns the prices", async () => {
  const ex = fakeExchanges();
  const got = await lookUpPrices([{ coin: "BTC", date: "2026-03-19" }], { fetch: ex.fetch, cache: memoryCache({}, true).cache, today: TODAY });
  assert.ok(got["BTC:2026-03-19"]);
});

test("Hostile input never reaches an exchange URL", async () => {
  const ex = fakeExchanges();
  const got = await lookUpPrices(
    [
      { coin: "BTC/../../admin", date: "2026-03-19" },
      { coin: "<script>", date: "2026-03-19" },
      { coin: "BTC?x=1", date: "2026-03-19" },
      { coin: "B", date: "2026-03-19" },
      { coin: "BTC", date: "2026-03-19&end=x" },
      { coin: "BTC", date: "2026-02-30" },
      { coin: "BTC", date: "2027-01-01" }, // the future
      { coin: { toString: () => "BTC" } as unknown as string, date: "nope" },
    ],
    { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY },
  );
  assert.deepEqual(got, {});
  assert.equal(ex.calls.length, 0);
});

test(`Only the first ${MAX_ITEMS} items are looked up`, async () => {
  const ex = fakeExchanges();
  const items = Array.from({ length: MAX_ITEMS + 50 }, (_, i) => ({ coin: "BTC", date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10) }));
  const got = await lookUpPrices(items, { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY });
  assert.equal(Object.keys(got).length, MAX_ITEMS);
  assert.equal(ex.calls.length, 1); // 200 days in a row: one call
});

test("Coinbase lists the coin from a later date: Bitstamp fills the earlier dates only", async () => {
  const ex = fakeExchanges({ coinbaseFrom: "2026-03-10", price: () => 100 });
  const got = await lookUpPrices(
    [{ coin: "BTC", date: "2026-03-05" }, { coin: "BTC", date: "2026-03-12" }],
    { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY },
  );
  assert.deepEqual(got, {
    "BTC:2026-03-05": { eur: 100.5, source: "Bitstamp" },
    "BTC:2026-03-12": { eur: 100, source: "Coinbase" },
  });
});

test("One request does 16 look-ups at most and says it is incomplete; the next one carries on", async () => {
  const ex = fakeExchanges();
  const { cache } = memoryCache();
  const items = Array.from({ length: 40 }, (_, i) => ({ coin: `C${String(i).padStart(2, "0")}`, date: "2026-03-19" }));
  let incomplete = 0;
  const first = await lookUpPrices(items, { fetch: ex.fetch, cache, today: TODAY, onIncomplete: () => incomplete++ });
  assert.equal(Object.keys(first).length, 16);
  assert.equal(ex.calls.length, 16);
  assert.equal(incomplete, 1);
  const second = await lookUpPrices(items, { fetch: ex.fetch, cache, today: TODAY, onIncomplete: () => incomplete++ });
  assert.equal(Object.keys(second).length, 32);
  const third = await lookUpPrices(items, { fetch: ex.fetch, cache, today: TODAY, onIncomplete: () => incomplete++ });
  assert.equal(Object.keys(third).length, 40);
  assert.equal(incomplete, 2); // the third finished the job
});

test("Slow exchanges: no new look-up starts after the time budget", async () => {
  const ex = fakeExchanges();
  let clock = 0;
  const slow = async (url: string) => { clock += 2500; return ex.fetch(url); };
  const items = Array.from({ length: 12 }, (_, i) => ({ coin: `S${i}`, date: "2026-03-19" }));
  let incomplete = false;
  const got = await lookUpPrices(items, { fetch: slow, cache: memoryCache().cache, today: TODAY, now: () => clock, onIncomplete: () => (incomplete = true) });
  assert.equal(Object.keys(got).length, 4); // one batch of four took 10s of the 7s budget
  assert.equal(incomplete, true);
});

test("Dates before 2010 (a half-typed year) never reach an exchange", async () => {
  const ex = fakeExchanges();
  assert.deepEqual(await lookUpPrices([{ coin: "BTC", date: "0202-03-01" }, { coin: "BTC", date: "2009-12-31" }], { fetch: ex.fetch, cache: memoryCache().cache, today: TODAY }), {});
  assert.equal(ex.calls.length, 0);
});

test("Performance: 200 cached prices answered 200 times inside 300ms", async () => {
  const start: PriceMap = {};
  const items = Array.from({ length: 200 }, (_, i) => {
    const date = new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10);
    start[`BTC:${date}`] = { eur: i, source: "Coinbase" };
    return { coin: "BTC", date };
  });
  const { cache } = memoryCache(start);
  const ex = fakeExchanges();
  const t0 = cpuMs();
  for (let i = 0; i < 200; i++) await lookUpPrices(items, { fetch: ex.fetch, cache, today: TODAY });
  const ms = cpuMs() - t0;
  assert.equal(ex.calls.length, 0);
  assert.ok(ms < 300, `took ${ms.toFixed(0)}ms`);
});

/* ---------- the live coin list ---------- */

const lists = {
  "https://api.exchange.coinbase.com/products": [
    { base_currency: "SOL", quote_currency: "EUR", status: "online" },
    { base_currency: "BTC", quote_currency: "EUR", status: "online" },
    { base_currency: "BTC", quote_currency: "USD", status: "online" },
    { base_currency: "OLD", quote_currency: "EUR", status: "delisted" },
    { base_currency: "ETH", quote_currency: "EUR", status: "online" },
    { base_currency: "<b>", quote_currency: "EUR", status: "online" },
  ],
  "https://api.exchange.coinbase.com/currencies": [{ id: "BTC", name: "Bitcoin" }, { id: "ETH", name: "Ethereum" }, { id: "SOL", name: "Solana" }],
  "https://www.bitstamp.net/api/v2/trading-pairs-info/": [
    { url_symbol: "btceur", description: "Bitcoin / Euro", trading: "Enabled" },
    { url_symbol: "suieur", description: "Sui / Euro", trading: "Enabled" },
    { url_symbol: "adausd", description: "Cardano / U.S. dollar", trading: "Enabled" },
    { url_symbol: "zzzeur", description: "Gone / Euro", trading: "Disabled" },
  ],
} as Record<string, unknown>;
const listFetch = (fail: string[] = []) => async (url: string) =>
  fail.includes(url) ? new Response("down", { status: 503 }) : Response.json(lists[url]);

test("Coin list: euro pairs from both exchanges, Bitcoin and Ethereum first, then by name", async () => {
  const coins = await listCoins(listFetch());
  assert.deepEqual(coins, [
    { ticker: "BTC", name: "Bitcoin" },
    { ticker: "ETH", name: "Ethereum" },
    { ticker: "SOL", name: "Solana" },
    { ticker: "SUI", name: "Sui" },
  ]);
});

test("Coin list: one exchange down still lists the other's coins; both down gives an empty list", async () => {
  const coins = await listCoins(listFetch(["https://api.exchange.coinbase.com/products", "https://api.exchange.coinbase.com/currencies"]));
  assert.deepEqual(coins.map((c) => c.ticker), ["BTC", "SUI"]);
  assert.deepEqual(await listCoins(async () => { throw new Error("offline"); }), []);
});
