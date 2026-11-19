/* Crypto CGT. Run: node --test --experimental-strip-types app/lib/ireland-crypto-cgt.test.ts
   Every expected figure is worked by hand in the comment beside it; the
   first two are Revenue's own examples in TDM Part 02-01-03. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { CGT_CONFIG_DEFAULT } from "./ireland-cgt.ts";
import { computeCryptoCgt, dayNumber, MAX_TRADES, type CryptoTrade } from "./ireland-crypto-cgt.ts";
import { cpuMs } from "./cpu-time.ts";

const C = CGT_CONFIG_DEFAULT; // 31% from 7 Oct 2026, €1,270 exemption
const buy = (date: string, quantity: number, amountEur: number, coin = "BTC", feesEur = 0): CryptoTrade => ({
  date, kind: "buy", coin, quantity, amountEur, feesEur,
});
const sell = (date: string, quantity: number, amountEur: number, coin = "BTC", feesEur = 0): CryptoTrade => ({
  date, kind: "sell", coin, quantity, amountEur, feesEur,
});
const run = (trades: CryptoTrade[], bf = 0) => computeCryptoCgt(trades, C, bf);

/* ---------- Revenue's examples ---------- */

test("Revenue Example 1 (John): €500 gain, all of it covered by the exemption", () => {
  const r = run([buy("2023-03-01", 1, 4500), sell("2024-03-01", 1, 5000)]);
  assert.deepEqual(r.issues, []);
  assert.equal(r.disposals[0].gain, 500);
  assert.equal(r.years[0].exemption, 500);
  assert.equal(r.years[0].tax, 0);
});

test("Revenue Example 2 (Mary): 15,000 - 4,500 - 2,500 b/f - 1,270 = 6,730 at 33% = €2,220.90", () => {
  const r = run([buy("2023-03-01", 1, 4500), sell("2024-03-01", 1, 15000)], 2500);
  const y = r.years[0];
  assert.equal(y.lossesUsed, 2500);
  assert.equal(y.taxable, 6730);
  assert.equal(y.tax, 2220.9);
  assert.equal(y.dueDecember, 2220.9);
});

/* ---------- matching ---------- */

test("First in, first out: a buy more than four weeks before the sale is not matched first", () => {
  // Cost is the January coin (10,000): gain 20,000, less 1,270 = 18,730 at 33% = 6,180.90.
  const r = run([buy("2025-01-10", 1, 10000), buy("2025-06-01", 1, 20000), sell("2026-03-01", 1, 30000)]);
  assert.equal(r.disposals[0].cost, 10000);
  assert.equal(r.disposals[0].fourWeekQty, 0);
  assert.equal(r.years[0].tax, 6180.9);
});

test("Four-week rule (Revenue's Tara example): sold 14 April, matched with the 1 April buy", () => {
  const r = run([buy("2026-01-02", 1000, 1000), buy("2026-04-01", 2000, 4000), sell("2026-04-14", 2000, 5000)]);
  assert.equal(r.disposals[0].cost, 4000);
  assert.equal(r.disposals[0].gain, 1000);
  assert.equal(r.disposals[0].fourWeekQty, 2000);
});

test("Four-week rule: the excess over the recent buys goes first in, first out", () => {
  // 2,000 from April (4,000) + 500 from January (500) = 4,500.
  const r = run([buy("2026-01-02", 1000, 1000), buy("2026-04-01", 2000, 4000), sell("2026-04-14", 2500, 6250)]);
  assert.equal(r.disposals[0].cost, 4500);
  assert.equal(r.disposals[0].gain, 1750);
});

test("Four-week window: 28 days counts, 29 does not; latest buy in the window first", () => {
  const in28 = run([buy("2026-01-01", 1, 100), buy("2026-02-01", 1, 300), buy("2026-02-10", 1, 500), sell("2026-03-01", 1, 1000)]);
  assert.equal(in28.disposals[0].cost, 500); // 10 Feb, the latest of the two in the window
  const at29 = run([buy("2026-01-01", 1, 100), buy("2026-01-31", 1, 300), sell("2026-03-01", 1, 1000)]);
  assert.equal(at29.disposals[0].cost, 100); // 31 Jan is 29 days back: FIFO
  const at28 = run([buy("2026-01-01", 1, 100), buy("2026-02-01", 1, 300), sell("2026-03-01", 1, 1000)]);
  assert.equal(at28.disposals[0].cost, 300);
});

test("A buy on the same day as the sale is matched under the four-week rule", () => {
  const r = run([buy("2025-01-01", 1, 100), sell("2026-05-05", 1, 900), buy("2026-05-05", 1, 800)]);
  assert.equal(r.disposals[0].cost, 800);
});

test("Coins are matched per coin, ignoring case and spaces", () => {
  const r = run([buy("2025-01-01", 1, 100, "btc"), buy("2025-01-01", 10, 50, "ETH"), sell("2026-05-05", 1, 900, " BTC ")]);
  assert.equal(r.disposals[0].cost, 100);
});

test("Fees: added to the cost of a buy, taken off the proceeds of a sale", () => {
  // 9,000 - 50 fee - (5,000 + 25 fee) = 3,925.
  const r = run([buy("2025-01-01", 1, 5000, "BTC", 25), sell("2026-05-05", 1, 9000, "BTC", 50)]);
  assert.equal(r.disposals[0].gain, 3925);
});

test("A swap is a sale of one coin and a buy of the other at the same euro value", () => {
  // BTC cost 2,000, swapped for ETH worth 6,000 (gain 4,000); ETH later sold for 7,000 (gain 1,000).
  const r = run([
    buy("2025-01-01", 1, 2000, "BTC"),
    sell("2026-03-01", 1, 6000, "BTC"),
    buy("2026-03-01", 3, 6000, "ETH"),
    sell("2027-03-01", 3, 7000, "ETH"),
  ]);
  assert.deepEqual(r.disposals.map((d) => d.gain), [4000, 1000]);
});

test("Part of a buy: cost is shared by quantity, small fractions included", () => {
  const r = run([buy("2025-01-01", 0.3, 9000), sell("2026-05-05", 0.1, 4000)]);
  assert.equal(r.disposals[0].cost, 3000);
});

/* ---------- still held ---------- */

test("Still held: what is left after FIFO, at its share of cost, fees included", () => {
  // 0.5 BTC for 40,000 + 20 fee, 0.1 for 8,500 + 5; sold 0.3 (0.1 recent + 0.2 oldest).
  // Left: 0.3 of the first buy at 40,020 × 0.3/0.5 = 24,012. ETH untouched: 2 for 6,000.
  const r = run([
    buy("2025-02-10", 0.5, 40000, "BTC", 20),
    buy("2026-03-03", 0.1, 8500, "BTC", 5),
    sell("2026-03-20", 0.3, 27000),
    buy("2026-05-01", 2, 6000, "ETH"),
  ]);
  assert.deepEqual(r.holdings.map((h) => [h.coin, Number(h.quantity.toFixed(8)), h.cost]), [["btc", 0.3, 24012], ["eth", 2, 6000]]);
});

test("Still held: buys only, no sales, still listed; a coin sold out is not", () => {
  assert.deepEqual(run([buy("2026-01-01", 1, 500, "SOL")]).holdings, [{ coin: "sol", quantity: 1, cost: 500 }]);
  assert.deepEqual(run([buy("2026-01-01", 1, 500, "SOL"), sell("2026-02-01", 1, 600, "SOL")]).holdings, []);
});

/* ---------- loss buy-back restriction ---------- */

test("Loss with a buy-back in four weeks (Revenue's Jane example): the loss waits for those coins", () => {
  const r = run([buy("2025-06-01", 3000, 4000), sell("2026-03-14", 3000, 3000), buy("2026-04-01", 3000, 3000)]);
  assert.equal(r.disposals[0].gain, -1000);
  assert.equal(r.disposals[0].restrictedLoss, 1000);
  assert.equal(r.years[0].losses, 0);
  assert.equal(r.years[0].lossCarried, 0);
  assert.equal(r.restrictedLeft, 1000);
});

test("Restricted loss is used when the bought-back coins are sold at a gain", () => {
  // Bought back at 3,000, sold for 5,000: gain 2,000 less the 1,000 loss = 1,000, under the exemption.
  const r = run([
    buy("2025-06-01", 3000, 4000),
    sell("2026-03-14", 3000, 3000),
    buy("2026-04-01", 3000, 3000),
    sell("2026-12-01", 3000, 5000),
  ]);
  assert.equal(r.disposals[1].restrictedUsed, 1000);
  assert.equal(r.years[0].gains, 1000);
  assert.equal(r.years[0].tax, 0);
  assert.equal(r.restrictedLeft, 0);
});

test("Restricted loss does not go against a gain on other coins", () => {
  // Other BTC sold at a gain of 5,000; the 1,000 restricted loss stays put: 5,000 - 1,270 = 3,730 at 33%.
  const r = run([
    buy("2024-01-01", 1, 1000),
    buy("2025-06-01", 3000, 4000, "ADA"),
    sell("2026-03-14", 3000, 3000, "ADA"),
    buy("2026-04-01", 3000, 3000, "ADA"),
    sell("2026-05-01", 1, 6000),
  ]);
  assert.equal(r.years[0].lossesUsed, 0);
  assert.equal(r.years[0].tax, 1230.9);
  assert.equal(r.restrictedLeft, 1000);
});

test("Buying back half the coins restricts half the loss", () => {
  const r = run([buy("2025-06-01", 3000, 4000), sell("2026-03-14", 3000, 3000), buy("2026-04-01", 1500, 1500)]);
  assert.equal(r.disposals[0].restrictedLoss, 500);
  assert.equal(r.years[0].losses, 500);
  assert.equal(r.years[0].lossCarried, 500);
});

test("A buy more than four weeks after the loss does not restrict it", () => {
  const r = run([buy("2025-06-01", 1, 4000), sell("2026-03-01", 1, 3000), buy("2026-03-30", 1, 3000)]);
  assert.equal(r.disposals[0].restrictedLoss, 0);
  assert.equal(r.years[0].lossCarried, 1000);
});

/* ---------- the year ---------- */

test("2026 has two rates: losses and the exemption go against the 33% gains first", () => {
  // 33%: 10,000 - 3,000 loss - 1,270 = 5,730 → 1,890.90. 31%: 10,000 → 3,100. Total 4,990.90.
  const r = run([
    buy("2025-01-01", 1, 1000),
    buy("2025-01-01", 1, 1000, "ETH"),
    buy("2025-01-01", 1, 4000, "SOL"),
    sell("2026-03-01", 1, 11000),
    sell("2026-05-01", 1, 1000, "SOL"),
    sell("2026-11-01", 1, 11000, "ETH"),
  ]);
  assert.deepEqual(r.disposals.map((d) => d.ratePercent), [33, 33, 31]);
  assert.equal(r.years[0].tax, 4990.9);
});

test("6 October 2026 is 33%, 7 October is 31%", () => {
  const r = run([buy("2025-01-01", 2, 0), sell("2026-10-06", 1, 100), sell("2026-10-07", 1, 100)]);
  assert.deepEqual(r.disposals.map((d) => d.ratePercent), [33, 31]);
});

test("Pay dates: a December loss cuts the year's tax, nothing more is due in January", () => {
  // Jan to Nov: 10,000 - 1,270 = 8,730 at 31% = 2,706.30. Year: 5,000 - 1,270 = 3,730 → 1,156.30.
  const r = run([
    buy("2025-01-01", 1, 0),
    buy("2025-01-01", 1, 6000, "ETH"),
    sell("2026-11-20", 1, 10000),
    sell("2026-12-10", 1, 1000, "ETH"),
  ]);
  const y = r.years[0];
  assert.equal(y.dueDecember, 2706.3);
  assert.equal(y.tax, 1156.3);
  assert.equal(y.dueJanuary, 0);
});

test("Pay dates: a December gain is paid by 31 January", () => {
  // Jan to Nov: 3,730 at 31% = 1,156.30. Year: 8,730 → 2,706.30, so 1,550 in January.
  const r = run([buy("2025-01-01", 2, 0), sell("2027-03-01", 1, 5000), sell("2027-12-01", 1, 5000)]);
  assert.equal(r.years[0].dueDecember, 1156.3);
  assert.equal(r.years[0].dueJanuary, 1550);
});

test("A loss carries into the next year, used before the exemption", () => {
  const r = run([
    buy("2024-01-01", 1, 5000),
    buy("2024-01-01", 1, 0, "ETH"),
    sell("2025-02-01", 1, 1000),
    sell("2026-02-01", 1, 3000, "ETH"),
  ]);
  assert.deepEqual(r.years.map((y) => [y.year, y.lossCarried]), [[2025, 4000], [2026, 1000]]);
  assert.equal(r.years[1].exemption, 0);
  assert.equal(r.years[1].tax, 0);
});

test("A disposal before 2013 uses up coins but is not taxed here", () => {
  const r = run([buy("2011-01-01", 2, 100), sell("2012-06-01", 1, 500), sell("2026-02-01", 1, 2000)]);
  assert.equal(r.disposals[0].outOfRange, true);
  assert.equal(r.disposals[1].cost, 50);
  assert.deepEqual(r.years.map((y) => y.year), [2026]);
});

/* ---------- hostile and broken input ---------- */

test("Selling more than was bought is an error, not a free cost", () => {
  const r = run([buy("2025-01-01", 1, 100), sell("2026-01-01", 1.5, 900)]);
  assert.deepEqual(r.issues, [{ row: 1, code: "oversold", short: 0.5 }]);
  assert.deepEqual(r.years, []);
});

test("Selling before buying is an error", () => {
  const r = run([sell("2025-01-01", 1, 900), buy("2025-02-01", 1, 100)]);
  assert.equal(r.issues[0].code, "oversold");
});

test("Bad rows are reported by row and no figures are given", () => {
  const r = run([
    buy("2026-02-30", 1, 100),
    buy("2026-1-5", 1, 100),
    buy("2026-01-05", Number.NaN, 100),
    buy("2026-01-05", -1, 100),
    buy("2026-01-05", 0, 100),
    buy("2026-01-05", 1, Infinity),
    buy("2026-01-05", 1, -5),
    buy("2026-01-05", 1, 100, "BTC", Number.NaN),
    buy("2026-01-05", 1, 100, "   "),
    buy("2026-01-05", 1, 100, "x".repeat(41)),
    sell("2028-01-05", 1, 100),
  ]);
  assert.deepEqual(
    r.issues.map((i) => [i.row, i.code]),
    [[0, "date"], [1, "date"], [2, "quantity"], [3, "quantity"], [4, "quantity"], [5, "amount"], [6, "amount"], [7, "amount"], [8, "coin"], [9, "coin"], [10, "future"]],
  );
  assert.deepEqual(r.disposals, []);
});

test("Markup in a coin name is kept as a plain name (React renders it as text)", () => {
  const r = run([buy("2025-01-01", 1, 100, "<img src=x onerror=alert(1)>"), sell("2026-01-01", 1, 200, "<IMG src=x onerror=alert(1)>")]);
  assert.deepEqual(r.issues, []);
  assert.equal(r.disposals[0].coin, "<img src=x onerror=alert(1)>");
});

test("A non-numeric or negative brought-forward loss counts as none", () => {
  const trades = [buy("2025-01-01", 1, 0), sell("2026-02-01", 1, 2270)];
  assert.equal(run(trades, Number.NaN).years[0].taxable, 1000);
  assert.equal(run(trades, -500).years[0].taxable, 1000);
});

test(`More than ${MAX_TRADES} rows is refused before any work`, () => {
  const r = run(Array.from({ length: MAX_TRADES + 1 }, () => buy("2025-01-01", 1, 1)));
  assert.deepEqual(r.issues, [{ row: -1, code: "tooMany" }]);
});

test("dayNumber accepts real dates only", () => {
  assert.equal(dayNumber("1970-01-02"), 1);
  assert.equal(dayNumber("2024-02-29") !== null, true);
  assert.equal(dayNumber("2025-02-29"), null);
  assert.equal(dayNumber("2025-13-01"), null);
  assert.equal(dayNumber("not a date"), null);
});

/* ---------- performance ---------- */

test(`Performance: ${MAX_TRADES} rows (500 buys, 500 sales, two coins) 20 times inside 500ms`, () => {
  const trades: CryptoTrade[] = [];
  for (let i = 0; i < MAX_TRADES / 2; i++) {
    const d = new Date(Date.UTC(2020, 0, 1 + i * 3)).toISOString().slice(0, 10);
    const coin = i % 2 ? "BTC" : "ETH";
    trades.push(buy(d, 2, 1000 + i, coin), sell(d, 1, 900 + (i % 7) * 100, coin));
  }
  const start = cpuMs();
  for (let i = 0; i < 20; i++) assert.deepEqual(run(trades).issues, []);
  const ms = cpuMs() - start;
  assert.ok(ms < 500, `took ${ms.toFixed(0)}ms`);
});
