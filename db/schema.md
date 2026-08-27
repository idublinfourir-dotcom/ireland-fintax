# Database — MongoDB

MongoDB creates a collection on first write, so there is no DDL to apply: the
only structure to declare is the indexes.

```bash
node scripts/db-check.mjs     # connectivity + document counts
node scripts/db-indexes.mjs   # create every index (re-runnable)
node scripts/db-seed.mjs      # seed the mortgage products + policy
```

The authoritative document shapes are the TypeScript interfaces in
`app/lib/collections.ts` — that file, not this one, is what the compiler checks.
This page is the map and the reasoning.

---

## Conventions

- Fields are **camelCase**. Mapping to the shapes the UI consumes happens in
  each feature module, never in a page.
- Timestamps are real BSON `Date`s, never strings.
- Rates and money are BSON doubles — numbers in, numbers out. No caller should
  ever need to wrap a stored value in `Number(...)`.
- Where a natural key exists it **is** the `_id` (a calculator slug, a tax year,
  a CGT year key, the singleton `1`). Everything else uses an ObjectId.

---

## Collections

### Auth

| Collection | `_id` | Notes |
| --- | --- | --- |
| `users` | ObjectId | One document per account |
| `accounts` | ObjectId | Auth.js adapter: one per linked OAuth provider |
| `sessions` | ObjectId | Created by the adapter; unused — sessions are JWTs |
| `email_verification_tokens` | ObjectId | Signup confirmation links |

`users` holds the credentials **and** the profile in one document, so a role
lookup is never a second query:

```js
{
  _id: ObjectId,
  name: "Ada Lovelace" | null,   // Auth.js field. Display name
  email: "ada@example.ie",       // lowercased; unique index is the account boundary
  emailVerified: Date | null,    // Auth.js field. null = address not yet proved
  image: "https://…" | null,     // Auth.js field. Google avatar
  role: "client" | "admin",      // ours. Set once, at account creation
  passwordHash: "$2b$12$…" | null, // ours. null for Google-only accounts
  createdAt: Date,               // ours
}
```

**Roles.** `ADMIN_EMAILS` (comma-separated, case-insensitive) is the allow-list.
It is applied once, at account creation, on every sign-in path — password or Google. Nothing in the app writes
`role` afterwards, so a client cannot self-promote. To change an existing
account:

```js
db.users.updateOne({ email: "someone@example.ie" }, { $set: { role: "admin" } })
```

The role rides in the session JWT, so it takes effect on that user's **next
sign-in** — the price of not re-reading the account on every request.

Auth.js creates and links OAuth accounts with `emailVerified: null`; the
`signIn` event in `auth.ts` stamps it for the `google` provider, since Google
verifies addresses. Without that a Google account can never sign in with a
password set later on the settings page.

`email_verification_tokens` stores only the SHA-256 of the token that went out
in the link, so a database dump cannot be replayed into a confirmed account.
Redemption is a `findOneAndDelete`, which makes it single-use even if the link
is clicked twice at once.

### Enquiries

`enquiries` — a contact-form submission and the head of its thread.

```js
{
  _id: ObjectId,
  ref: 42,                       // PUBLIC id: rendered as "Ref #0042"
  name, email, company, service, message,
  userId: ObjectId | null,       // owner; null for guest submissions
  adminLastReadAt:  Date | null,
  clientLastReadAt: Date | null,
  lastClientMessageAt: Date,     // denormalised
  lastAdminMessageAt:  Date | null,
  createdAt: Date,
}
```

Two things to know:

- **`ref`, not `_id`, is the id the app passes around.** The portal and the
  admin inbox render `Ref #0042`, so it has to stay a short incrementing
  number. It comes from the `counters` collection via `nextSequence`, which uses
  an atomic `$inc` — two submissions in the same millisecond cannot collide.
- **`lastClientMessageAt` / `lastAdminMessageAt` are maintained on write**
  (`addThreadMessage`), never recomputed. That makes the unread test a field
  comparison — shared by the list query, the unread count and the in-memory row
  flag — rather than a scan of the thread on every list, count and filter. `lastClientMessageAt` is seeded to `createdAt`
  because the opening message is the first thing the client said.

`enquiry_messages` — the replies, keyed by the enquiry's public `ref`:

```js
{ _id: ObjectId, enquiryRef: 42, sender: "admin"|"client",
  senderUserId: ObjectId | null, body: "…", createdAt: Date }
```

**Ownership.** Portal reads and writes match on `userId` only. Matching by email
happens in exactly one place — `claimVerifiedGuestEnquiries`, called from the
`signIn` event for the confirmation-link and Google paths, both of which have
just proved the address. Never add an email fallback to a portal read: an
unproved address is not an ownership boundary.

### Calculator rates

| Collection | `_id` | Holds |
| --- | --- | --- |
| `tax_rates` | year (`2026`) | Full `YearRates` for the income tax calculator |
| `calculator_settings` | slug (`"cgt"`, `"vat"`, …) | One config per editable calculator |
| `cgt_settings` | `1` | CGT's singleton config |
| `cgt_multipliers` | year key (`"2002"`) | Indexation multipliers |
| `mortgage_products` | ObjectId | Lender products |
| `mortgage_settings` | `1` | Central Bank policy + the "rates as of" label |

Configs are stored as **subdocuments, not JSON strings**, so they come back
already parsed and stay queryable. One deliberate restriction: BSON can hold
`Infinity`, but the open-ended upper bounds in `tax_rates` are written as `null`
(`yearRatesToJson`) and converted back on read, so an exported config stays
portable JSON.

Every calculator falls back to its versioned code default when its document is
missing, invalid, or unreadable, so **an empty database renders today's correct
numbers**. `mortgage_products` is the one exception that is seeded: the admin
editor can only edit rows that exist.

`calculator_settings.config` may be `null` — that means an admin marked the
calculator reviewed without overriding anything, and the code default stays
authoritative.

### Operational

| Collection | `_id` | Notes |
| --- | --- | --- |
| `rate_audit` | ObjectId | Best-effort history of admin rate changes |
| `request_rate_limits` | `{action, keyHash, windowStart}` | Fixed-window throttles |
| `toolkit_requests` | ObjectId | Founders Hub "request a copy" submissions |
| `counters` | name (`"enquiries"`) | Sequence source for public ids |

`request_rate_limits` keys the whole window triple into `_id`, so one
`findOneAndUpdate` with `$inc` + `upsert` is atomic and concurrent requests in
a window increment the same document rather than racing. Only SHA-256
identifiers are stored; raw IPs and email addresses never are. A TTL index on
`windowStart` reaps old windows, so nothing has to sweep them.

---

## Case-insensitive email lookups

Two queries have to ignore case: claiming guest enquiries, and the Founders Hub
per-address throttle. Both use a **collation** (`{ locale: "en", strength: 2 }`,
exported as `CASE_INSENSITIVE`).

The collation has to be passed on the **query** as well as on the index. A query
that omits it will not use the collated index and will match case-sensitively
instead — a silently wrong answer, not an error. Both lookups are wrapped in a
helper for that reason; keep them that way.

`users.email` needs none of this: it is stored lowercased, and Auth.js' adapter
looks accounts up by exact match.

---

## Why there is no policy layer

Every read and write goes through server code in `app/lib/`, behind a session
check. Nothing in the browser holds a database credential and no database API is
exposed to the network, so access control lives in the guards
(`lib/auth/guards.ts`) and in the queries themselves — portal reads match on
`userId`, admin routes go through `requireAdmin`. Keep it that way: the moment
any client talks to the cluster directly, this stops being true.

The Founders Hub catalogue is a code constant (`app/lib/toolkit-content.ts`) and
the site hosts no files, so there is no resource collection to secure either.
