/* Run: node --test app/lib/analytics-url.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyticsUrl } from "./analytics-url.ts";

const O = "https://www.irishfintax.ie";

test("public pages are reported without their query string or fragment", () => {
  assert.equal(analyticsUrl(`${O}/tools/ireland-cgt?x=1#result`, O), `${O}/tools/ireland-cgt`);
  assert.equal(analyticsUrl(`${O}/ga/blog`, O), `${O}/ga/blog`);
  assert.equal(analyticsUrl(`${O}/login?next=%2Fportal`, O), `${O}/login`);
  assert.equal(analyticsUrl("/about", O), `${O}/about`);
});

test("a confirmation token never leaves the browser", () => {
  assert.equal(analyticsUrl(`${O}/auth/confirm?token=abc`, O), null);
});

test("admin, auth, api and member pages are not counted, in any language", () => {
  for (const p of ["/admin", "/admin/tax-rates", "/portal", "/portal/settings", "/es/portal", "/api/auth/session", "/auth/callback"]) {
    assert.equal(analyticsUrl(O + p, O), null, p);
  }
  assert.equal(analyticsUrl(`${O}/portability`, O), `${O}/portability`);
});
