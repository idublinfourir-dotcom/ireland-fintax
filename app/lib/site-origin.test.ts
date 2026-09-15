import test from "node:test";
import assert from "node:assert/strict";
import { resolveEmailOrigin } from "./site-origin.ts";

const fallback = "https://www.irelandfintax.ie";

test("a configured AUTH_URL beats the request's Origin header", () => {
  // The whole point: in production the emailed link must carry the canonical
  // host, not whatever host the form happened to be posted to.
  assert.equal(
    resolveEmailOrigin({
      configured: "https://www.irelandfintax.ie",
      originHeader: "https://some-preview.vercel.app",
      fallback,
    }),
    "https://www.irelandfintax.ie",
  );
});

test("the Origin header is used when AUTH_URL is unset", () => {
  // Local development: there is no AUTH_URL and the header is exactly right.
  assert.equal(
    resolveEmailOrigin({ configured: "", originHeader: "http://localhost:3000", fallback }),
    "http://localhost:3000",
  );
});

test("an AUTH_URL of whitespace is treated as unset", () => {
  assert.equal(
    resolveEmailOrigin({ configured: "   ", originHeader: "http://localhost:3000", fallback }),
    "http://localhost:3000",
  );
});

test("the site URL is the last resort", () => {
  assert.equal(
    resolveEmailOrigin({ configured: null, originHeader: null, fallback }),
    fallback,
  );
});

test("a trailing slash is stripped, so the link never doubles it", () => {
  assert.equal(
    resolveEmailOrigin({ configured: "https://www.irelandfintax.ie/", originHeader: null, fallback }),
    "https://www.irelandfintax.ie",
  );
  assert.equal(
    resolveEmailOrigin({ configured: "https://www.irelandfintax.ie///", originHeader: null, fallback }),
    "https://www.irelandfintax.ie",
  );
});
