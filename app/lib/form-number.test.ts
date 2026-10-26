import { test } from "node:test";
import assert from "node:assert/strict";
import { formNumber } from "./form-number.ts";

test("formNumber: a blank is NaN, never a zero rate", () => {
  for (const blank of ["", "   ", "\t\n", null]) assert.ok(Number.isNaN(formNumber(blank)), JSON.stringify(blank));
});

test("formNumber: a typed zero is still zero", () => {
  assert.equal(formNumber("0"), 0);
  assert.equal(formNumber(" 0 "), 0);
  assert.equal(formNumber("0.0"), 0);
});

test("formNumber: numbers parse, with surrounding spaces trimmed", () => {
  assert.equal(formNumber("12.5"), 12.5);
  assert.equal(formNumber(" 46500 "), 46_500);
  assert.equal(formNumber("-3"), -3); // range checks are the caller's job
  assert.equal(formNumber("0.005"), 0.005);
});

test("formNumber: text and files are NaN", () => {
  for (const bad of ["abc", "12,5", "€100", "1 000"]) assert.ok(Number.isNaN(formNumber(bad)), bad);
  assert.ok(Number.isNaN(formNumber(new File(["9"], "x.txt"))));
});

test("formNumber: every editor's isFinite check refuses what it returns for a blank", () => {
  assert.equal(Number.isFinite(formNumber("")), false);
  assert.equal(Number.isInteger(formNumber("")), false);
});
