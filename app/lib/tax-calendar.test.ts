/* Unit tests for the home page's tax calendar.
   Run: node --test app/lib/tax-calendar.test.ts

   The dates are real calendar days in order, each one links to Revenue, the
   filter keeps a deadline open for the whole of its day in Ireland, and the
   dates fall where Revenue's rules put them. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { DEADLINES, irishToday, upcomingDeadlines } from "./tax-calendar.ts";

test("every date is a real day, in order, with a Revenue source", () => {
  for (const d of DEADLINES) {
    const parsed = new Date(`${d.date}T12:00:00Z`);
    assert.equal(parsed.toISOString().slice(0, 10), d.date, d.date);
    assert.match(d.source, /^https:\/\/www\.revenue\.ie\//, d.date);
  }
  const dates = DEADLINES.map((d) => d.date);
  assert.deepEqual(dates, [...dates].sort());
});

test("the dates follow Revenue's rules", () => {
  for (const d of DEADLINES) {
    const [, month, day] = d.date.split("-").map(Number);
    if (d.kind === "payFile") assert.deepEqual([month, day], [10, 31], d.date);
    if (d.kind === "cgtInitial") assert.deepEqual([month, day], [12, 15], d.date);
    if (d.kind === "cgtLater") assert.deepEqual([month, day], [1, 31], d.date);
    // 31 December year end: 23rd of months 6, 9 and 11.
    if (d.kind === "prelimCtFirst") assert.deepEqual([month, day], [6, 23], d.date);
    if (d.kind === "ct1") assert.deepEqual([month, day], [9, 23], d.date);
    if (d.kind === "prelimCt") assert.deepEqual([month, day], [11, 23], d.date);
  }
});

test("a deadline stays open for the whole of its day", () => {
  const next = upcomingDeadlines("2026-10-31");
  assert.equal(next[0].date, "2026-10-31");
  assert.equal(upcomingDeadlines("2026-11-01")[0].date, "2026-11-18");
  assert.deepEqual(upcomingDeadlines("2099-01-01"), []);
});

test("today is Irish time, not UTC", () => {
  // Summer time ended on 25 October, so 23:30 UTC on the 30th is still the 30th.
  assert.equal(irishToday(new Date("2026-10-30T23:30:00Z")), "2026-10-30");
  // 23:30 UTC on 30 June is 00:30 on 1 July in Irish summer time.
  assert.equal(irishToday(new Date("2026-06-30T23:30:00Z")), "2026-07-01");
});

test("the home page has four dates to show for the next year", () => {
  assert.ok(upcomingDeadlines("2026-10-28").length >= 4);
  assert.ok(upcomingDeadlines("2027-09-24").length >= 4);
});
