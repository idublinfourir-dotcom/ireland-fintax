import { test } from "node:test";
import assert from "node:assert/strict";
import { nameFromUpdate } from "./auth/session-update.ts";

test("nameFromUpdate: reads the shape the settings page sends", () => {
  assert.equal(nameFromUpdate({ user: { name: "Aoife Byrne" } }), "Aoife Byrne");
});

test("nameFromUpdate: the old top-level shape is not a rename", () => {
  // The bug: the callback read session.name, which update() never sets.
  assert.equal(nameFromUpdate({ name: "Aoife Byrne" }), undefined);
});

test("nameFromUpdate: anything else leaves the name alone", () => {
  for (const s of [undefined, null, "Aoife", 42, {}, { user: null }, { user: {} }, { user: { name: 7 } }, { user: { name: null } }]) {
    assert.equal(nameFromUpdate(s), undefined, JSON.stringify(s));
  }
});

test("nameFromUpdate: an empty string is passed on, validation is the action's job", () => {
  assert.equal(nameFromUpdate({ user: { name: "" } }), "");
});
