/* Unit tests for the mortgage comparison: the High Value minimum-loan rule
   and the integrity of the static rate snapshot (the fallback when the
   database is unreachable).
   Run: node --test app/lib/ireland-mortgage.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";

import { LENDER_PRODUCTS, compareProducts, type ComparisonInput } from "./ireland-mortgage.ts";
import { cpuMs } from "./cpu-time.ts";

const input = (loanAmount: number): ComparisonInput => ({
  productType: "first-time",
  propertyValue: Math.round(loanAmount / 0.8),
  loanAmount,
  termYears: 30,
  age: 30,
  income: 200_000,
});

const ids = (loan: number) => compareProducts(input(loan)).quotes.map((q) => String(q.product.id));

test("High Value rates are hidden below their minimum loan", () => {
  const under = ids(249_999);
  assert.ok(!under.some((id) => id.includes("hvm")));
  assert.ok(under.includes("boi-3f"), "ordinary rates still show");
});

test("High Value rates show from exactly their minimum loan", () => {
  const at250 = ids(250_000);
  for (const id of ["boi-hvm-1f", "boi-hvm-4f", "boi-hvm-5f", "boi-hvm-7f", "aib-hvm-4f", "ptsb-hvm-3f", "ptsb-hvm-green-5f"]) {
    assert.ok(at250.includes(id), id);
  }
  assert.ok(!at250.includes("avant-hvm-4f"), "Avant's needs €300,000");
  assert.ok(ids(300_000).includes("avant-hvm-4f"));
});

test("High Value rates are never offered on buy-to-let", () => {
  const btl = compareProducts({ ...input(400_000), productType: "investment", propertyValue: 600_000 });
  assert.ok(!btl.quotes.some((q) => q.product.minLoan));
});

test("snapshot rows are plausible and consistent", () => {
  const seen = new Set<string>();
  for (const p of LENDER_PRODUCTS) {
    const id = String(p.id);
    assert.ok(!seen.has(id), `duplicate id ${id}`);
    seen.add(id);
    assert.ok(p.ratePercent >= 0.5 && p.ratePercent <= 15, id);
    assert.ok(p.aprcPercent >= 0.5 && p.aprcPercent <= 20, id);
    assert.ok(p.maxLtv >= 0.5 && p.maxLtv <= 1, id);
    assert.equal(p.cashback != null, p.cashbackPercent != null, `${id}: badge and cashback % disagree`);
    // A High Value name always carries its minimum, and those rates pay no cashback.
    assert.equal(/\(High Value\)$/.test(p.name), p.minLoan != null, id);
    if (p.minLoan != null) {
      assert.ok(p.minLoan > 0, id);
      assert.equal(p.cashbackPercent, undefined, id);
    }
  }
});

test("comparison stays fast over the whole snapshot", () => {
  const start = cpuMs();
  for (let i = 0; i < 2_000; i++) compareProducts(input(200_000 + i * 100));
  const ms = cpuMs() - start;
  // ~42 products x 2,000 runs; budget is generous for slow CI runners.
  assert.ok(ms < 1_500, `took ${ms.toFixed(0)}ms`);
});
