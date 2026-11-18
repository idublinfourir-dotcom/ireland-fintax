/* Pasting rows into the crypto calculator.
   Run: node --test --experimental-strip-types app/lib/crypto-paste.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_PASTE_CHARS, parsePastedTrades, pastedDate, pastedNumber } from "./crypto-paste.ts";

test("A spreadsheet copy (tabs) with a header line", () => {
  const { rows, badType } = parsePastedTrades(
    "Date\tType\tCoin\tQuantity\tValue\tFees\n2026-03-20\tSell\tBTC\t0.3\t27000\t15\n10/02/2025\tbuy\tBTC\t0.5\t40000\t\n",
  );
  assert.deepEqual(badType, []);
  assert.deepEqual(rows, [
    { date: "2026-03-20", kind: "sell", coin: "BTC", quantity: "0.3", amount: "27000", fees: "15" },
    { date: "2025-02-10", kind: "buy", coin: "BTC", quantity: "0.5", amount: "40000", fees: "" },
  ]);
});

test("CSV with commas, quoted amounts holding a comma, and Windows line ends", () => {
  const { rows } = parsePastedTrades('2026-01-05,buy,ETH,2,"€6,000.00",3.5\r\n2026-02-05,swap,ETH,1,"3,100",0\r\n');
  assert.deepEqual(rows.map((r) => [r.kind, r.amount, r.fees]), [["buy", "6000.00", "3.5"], ["sell", "3100", "0"]]);
});

test("Semicolon CSV with decimal commas (European spreadsheets)", () => {
  const { rows } = parsePastedTrades("20.03.2026;Sold;BTC;0,3;27.000,50;1,25");
  assert.deepEqual(rows[0], { date: "2026-03-20", kind: "sell", coin: "BTC", quantity: "0.3", amount: "27000.50", fees: "1.25" });
});

test("Continental numbers: one clear decimal comma makes every comma in the paste a decimal", () => {
  // "1,500" BTC is 1.5 here (row 1 shows the style); read alone it would be 1,500.
  const { rows } = parsePastedTrades("2026-01-05\tbuy\tBTC\t0,25\t12.500,00\t1,5\n2026-02-05\tsell\tBTC\t1,500\t75.000\t0");
  assert.deepEqual(rows.map((r) => [r.quantity, r.amount, r.fees]), [["0.25", "12500.00", "1.5"], ["1.500", "75000", "0"]]);
  const plain = parsePastedTrades("2026-02-05\tsell\tBTC\t1,500\t75,000\t0").rows[0];
  assert.deepEqual([plain.quantity, plain.amount], ["1500", "75000"]);
});

test("Dot decimals with a semicolon separator stay dot decimals", () => {
  const { rows } = parsePastedTrades("2026-01-05;buy;BTC;0.25;12500.50;1.5\n2026-02-05;sell;BTC;1.500;75000;0");
  assert.deepEqual(rows.map((r) => [r.quantity, r.amount]), [["0.25", "12500.50"], ["1.500", "75000"]]);
});

test("An unknown type is reported by line, never guessed", () => {
  const { badType } = parsePastedTrades("Date,Type\n2026-01-05,buy,ETH,1,1\n2026-01-06,Verkauf,ETH,1,1\n2026-01-07,,ETH,1,1");
  assert.deepEqual(badType, [3, 4]);
});

test("The page's own labels count as types", () => {
  const { rows, badType } = parsePastedTrades("2026-01-05\tCompra\tETH\t1\t1\n2026-01-06\tVenta\tETH\t1\t1", { buy: ["Compra"], sell: ["venta"] });
  assert.deepEqual(badType, []);
  assert.deepEqual(rows.map((r) => r.kind), ["buy", "sell"]);
});

test("Dates: ISO, Irish day first, with a time, and junk passed through", () => {
  assert.equal(pastedDate("2026-3-7"), "2026-03-07");
  assert.equal(pastedDate("7/3/2026"), "2026-03-07");
  assert.equal(pastedDate("2026-03-07 14:22:01"), "2026-03-07");
  assert.equal(pastedDate("2026-03-07T14:22:01Z"), "2026-03-07");
  assert.equal(pastedDate("March 7"), "March"); // not a date: the calculator flags the row
});

test("Numbers: thousands, decimal commas and leading zeros", () => {
  assert.equal(pastedNumber("€ 1,234.50"), "1234.50");
  assert.equal(pastedNumber("1.234,50"), "1234.50");
  assert.equal(pastedNumber("1,500"), "1500");
  assert.equal(pastedNumber("0,500"), "0.500");
  assert.equal(pastedNumber("0.00012"), "0.00012");
  assert.equal(pastedNumber(""), "");
});

test("Hostile input: long coin names cut to 40, huge pastes cut, empty paste is empty", () => {
  const { rows } = parsePastedTrades(`2026-01-05\tbuy\t${"<script>".repeat(20)}\t1\t1`);
  assert.equal(rows[0].coin.length, 40);
  assert.deepEqual(parsePastedTrades(" \n \n"), { rows: [], badType: [] });
  const big = "2026-01-05\tbuy\tBTC\t1\t1\n".repeat(20_000);
  assert.ok(parsePastedTrades(big).rows.length <= MAX_PASTE_CHARS / 20);
});

/* The fastest of three batches: the budget is there to catch a slower
   algorithm, and one batch alone failed once (344ms) when the machine was busy
   with a build; alone it takes about 105ms. */
test("Performance: a 1,000-row paste parses 50 times inside 300ms", () => {
  const text = "2026-01-05\tbuy\tBTC\t0.5\t\"1,000.00\"\t1\n".repeat(1000);
  let best = Infinity;
  for (let batch = 0; batch < 3; batch++) {
    const start = performance.now();
    for (let i = 0; i < 50; i++) parsePastedTrades(text);
    best = Math.min(best, performance.now() - start);
  }
  assert.ok(best < 300, `took ${best.toFixed(0)}ms`);
});
