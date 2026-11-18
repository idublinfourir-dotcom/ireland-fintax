/* Euro prices for the crypto calculator: POST { items: [{ coin, date }] }
   → { prices: { "BTC:2026-03-19": { eur, source } }, complete }.
   Only a ticker and a date arrive here, never amounts. The server asks
   Coinbase or Bitstamp (lib/crypto-prices.ts), so the visitor's address is
   not passed to them, and past days are cached in crypto_prices. */
import { NextResponse } from "next/server";
import { cryptoPricesCollection } from "../../lib/collections";
import { isDbConfigured } from "../../lib/db-config";
import { exchangeFetch, lookUpPrices, MAX_ITEMS, type PriceCache, type PriceMap } from "../../lib/crypto-prices";
import { allowPublicAction } from "../../lib/rate-limit";

const noStore = { "Cache-Control": "no-store" };

/* A database fault costs a cache miss, never the answer. */
const mongoCache: PriceCache = {
  async get(keys) {
    if (!isDbConfigured()) return {};
    try {
      const docs = await (await cryptoPricesCollection()).find({ _id: { $in: keys } }).toArray();
      return Object.fromEntries(docs.map((d) => [d._id, { eur: d.eur, source: d.source }])) as PriceMap;
    } catch (err) {
      console.error("[crypto-prices] cache read failed:", err);
      return {};
    }
  },
  async put(prices) {
    if (!isDbConfigured()) return;
    const fetchedAt = new Date();
    await (await cryptoPricesCollection()).bulkWrite(
      Object.entries(prices).map(([_id, p]) => ({
        updateOne: { filter: { _id }, update: { $setOnInsert: { ...p, fetchedAt } }, upsert: true },
      })),
      { ordered: false },
    );
  },
};

export async function POST(request: Request) {
  /* JSON only. A page on another site cannot send this content type without a
     preflight, which gets no permission here, so other sites cannot make
     their visitors' browsers spend our look-ups. */
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "unsupported_media_type" }, { status: 415, headers: noStore });
  }

  /* The page asks once per coin or date change, so a visitor working through
     a list makes many small requests; most are answered from the cache. This
     limiter is what stands between the public and the exchanges, so when the
     database is configured but cannot be read, requests are refused, not let
     through uncounted: the page then asks for the price to be typed. */
  const allowed = await allowPublicAction({
    action: "crypto-prices",
    identity: "site",
    ip: { max: 120, windowSeconds: 600 },
    identityLimit: { max: 3000, windowSeconds: 600 },
    failClosed: isDbConfigured(),
  });
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: noStore });

  // 200 items are about 8KB. The length header can be absent, so the text
  // itself is measured before it is parsed.
  let items: unknown;
  try {
    const text = await request.text();
    if (text.length > 32_000) return NextResponse.json({ error: "too_large" }, { status: 413, headers: noStore });
    items = (JSON.parse(text) as { items?: unknown }).items;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400, headers: noStore });
  }
  if (!Array.isArray(items) || items.length > MAX_ITEMS || !items.every((i) => i && typeof i === "object")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400, headers: noStore });
  }

  // `complete: false`: some look-ups were left for the next request, so a
  // missing key does not mean "no price".
  let complete = true;
  const prices = await lookUpPrices(items as { coin: string; date: string }[], {
    fetch: exchangeFetch,
    cache: mongoCache,
    onIncomplete: () => (complete = false),
  });
  return NextResponse.json({ prices, complete }, { headers: noStore });
}
