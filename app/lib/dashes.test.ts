/* Run: node --test app/lib/dashes.test.ts
   The dashes are written as \u2013 (en) and \u2014 (em) escapes so this file
   passes no-dashes.test.ts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { withoutDashes } from "./dashes.ts";

const EN = "\u2013";
const EM = "\u2014";

test("ranges become 'to'", () => {
  assert.equal(withoutDashes(`rates of 3.5${EN}4% from 2026${EN}2027`), "rates of 3.5 to 4% from 2026 to 2027");
});

test("a pair of dashes around an aside becomes brackets", () => {
  assert.equal(withoutDashes(`The credit ${EM} worth €2,000 ${EM} rises.`), "The credit (worth €2,000) rises.");
});

test("a single dash becomes a colon, or a comma when a colon follows", () => {
  assert.equal(withoutDashes(`Rates rise ${EM} effective 1 May.`), "Rates rise: effective 1 May.");
  assert.equal(withoutDashes(`One change ${EM} in short: higher.`), "One change, in short: higher.");
});

test("text without dashes is unchanged, and none are left over", () => {
  assert.equal(withoutDashes("Plain text, no change."), "Plain text, no change.");
  assert.doesNotMatch(withoutDashes(`${EM} lead ${EN} odd${EM} end ${EM}`), /[\u2013\u2014]/);
});
