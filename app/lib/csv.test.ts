/* Unit tests for the CGT multiplier CSV helpers.
   Run: node --test app/lib/csv.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMultiplierCsv, serializeMultiplierCsv, mergeMultipliers } from "./csv.ts";

test("parse a valid csv", () => {
  const { rows, errors } = parseMultiplierCsv(
    "year_key,year_label,sort_order,multiplier\n1990-91,1990/91,16,1.442\n2002,2002,28,1.049\n",
  );
  assert.equal(errors.length, 0);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], { yearKey: "1990-91", yearLabel: "1990/91", sortOrder: 16, multiplier: 1.442 });
});

test("bad rows are reported with a line number and skipped", () => {
  const { rows, errors } = parseMultiplierCsv(
    "year_key,year_label,sort_order,multiplier\n1990-91,1990/91,16,1.442\nbadrow,only,three\n2002,2002,28,-5\n",
  );
  assert.equal(rows.length, 1); // only the good row survives
  assert.equal(errors.length, 2);
  assert.match(errors[0], /line 3/); // too few columns
  assert.match(errors[1], /line 4/); // negative multiplier
});

test("serialize + parse round-trips, incl. a label containing a comma", () => {
  const rows = [
    { yearKey: "2001", yearLabel: "2001 (6 Apr–31 Dec)", sortOrder: 27, multiplier: 1.087 },
    { yearKey: "x", yearLabel: "a, b", sortOrder: 30, multiplier: 1.5 },
  ];
  const { rows: back, errors } = parseMultiplierCsv(serializeMultiplierCsv(rows));
  assert.equal(errors.length, 0);
  assert.deepEqual(back, rows);
});

test("serialize an empty list is just the header; commas get quoted", () => {
  assert.equal(serializeMultiplierCsv([]), "year_key,year_label,sort_order,multiplier\r\n");
  const csv = serializeMultiplierCsv([{ yearKey: "x", yearLabel: "a, b", sortOrder: 1, multiplier: 2 }]);
  assert.match(csv, /"a, b"/);
});

test("mergeMultipliers upserts and never deletes", () => {
  const current = [
    { yearKey: "2001", yearLabel: "2001", sortOrder: 27, multiplier: 1.087 },
    { yearKey: "2002", yearLabel: "2002", sortOrder: 28, multiplier: 1.049 },
  ];
  const incoming = [
    { yearKey: "2002", yearLabel: "2002", sortOrder: 28, multiplier: 1.05 }, // changed
    { yearKey: "2003", yearLabel: "2003", sortOrder: 29, multiplier: 1.02 }, // added
  ];
  const { result, added, changed } = mergeMultipliers(current, incoming);
  assert.deepEqual(added, ["2003"]);
  assert.deepEqual(changed, ["2002"]);
  assert.equal(result.length, 3); // 2001 untouched, not deleted
  assert.equal(result.find((r) => r.yearKey === "2002")?.multiplier, 1.05);
});

test("mergeMultipliers reports nothing when incoming is identical", () => {
  const current = [{ yearKey: "2002", yearLabel: "2002", sortOrder: 28, multiplier: 1.049 }];
  const { added, changed } = mergeMultipliers(current, [{ ...current[0] }]);
  assert.equal(added.length, 0);
  assert.equal(changed.length, 0);
});
