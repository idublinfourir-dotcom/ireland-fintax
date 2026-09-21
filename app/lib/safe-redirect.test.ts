import test from "node:test";
import assert from "node:assert/strict";
import { safeRedirectOr, safeRedirectPath } from "./safe-redirect.ts";

test("keeps ordinary same-origin paths", () => {
  for (const p of ["/portal", "/admin", "/portal/settings", "/a/b?c=d", "/x#y"]) {
    assert.equal(safeRedirectPath(p), p, p);
  }
});

test("rejects a protocol-relative URL", () => {
  assert.equal(safeRedirectPath("//evil.ie"), null);
  assert.equal(safeRedirectPath("//evil.ie/phish"), null);
});

test("rejects the backslash form the naive check lets through", () => {
  /* The bug this module exists for. A browser treats "\" as "/" in the
     authority position, so every one of these leaves the site even though
     each starts with a single "/". */
  for (const p of ["/\\evil.ie", "/\\/evil.ie", "/\\\\evil.ie", "/\\evil.ie/phish"]) {
    assert.equal(safeRedirectPath(p), null, p);
  }
});

test("rejects an absolute URL, whatever the scheme", () => {
  for (const p of ["https://evil.ie", "http://evil.ie", "javascript:alert(1)", "data:text/html,x"]) {
    assert.equal(safeRedirectPath(p), null, p);
  }
});

test("rejects anything not anchored at the root", () => {
  for (const p of ["portal", "../admin", "", "   ", null, undefined]) {
    assert.equal(safeRedirectPath(p), null, JSON.stringify(p));
  }
});

test("returns what survived parsing, not the raw input", () => {
  // Traversal is resolved away rather than passed through.
  assert.equal(safeRedirectPath("/portal/../admin"), "/admin");
});

test("falls back when the value is not usable", () => {
  assert.equal(safeRedirectOr("/\\evil.ie", "/portal"), "/portal");
  assert.equal(safeRedirectOr("/admin", "/portal"), "/admin");
  assert.equal(safeRedirectOr(null, "/portal"), "/portal");
});
