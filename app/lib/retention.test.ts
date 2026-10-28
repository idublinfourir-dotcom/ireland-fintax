/* Run: node --test app/lib/retention.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RETENTION_YEARS,
  retentionCutoff,
  staleEnquiryFilter,
  staleToolkitRequestFilter,
} from "./retention.ts";

test("the cutoff is two years before now", () => {
  assert.equal(RETENTION_YEARS, 2);
  assert.equal(
    retentionCutoff(new Date("2026-10-28T09:00:00Z")).toISOString(),
    "2024-10-28T09:00:00.000Z",
  );
});

test("a cutoff from 29 February lands on 1 March", () => {
  assert.equal(
    retentionCutoff(new Date("2028-02-29T00:00:00Z")).toISOString(),
    "2026-03-01T00:00:00.000Z",
  );
});

test("a question is stale only when both sides went quiet before the cutoff", () => {
  const cutoff = new Date("2024-10-28T00:00:00Z");
  assert.deepEqual(staleEnquiryFilter(cutoff), {
    lastClientMessageAt: { $lt: cutoff },
    $or: [{ lastAdminMessageAt: null }, { lastAdminMessageAt: { $lt: cutoff } }],
  });
});

test("a resource request is stale by its request date", () => {
  const cutoff = new Date("2024-10-28T00:00:00Z");
  assert.deepEqual(staleToolkitRequestFilter(cutoff), { createdAt: { $lt: cutoff } });
});
