import { test } from "node:test";
import assert from "node:assert/strict";
import { TAX_YEARS, parseYearRates, yearRatesToJson } from "./tax-rates-parse.ts";
import { RATES_BY_YEAR } from "./ireland-income-tax.ts";

/** What a document looks like after a trip through MongoDB: plain JSON. */
const stored = (year: number) => JSON.parse(JSON.stringify(yearRatesToJson(RATES_BY_YEAR[year])));

test("TAX_YEARS: every coded year, newest first", () => {
  assert.deepEqual(TAX_YEARS, Object.keys(RATES_BY_YEAR).map(Number).sort((a, b) => b - a));
  assert.equal(TAX_YEARS[0], 2027);
});

test("round trip: every year reads back exactly as coded", () => {
  for (const year of TAX_YEARS) assert.deepEqual(parseYearRates(year, stored(year)), RATES_BY_YEAR[year], String(year));
});

test("open-ended bands are stored as null and read back as Infinity", () => {
  const doc = stored(2027);
  assert.equal(doc.usc.bands.at(-1).upTo, null);
  assert.equal(doc.pension.ageBands.at(-1).maxAge, null);
  const r = parseYearRates(2027, doc)!;
  assert.equal(r.usc.bands.at(-1)!.upTo, Infinity);
  assert.equal(r.pension.ageBands.at(-1)!.maxAge, Infinity);
});

/* The six fields added after launch, missing from the 2025 and 2026 documents
   in the live database (checked 26 Oct 2026). */
function withoutNewerFields(year: number) {
  const doc = stored(year);
  delete doc.incomeTax.srcop.marriedBandIncrease;
  delete doc.incomeTax.credits.personalWidowed;
  delete doc.incomeTax.credits.homeCarer;
  delete doc.incomeTax.homeCarerIncomeThreshold;
  delete doc.incomeTax.rentCredit;
  delete doc.autoEnrolment;
  return doc;
}

test("a document missing the newer fields takes that year's coded values", () => {
  for (const year of TAX_YEARS) assert.deepEqual(parseYearRates(year, withoutNewerFields(year)), RATES_BY_YEAR[year], String(year));
});

test("a missing married band increase is that year's, not a fixed €35,000", () => {
  assert.equal(parseYearRates(2027, withoutNewerFields(2027))!.incomeTax.srcop.marriedBandIncrease, 37_500);
  assert.equal(parseYearRates(2026, withoutNewerFields(2026))!.incomeTax.srcop.marriedBandIncrease, 35_000);
  assert.equal(parseYearRates(2025, withoutNewerFields(2025))!.incomeTax.srcop.marriedBandIncrease, 35_000);
});

test("a stored value beats the coded one", () => {
  const doc = stored(2027);
  doc.incomeTax.srcop.marriedBandIncrease = 40_000;
  doc.incomeTax.standardRate = 0.21;
  const r = parseYearRates(2027, doc)!;
  assert.equal(r.incomeTax.srcop.marriedBandIncrease, 40_000);
  assert.equal(r.incomeTax.standardRate, 0.21);
});

test("auto-enrolment is statutory: always the coded value, whatever is stored", () => {
  const doc = stored(2027);
  doc.autoEnrolment = { employeeRate: 0.5, minAge: 1, maxAge: 99, minEarnings: 0, earningsCap: 1 };
  assert.deepEqual(parseYearRates(2027, doc)!.autoEnrolment, RATES_BY_YEAR[2027].autoEnrolment);
});

test("bad data fails the whole year, so the caller falls back to code", () => {
  const breakers: [string, (d: ReturnType<typeof stored>) => void][] = [
    ["rate as text", (d) => { d.incomeTax.standardRate = "0.2"; }],
    ["required field missing", (d) => { delete d.incomeTax.higherRate; }],
    ["NaN", (d) => { d.prsi.rate = NaN; }],
    ["no USC bands", (d) => { d.usc.bands = []; }],
    ["band not an object", (d) => { d.usc.bands[0] = 5; }],
    ["no pension bands", (d) => { d.pension.ageBands = []; }],
    ["new field present but bad", (d) => { d.incomeTax.srcop.marriedBandIncrease = "37500"; }],
    ["section missing", (d) => { delete d.usc; }],
  ];
  for (const [name, breakIt] of breakers) {
    const doc = stored(2027);
    breakIt(doc);
    assert.equal(parseYearRates(2027, JSON.parse(JSON.stringify(doc, (_k, v) => (Number.isNaN(v) ? "NaN" : v)))), null, name);
  }
  for (const junk of [null, undefined, "rates", 42, []]) assert.equal(parseYearRates(2027, junk), null, String(junk));
});

test("a year with no coded config can't borrow fallbacks, so missing fields fail it", () => {
  assert.equal(parseYearRates(2030, withoutNewerFields(2027)), null);
});
