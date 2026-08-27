import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { getDb } from "./mongodb";

/* Typed collection accessors and document shapes. SERVER ONLY.
 *
 * One place that names every collection and spells out what a document holds,
 * so a field rename is a compile error rather than a silent `undefined`. This
 * file is the authoritative schema — see db/schema.md for the narrative
 * version, and scripts/db-indexes.mjs for the indexes.
 *
 * Conventions:
 *  - Fields are camelCase; the mapping to the shapes the UI consumes happens
 *    in each feature module, never in a page.
 *  - Timestamps are real BSON Dates, never strings.
 *  - Money and rate values are BSON doubles — numbers in, numbers out. No
 *    caller should ever need to wrap a stored value in `Number(...)`.
 */

/* ── auth ──────────────────────────────────────────────────────────────────
 * One document per account, holding both the credentials and the profile.
 * Auth.js owns `name`/`email`/`emailVerified`/`image` (its adapter reads and
 * writes them by those exact names); `role`, `passwordHash` and `createdAt`
 * are ours. Keeping them together means a role lookup is never a second query.
 */

export type UserRole = "client" | "admin";

export interface UserDoc {
  _id: ObjectId;
  /** Display name, as the user entered it at signup or as Google reports it. */
  name: string | null;
  /** Always stored lowercased — the unique index is the account boundary. */
  email: string;
  /** Set when ownership of the address has been proved. Null = unverified. */
  emailVerified: Date | null;
  /** Avatar URL from Google. Was user_metadata.avatar_url. */
  image: string | null;
  role: UserRole;
  /** bcrypt hash. Null for accounts that only ever signed in with Google. */
  passwordHash: string | null;
  createdAt: Date;
}

/** Auth.js adapter-managed OAuth links (one per provider per user). */
export interface AccountDoc {
  _id: ObjectId;
  userId: ObjectId;
  provider: string;
  providerAccountId: string;
  type: string;
  [key: string]: unknown;
}

/**
 * Single-use signup confirmation tokens.
 *
 * Deliberately ours rather than the adapter's `verification_tokens`: that
 * collection is shaped for Auth.js' own Email provider flow, and /auth/confirm
 * is a custom route. Only the SHA-256 of the token is stored, so a database
 * leak cannot be replayed into a confirmed account. Expiry is enforced twice:
 * a TTL index reaps rows, and the route re-checks `expiresAt` (TTL sweeps run
 * about once a minute, so it is not a security boundary on its own).
 */
export interface VerificationTokenDoc {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

/* ── enquiries ─────────────────────────────────────────────────────────── */

/**
 * A contact-form submission and the head of its conversation thread.
 *
 * `ref` — not `_id` — is the public identifier. The portal and the admin inbox
 * render it as "Ref #0042", so it has to stay a short incrementing number; an
 * ObjectId would surface as 24 characters of hex. See `nextSequence`.
 *
 * `lastClientMessageAt` / `lastAdminMessageAt` are denormalised: they are the
 * newest message from each side, maintained on every insert. Keeping them on
 * the document turns the unread test into a plain field comparison that the
 * list query and the unread count can both use directly, instead of scanning
 * the thread once per row.
 */
export interface EnquiryDoc {
  _id: ObjectId;
  ref: number;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  message: string;
  /** The account that owns this enquiry; null for guest submissions. */
  userId: ObjectId | null;
  adminLastReadAt: Date | null;
  clientLastReadAt: Date | null;
  /** Newest client message. Seeded to createdAt — the opening message counts. */
  lastClientMessageAt: Date;
  /** Newest admin reply, or null when the team has not replied yet. */
  lastAdminMessageAt: Date | null;
  createdAt: Date;
}

export type MessageSender = "admin" | "client";

/** A reply in an enquiry thread. Keyed by the enquiry's public `ref`. */
export interface EnquiryMessageDoc {
  _id: ObjectId;
  enquiryRef: number;
  sender: MessageSender;
  senderUserId: ObjectId | null;
  body: string;
  createdAt: Date;
}

/* ── calculator rates ──────────────────────────────────────────────────── */

/** One document per tax year; `_id` is the year. Was tax_rates. */
export interface TaxRatesDoc {
  _id: number;
  rates: unknown;
  updatedAt: Date;
}

/**
 * One document per editable calculator; `_id` is the calculator slug.
 * `config` is null when an admin reviewed the code defaults without overriding
 * them — the loader then keeps using the code fallback, so no rate drifts.
 */
export interface CalculatorSettingsDoc {
  _id: string;
  config: unknown | null;
  reviewedAt: Date;
  updatedAt: Date;
}

/** CGT's singleton config. `_id` is always 1. */
export interface CgtSettingsDoc {
  _id: 1;
  config: unknown;
  reviewedAt: Date;
  updatedAt: Date;
}

/** One indexation multiplier per year; `_id` is the year key (e.g. "2002"). */
export interface CgtMultiplierDoc {
  _id: string;
  yearLabel: string;
  sortOrder: number;
  multiplier: number;
  updatedAt: Date;
}

export type RateType =
  | "variable"
  | "fixed-1"
  | "fixed-2"
  | "fixed-3"
  | "fixed-4"
  | "fixed-5"
  | "fixed-7"
  | "fixed-10"
  | "fixed-full";

export type ProductAudience =
  | "first-time"
  | "trading-up"
  | "switch"
  | "investment";

export interface MortgageProductDoc {
  _id: ObjectId;
  lender: string;
  name: string;
  rateType: RateType;
  ratePercent: number;
  aprcPercent: number;
  maxLtv: number;
  green: boolean;
  /** Free-text badge. The structured fields below drive the maths. */
  cashback: string | null;
  /** Variable rate the loan reverts to when a fixed period ends. */
  revertRatePercent: number | null;
  cashbackPercent: number | null;
  cashbackFlat: number | null;
  details: string | null;
  audience: ProductAudience[];
  active: boolean;
  updatedAt: Date;
}

/** Central Bank policy numbers. Singleton; `_id` is always 1. */
export interface MortgageSettingsDoc {
  _id: 1;
  ratesAsOf: string;
  ltiFirstTime: number;
  ltiTradingUp: number;
  maxLtvOwner: number;
  maxLtvInvestment: number;
  maxAgeAtEnd: number;
  maxTermOwner: number;
  maxTermInvestment: number;
  updatedAt: Date;
}

/* ── operational ───────────────────────────────────────────────────────── */

/** Best-effort history of every admin rate change. */
export interface RateAuditDoc {
  _id: ObjectId;
  area: string;
  action: string;
  summary: string | null;
  details: unknown;
  changedBy: string | null;
  changedAt: Date;
}

/**
 * Fixed-window throttle counters for public actions.
 *
 * `_id` is the whole (action, keyHash, windowStart) triple, so an upsert is
 * atomic without a second unique index. Identifiers are SHA-256 hashes — raw
 * IPs and email addresses are never stored. A TTL index on `windowStart` keeps
 * the collection bounded without a scheduler.
 */
export interface RateLimitDoc {
  _id: { action: string; keyHash: string; windowStart: Date };
  count: number;
  windowStart: Date;
}

export type ToolkitRequestStatus = "pending" | "sent";

/** A Founders Hub "request a copy" submission. Fulfilment is manual. */
export interface ToolkitRequestDoc {
  _id: ObjectId;
  resourceTitle: string;
  name: string;
  phone: string;
  email: string;
  /** Requester's organisation website, always stored with its scheme. */
  website: string;
  purpose: string;
  status: ToolkitRequestStatus;
  sentAt: Date | null;
  createdAt: Date;
}

/** Monotonic sequence sources for public, human-readable ids. */
export interface CounterDoc {
  _id: string;
  seq: number;
}

/**
 * Collation for the email lookups that must ignore case.
 *
 * Strength 2 compares case-insensitively. It has to be passed on the QUERY as
 * well as the index — a query without it will not use a collated index and
 * will match case-sensitively instead, which is a silent wrong answer rather
 * than an error. Every such lookup goes through a helper in this codebase for
 * exactly that reason; see scripts/db-indexes.mjs for the matching indexes.
 */
export const CASE_INSENSITIVE = { locale: "en", strength: 2 } as const;

/**
 * Parse an id that arrived from a form or a URL, or null when it is not one.
 *
 * Stricter than `ObjectId.isValid`, which also accepts any 12-character
 * string and would happily turn a stray word into a valid-looking id.
 */
export function toObjectId(id: string | null | undefined): ObjectId | null {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
  return new ObjectId(id);
}

/**
 * Parse an enquiry's public reference number, or null when it is not one.
 * Every server action validates a submitted ref through here.
 */
export function toEnquiryRef(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const ref = Number(value);
  return Number.isSafeInteger(ref) && ref > 0 ? ref : null;
}

/* ── accessors ─────────────────────────────────────────────────────────── */

export const COLLECTIONS = {
  users: "users",
  accounts: "accounts",
  sessions: "sessions",
  verificationTokens: "email_verification_tokens",
  enquiries: "enquiries",
  enquiryMessages: "enquiry_messages",
  taxRates: "tax_rates",
  calculatorSettings: "calculator_settings",
  cgtSettings: "cgt_settings",
  cgtMultipliers: "cgt_multipliers",
  mortgageProducts: "mortgage_products",
  mortgageSettings: "mortgage_settings",
  rateAudit: "rate_audit",
  rateLimits: "request_rate_limits",
  toolkitRequests: "toolkit_requests",
  counters: "counters",
} as const;

async function collection<T extends { _id: unknown }>(
  name: string,
): Promise<Collection<T>> {
  // The driver's Collection<T> requires a Document-shaped T; our _id unions
  // (number, string, composite) are narrower than its default constraint.
  return (await getDb()).collection(name) as unknown as Collection<T>;
}

export const usersCollection = () => collection<UserDoc>(COLLECTIONS.users);
export const accountsCollection = () =>
  collection<AccountDoc>(COLLECTIONS.accounts);
export const verificationTokensCollection = () =>
  collection<VerificationTokenDoc>(COLLECTIONS.verificationTokens);
export const enquiriesCollection = () =>
  collection<EnquiryDoc>(COLLECTIONS.enquiries);
export const enquiryMessagesCollection = () =>
  collection<EnquiryMessageDoc>(COLLECTIONS.enquiryMessages);
export const taxRatesCollection = () =>
  collection<TaxRatesDoc>(COLLECTIONS.taxRates);
export const calculatorSettingsCollection = () =>
  collection<CalculatorSettingsDoc>(COLLECTIONS.calculatorSettings);
export const cgtSettingsCollection = () =>
  collection<CgtSettingsDoc>(COLLECTIONS.cgtSettings);
export const cgtMultipliersCollection = () =>
  collection<CgtMultiplierDoc>(COLLECTIONS.cgtMultipliers);
export const mortgageProductsCollection = () =>
  collection<MortgageProductDoc>(COLLECTIONS.mortgageProducts);
export const mortgageSettingsCollection = () =>
  collection<MortgageSettingsDoc>(COLLECTIONS.mortgageSettings);
export const rateAuditCollection = () =>
  collection<RateAuditDoc>(COLLECTIONS.rateAudit);
export const rateLimitsCollection = () =>
  collection<RateLimitDoc>(COLLECTIONS.rateLimits);
export const toolkitRequestsCollection = () =>
  collection<ToolkitRequestDoc>(COLLECTIONS.toolkitRequests);
export const countersCollection = () =>
  collection<CounterDoc>(COLLECTIONS.counters);

/**
 * Allocate the next number in a named sequence.
 *
 * `findOneAndUpdate` with `$inc` is atomic server-side, so two enquiries
 * submitted in the same millisecond cannot receive the same ref — which a
 * read-then-write "max + 1" would not guarantee.
 */
export async function nextSequence(name: string): Promise<number> {
  const counters = await countersCollection();
  const doc = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  const seq = doc?.seq;
  if (typeof seq !== "number") {
    throw new Error(`Could not allocate a "${name}" sequence number.`);
  }
  return seq;
}
