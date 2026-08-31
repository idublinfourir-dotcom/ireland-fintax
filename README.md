# Ireland Fintax

Marketing site, client portal and admin console for a partner-led Irish
finance and tax practice. Next.js 16 (App Router), React 19, TypeScript,
Tailwind v4, **MongoDB** and **Auth.js v5**.

Working rules for the codebase live in [`AGENTS.md`](./AGENTS.md). The database
shapes and the reasoning behind them live in [`db/schema.md`](./db/schema.md).

---

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill it in — see below
node scripts/db-indexes.mjs    # create the indexes (the migration step)
node scripts/db-seed.mjs       # seed the mortgage products + policy
npm run dev                    # http://localhost:3000
```

### Environment

Every key is documented inline in [`.env.example`](./.env.example). The ones
that must be set before anything works:

| Key | What it is |
| --- | --- |
| `MONGODB_URI` **or** `DB_USER`+`DB_PASSWORD`+`DB_CLUSTER` | Connection. `DB_CLUSTER` is the host only — `cluster0.abcde.mongodb.net`, no scheme. |
| `MONGODB_DB` | Database name inside the cluster. Defaults to `aibn`. |
| `AUTH_SECRET` | Signs the session JWT. `openssl rand -base64 32`. Changing it signs everyone out. |
| `ADMIN_EMAILS` | Comma-separated allow-list. Signing up with one of these gets the admin role. |
| `AUTH_URL` | Canonical origin. **Production only** — pins the OAuth callback and the emailed confirmation links so they don't depend on a forwarded host header. |

Optional, but each gates a feature:

- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — with these unset, "Continue with
  Google" is not rendered at all. The authorized redirect URI in the Google
  Cloud console is **this app's own** callback, one entry per host:
  `http://localhost:3000/api/auth/callback/google` and the production
  equivalent.
- `EmailJs_*` + `ENQUIRY_TO_EMAIL` — three templates, each optional and each
  written for a different reader: `EmailJs_Template_KEY` (+ `ENQUIRY_TO_EMAIL`)
  notifies the firm of an enquiry, `EmailJs_AutoReply_Template_KEY`
  acknowledges it to the person who sent it, and `EmailJs_Verify_Template_KEY`
  carries the signup confirmation link. Every one needs `{{to_email}}` in the
  template's "To email" field or EmailJS rejects the send with a 422; the verify
  template also needs `{{verify_url}}`. With the verify template unset, email
  signup is refused up front rather than creating an account nobody can confirm.

**An empty database is fine.** Every calculator falls back to a versioned code
default, so the marketing site and all eight tax tools render correct numbers
before anything is seeded. With no connection string at all the site still
serves — it just renders signed-out. Only the mortgage comparison is seeded,
because its admin editor can only edit rows that exist.

### Commands

```bash
npm run dev            # dev server
npm run build          # production build
npm start              # serve the build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm test               # unit tests (pure calculator + validation logic)

node scripts/db-check.mjs     # connectivity + per-collection document counts
node scripts/db-indexes.mjs   # create every index; re-runnable
node scripts/db-seed.mjs      # seed reference data; skips non-empty collections
```

### Making the first admin

`ADMIN_EMAILS` is applied **at account creation only**. Set it before signing
up. To promote an account that already exists:

```js
db.users.updateOne({ email: "someone@example.ie" }, { $set: { role: "admin" } })
```

The role travels in the session JWT, so it takes effect on that user's next
sign-in, not immediately.

---

## Architecture in one page

```
app/
  page.tsx, about/, contact/, services/, toolkits/           # public
  tools/                        # Accountants Hub — Ireland tax calculators
  personal/                     # Personal Hub — mortgage, investment
  login/, signup/, auth/{confirm,callback}/                  # auth entry points
  portal/                                                    # client area
  admin/                                                     # admin console
  api/auth/[...nextauth]/                                    # Auth.js handler
  lib/mongodb.ts, lib/collections.ts                         # data access
  lib/auth/                                                  # guards, roles, passwords, tokens
auth.ts, auth.config.ts                                      # Auth.js (split, see below)
proxy.ts                                                     # middleware: gates /portal, /admin
db/schema.md                                                 # collections + indexes
scripts/db-*.mjs                                             # check · indexes · seed
```

**The Auth.js config is split in two on purpose.** `auth.config.ts` is
edge-safe and is all the middleware imports; `auth.ts` adds the MongoDB adapter
and the password providers and only ever loads in the Node runtime. Importing
`auth.ts` from `proxy.ts` pulls the driver onto the edge and breaks the build.

**Sessions are JWTs, not database rows.** That is not a preference — the
Credentials provider only works with the JWT strategy. It also means the
header's session read costs no network call, which is why the root layout can
do it on every route.

**All data access goes through `app/lib/collections.ts`**, which names every
collection and types every document. There is no client-side database access
and no public database API.

---

## Parked work and pending setup

Things that are built but not finished, so they are not lost.

### 1. Founders Hub "Request a copy" — how it works

Requesting a resource is a **manual fulfilment** flow. Nothing is emailed
automatically, and there is no email provider wired into the app.

1. A visitor clicks "Request a copy" on `/toolkits` and lands on
   `/toolkits/request/[slug]`.
2. They submit name, phone, organisation email and what they need it for. The
   request is stored in `toolkit_requests` and they see a confirmation dialog.
3. A team member opens `/admin/toolkits`, reads the request, emails the file
   from their own mailbox, and clicks **Mark sent**.

Outstanding requests sort to the top and the heading shows a "to send" count.
Mark sent shows a spinner and then a confirmation, so the click is never
silent. Abuse is bounded by a five-per-hour limit per email address.

**There is no upload path, deliberately.** The site never hosts a Founders Hub
file: no upload form, no storage bucket, no public download link. The catalogue
on `/toolkits` is `app/lib/toolkit-content.ts` and every copy goes out by hand.
Two earlier versions were removed — automated email (Resend, signed links) and
admin file upload (object storage) — so do not add either back without agreeing
it first. The `toolkit_resources` table was already read and written by nothing
and was not carried over to MongoDB.

### 2. Founders Hub documents — 4 of 27 drafted, not in the repo

Four Irish tax memos were drafted from Revenue, gov.ie, DSP and CRO sources and
fact-checked figure by figure (three critical errors were found and corrected).
The generated PDFs are **not kept in this repo** — they live wherever the team
keeps them and get attached to an email by hand.

Still to produce: 11 templates, 4 tax forms, 3 VAT forms and 5 setup guides.
Every card on `/toolkits` comes from `app/lib/toolkit-content.ts`; adding a
resource means adding an entry there.

Any of these documents needs partner review before it goes to a client: they
carry the firm's name and were not written by a person.
