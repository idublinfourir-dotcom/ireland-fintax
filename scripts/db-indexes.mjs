// Create every index the app relies on: node scripts/db-indexes.mjs
//
// This is the migration step: MongoDB creates collections on first write, so
// indexes are the only structure there is to declare.
// Re-runnable: createIndex is a no-op when an index with the same name and
// spec already exists.
//
// Keep this in step with app/lib/collections.ts and db/schema.md.
import { MongoClient } from "mongodb";
import { mongoUri, dbName } from "./load-env.mjs";

/** Matches CASE_INSENSITIVE in app/lib/collections.ts. */
const CI = { locale: "en", strength: 2 };

const EIGHT_DAYS = 8 * 24 * 60 * 60;

const INDEXES = {
  // ── auth ────────────────────────────────────────────────────────────────
  users: [
    // The account boundary. Emails are stored lowercased, so a plain unique
    // index is enough and no collation is needed here.
    [{ email: 1 }, { unique: true, name: "users_email_unique" }],
  ],
  accounts: [
    // Auth.js looks an OAuth login up by exactly this pair.
    [
      { provider: 1, providerAccountId: 1 },
      { unique: true, name: "accounts_provider_unique" },
    ],
    [{ userId: 1 }, { name: "accounts_user_idx" }],
  ],
  email_verification_tokens: [
    [{ tokenHash: 1 }, { unique: true, name: "verification_token_unique" }],
    // expireAfterSeconds 0 means "expire at the time in this field".
    [{ expiresAt: 1 }, { expireAfterSeconds: 0, name: "verification_ttl" }],
  ],

  // ── enquiries ───────────────────────────────────────────────────────────
  enquiries: [
    // `ref` is the public id ("Ref #0042"), so uniqueness is load-bearing.
    [{ ref: 1 }, { unique: true, name: "enquiries_ref_unique" }],
    // Newest-first listing in the admin inbox and the dashboard.
    [{ createdAt: -1 }, { name: "enquiries_created_idx" }],
    // The portal's "my enquiries, newest first".
    [{ userId: 1, createdAt: -1 }, { name: "enquiries_user_idx" }],
    // claimVerifiedGuestEnquiries matches unclaimed rows by address.
    [
      { email: 1 },
      { name: "enquiries_email_ci_idx", collation: CI },
    ],
  ],
  enquiry_messages: [
    // A thread read in chronological order, scoped to one enquiry.
    [
      { enquiryRef: 1, createdAt: 1 },
      { name: "enquiry_messages_thread_idx" },
    ],
  ],

  // ── calculator rates ────────────────────────────────────────────────────
  mortgage_products: [
    // The public comparison: active products, cheapest first.
    [
      { active: 1, ratePercent: 1, lender: 1 },
      { name: "mortgage_products_active_idx" },
    ],
  ],
  cgt_multipliers: [[{ sortOrder: 1 }, { name: "cgt_multipliers_order_idx" }]],

  // ── operational ─────────────────────────────────────────────────────────
  rate_audit: [
    [{ area: 1, changedAt: -1 }, { name: "rate_audit_area_idx" }],
  ],
  request_rate_limits: [
    // Keeps the collection bounded with no scheduler and no sweep query.
    [
      { windowStart: 1 },
      { expireAfterSeconds: EIGHT_DAYS, name: "rate_limits_ttl" },
    ],
  ],
  toolkit_requests: [
    [{ createdAt: -1 }, { name: "toolkit_requests_created_idx" }],
    [{ status: 1, createdAt: -1 }, { name: "toolkit_requests_status_idx" }],
    // Per-address hourly throttle; addresses are stored as typed, so this one
    // needs the collation (and so does every query that uses it).
    [
      { email: 1, createdAt: -1 },
      { name: "toolkit_requests_email_ci_idx", collation: CI },
    ],
  ],
};

const client = new MongoClient(mongoUri(), { serverSelectionTimeoutMS: 10_000 });

try {
  await client.connect();
  const db = client.db(dbName);
  const created = [];

  for (const [collection, specs] of Object.entries(INDEXES)) {
    for (const [keys, options] of specs) {
      try {
        const name = await db.collection(collection).createIndex(keys, options);
        created.push({ collection, index: name, status: "ok" });
      } catch (err) {
        // An index of this name already exists with a different spec. Say so
        // loudly rather than half-applying: it needs a manual drop first.
        created.push({
          collection,
          index: options.name,
          status: `FAILED — ${err.message}`,
        });
        process.exitCode = 1;
      }
    }
  }

  console.log(`Indexes on "${dbName}":`);
  console.table(created);
} catch (err) {
  console.error("Index creation failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
