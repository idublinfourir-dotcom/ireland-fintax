import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { rateLimitsCollection } from "./collections";

interface PublicActionLimits {
  action: string;
  identity: string;
  ip: { max: number; windowSeconds: number };
  identityLimit: { max: number; windowSeconds: number };
}

function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function requestIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    headerStore.get("x-real-ip")?.trim() ||
    forwarded ||
    "unknown"
  ).slice(0, 128);
}

/**
 * Count one hit against a fixed window and report whether it is still allowed.
 *
 * The counter document is keyed by the whole (action, keyHash, windowStart)
 * triple, so `findOneAndUpdate` with `$inc` and `upsert` is a single atomic
 * server-side operation: concurrent requests in one window increment the same
 * document rather than racing.
 *
 * The field order in that composite _id is significant: MongoDB compares
 * embedded documents by exact shape, so it must always be built here.
 */
async function consume(
  action: string,
  identifier: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const keyHash = hashIdentifier(identifier);

  const limits = await rateLimitsCollection();
  const doc = await limits.findOneAndUpdate(
    { _id: { action, keyHash, windowStart } },
    {
      $inc: { count: 1 },
      // Duplicated out of the _id so the TTL index has a top-level field to
      // sweep on — that index is what keeps this collection bounded.
      $setOnInsert: { windowStart },
    },
    { upsert: true, returnDocument: "after" },
  );

  return (doc?.count ?? max + 1) <= max;
}

/**
 * Apply both per-IP and per-identity limits. Identifiers are hashed before
 * storage. Database errors fail open to avoid turning a transient metadata
 * failure into a site-wide outage; the protected action still performs its
 * normal validation and database/auth checks.
 */
export async function allowPublicAction({
  action,
  identity,
  ip,
  identityLimit,
}: PublicActionLimits): Promise<boolean> {
  try {
    const clientIp = await requestIp();
    const ipAllowed = await consume(
      `${action}:ip`,
      `ip:${clientIp}`,
      ip.max,
      ip.windowSeconds,
    );
    const identityAllowed = await consume(
      `${action}:identity`,
      `identity:${identity.trim().toLowerCase()}`,
      identityLimit.max,
      identityLimit.windowSeconds,
    );

    return ipAllowed && identityAllowed;
  } catch (err) {
    console.error(`[rate-limit:${action}] check failed open:`, err);
    return true;
  }
}
