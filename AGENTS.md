## Ireland Fintax — Agent Instructions

Persistent rules for repo. Apply **every Agent session** automatically.
Git push/merge workflow: see `CLAUDE.md`.


## Project

Marketing site for **Ireland Fintax** — partner-led finance and tax practice (audit, tax, bookkeeping, payroll, advisory). UK copy + tone: professional, plain English, no jargon.



## Stack

- **Next.js 16** (App Router)
- **React 19**, **TypeScript**
- **Tailwind CSS v4** (`app/globals.css` with `@theme` tokens)
- **Framer Motion** (`motion` package, import from `motion/react`) — scroll reveals, count-up, accordion
- **MongoDB** (official `mongodb` driver) + **Auth.js v5** (`next-auth@beta`, `@auth/mongodb-adapter`, JWT sessions)
- **Fonts:** Fraunces (display), Geist (body) — loaded in `app/layout.tsx`

Commands: `npm run dev` · `npm run build` · `npm run lint`

---

## Structure

```
app/
  page.tsx, about/, contact/, services/   # marketing routes
  _pricing/          # hidden route — see "Hidden for now" below
  login/, signup/, portal/, admin/, auth/{confirm,callback}/  # auth routes
  components/      # UI, layout, sections + motion primitives
  api/auth/[...nextauth]/  # Auth.js handler (sign-in, OAuth callback, sign-out)
  lib/content.ts   # site config, services, pricing, copy data
  lib/images.ts    # curated Unsplash URLs (used as CSS background-image)
  lib/mongodb.ts   # lazy MongoClient singleton + getDb()
  lib/db-config.ts # connection-string env reads, driver-free (edge-safe)
  lib/collections.ts # every collection: document types + typed accessors
  lib/auth/        # config (roles, feature flags), guards, password, tokens
  lib/emailjs.ts   # shared EmailJS REST sender
  globals.css      # brand tokens, easing/animation tokens, base styles
auth.ts            # Auth.js: adapter + Credentials + Google (Node runtime only)
auth.config.ts     # edge-safe half: session strategy, callbacks, Google
proxy.ts           # (Next 16 middleware) gates /portal, /admin
db/schema.md       # collections, indexes, and why each shape is what it is
scripts/db-*.mjs   # check connectivity · create indexes · seed
```

- **Motion primitives** (client components, all reduced-motion safe):
  `reveal.tsx` (scroll fade-up), `count-up.tsx` (stats), `clip-reveal.tsx`
  (image clip), `accordion.tsx` (FAQ), `back-to-top.tsx`.

- **Pages** compose section components; keep pages thin.
- **Copy + structured data** live in `app/lib/content.ts` — edit there, don't hardcode in components.
- **Reusable UI** (`Button`, `Card`, etc.) → `app/components/ui.tsx`.
- **Page sections** (Hero, Faq, etc.) → `app/components/sections.tsx`.
- **Server actions** → colocate with route (e.g. `app/contact/actions.ts`).


## Hidden for now (since 2026-08-20)

Pricing is hidden site-wide until the fee model is decided. Nothing was
deleted — every item is a comment-out or a reversible rename, so unhiding
means undoing exactly this list. Don't re-add pricing links or fee claims
elsewhere while this stands.

| What | Where | How it was hidden |
| --- | --- | --- |
| `/pricing` route | `app/pricing/` → `app/_pricing/` | Underscore-prefixed folders are private in the App Router, so the route no longer resolves. The page, `PricingTable` and `pricingTiers`/`pricingAddons` in `app/lib/content.ts` are untouched. |
| Header nav link | `app/components/site-header.tsx` (`secondaryLinks`) | Entry removed; restore `{ href: "/pricing", label: "Pricing" }`. Covers desktop nav and mobile menu — both render the same array. |
| Footer link | `app/components/site-footer.tsx` (`firmLinks`) | Entry removed; restore `{ label: "Pricing", href: "/pricing" }`. |
| Sitemap URL | `app/sitemap.ts` | `"/pricing"` removed from `staticPages`. |
| Portal quick-link card | `app/portal/page.tsx` | "Plans & pricing" card removed. |
| Pricing FAQ | `app/components/sections.tsx` (`faqs`) | "How does your pricing work?" commented out in place. |
| Process step wording | `app/components/sections.tsx` (`steps`) | "Fixed-fee proposal" / "Clear scope, fixed monthly fee. No surprises." → "Written proposal" / "Clear scope, agreed upfront. No surprises."; original in a comment. |
| Contact next-steps bullet | `app/contact/page.tsx` (`nextSteps`) | "A fixed-fee proposal in writing" reworded to drop the fee claim; original in a comment. |

Whenever anything else gets hidden rather than deleted, add a row here.


## Conventions

- Functional React components; default exports for pages/layouts.
- Tailwind utility classes only — use brand tokens (`canvas`, `surface`, `ink`, `ink-body`, `muted`, `primary-*`, `secondary-*`, `navy-*`), not arbitrary hex in components.
- Display headings: `font-display`; body: default `font-sans`.
- Preserve accessibility: skip link, semantic HTML, focus states.
- SEO: use `metadata` exports on pages; site URL + defaults in `app/layout.tsx`.
- Minimize scope — match existing patterns; no refactor of unrelated files.
- No new dependencies unless task clearly needs them.

### Motion & imagery

- Animate with **Framer Motion** (`motion/react`) — never hand-rolled
  IntersectionObserver. Reuse primitives in `app/components/` before adding new.
- Animate `transform` / `opacity` only; custom ease-out is `ease-snappy`
  token (`cubic-bezier(0.23,1,0.32,1)`); UI ≤300ms, reveals ~600–900ms.
- Every motion respects `prefers-reduced-motion` (drop movement, keep content);
  SSR renders final/visible state for SEO + JS-off.
- **`transform` on ancestor breaks `position: sticky` on descendants** — never
  wrap sticky-aside grid in `Reveal` (or any transformed element).
- Header is **`sticky top-0` on `<header>` element itself** (not inner
  div — inner sticky child fills short parent, can't stick).
- Photos = CSS `background-image` from `lib/images.ts` over gradient scrim
  (no `next/image` remote config); verify any new Unsplash URL returns 200.

### Auth & data

- **Auth = Auth.js v5 (`next-auth@beta`) with the MongoDB adapter.** Config is
  **split in two on purpose**: `auth.config.ts` is edge-safe (session strategy,
  callbacks, Google) and is all `proxy.ts` imports; `auth.ts` adds the adapter,
  the Credentials providers and the events, and must only ever load in the Node
  runtime. Importing `auth.ts` from the middleware pulls the MongoDB driver onto
  the edge and breaks the build — don't.
- **Sessions are JWTs, not database rows.** Not optional: the Credentials
  provider only works with the JWT strategy. `getSessionUser()` therefore reads
  the session with no network call, which is what lets the root layout call it
  on every route. Guards live in `lib/auth/guards.ts` (`requireUser`,
  `requireAdmin`, `requireClient`, `getSessionUser`).
- **Roles.** `ADMIN_EMAILS` (comma-separated, case-insensitive) is the
  allow-list. Applied **once, at account creation**, on every sign-in path — password or Google — by
  `roleForEmail` in `lib/auth/config.ts`. Nothing else writes `role`, so a
  client cannot self-promote. The role rides in the JWT, so a role edited
  directly in the database takes effect on that user's next sign-in. Change an
  existing account with a `db.users.updateOne` (see `db/schema.md`).
- **Signup requires verified email ownership.** `app/signup/actions.ts` creates
  the account with `emailVerified: null` and emails a single-use token
  (`lib/auth/tokens.ts` — only its SHA-256 is stored). `/auth/confirm` redeems
  it through the `verify-email` Credentials provider, which marks the address
  proved and signs the user in. `authorize` refuses to sign in an account whose
  `emailVerified` is still null. Never relax that: confirmation is the boundary
  that lets guest enquiries be claimed by address. The action refuses up front
  when the `EmailJs_*` keys that send the link are missing
  (`isSignupEmailConfigured`) — mail is best-effort everywhere else in this app,
  but here the link is the second half of the transaction, and creating an
  account nobody can ever confirm is worse than declining.
- **Google OAuth** is Auth.js' own provider. Google's authorized redirect URI is
  **this app's** `<origin>/api/auth/callback/google`, one entry per host.
  `allowDangerousEmailAccountLinking` is on deliberately: Google verifies
  addresses, so signing in with Google reaches the account you already
  registered instead of dead-ending on a duplicate. Auth.js itself creates and links OAuth
  accounts with `emailVerified: null` — it only stamps that field for its own
  Email provider — so the `signIn` event in `auth.ts` sets it for the `google`
  provider. Don't remove that: without it a password set later on the settings
  page can never sign in, and signup mistakes a live Google account for an
  abandoned registration and overwrites its credentials. `/auth/callback` is now only a
  role-router (admins → /admin, else /portal); it does no code exchange.
  The button hides itself when `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are unset —
  the flag is read server-side and threaded down as a prop, because the browser
  cannot see server-only env.
- **Enquiry ownership uses `enquiries.userId` exclusively in the portal.**
  Matching guest enquiries by email is allowed only in
  `claimVerifiedGuestEnquiries`, called from the `signIn` **event** in `auth.ts`
  and only for the `verify-email` and `google` providers — the two paths that
  just proved the address. Never add an email fallback to portal reads/actions:
  an unproved address is not an ownership boundary.
- **`enquiries.ref`, not `_id`, is the public enquiry id.** The portal and admin
  inbox render it as `Ref #0042`, so it stays a short incrementing number from
  the `counters` collection (`nextSequence`, atomic `$inc`). Server actions
  still validate it with the `/^\d+$/` shape via `toEnquiryRef`.
- **Unread state is denormalised.** `lastClientMessageAt` / `lastAdminMessageAt`
  live on the enquiry and are written by `addThreadMessage` — always insert
  replies through it, never straight into `enquiry_messages`, or the unread
  badge drifts from the thread. `ADMIN_UNREAD_FILTER` and `isUnreadForAdmin` are
  the query and in-memory forms of the same test; keep them in step.
- **Header auth read SERVER-SIDE**: root layout calls `getSessionUser()` and
  passes `user` (email/name/avatar/role) to `<SiteHeader>`; logout is the
  **server action** in `app/auth/actions.ts`. Do **not** read the session in the
  browser for the header. `/admin` and `/portal` render own shells (sidebar +
  topbar); `ChromeGate` hides public header/footer there.
- **One data path.** Every read and write goes through `lib/collections.ts`
  (typed accessors over `lib/mongodb.ts`). There is no client-side database
  access and no public database API, so every read and write is already behind
  server code and a session check.
- **Case-insensitive email lookups need the collation on the QUERY, not just
  the index** (`CASE_INSENSITIVE` in `lib/collections.ts`). Omitting it silently
  matches case-sensitively instead of erroring. Two places rely on it: claiming
  guest enquiries, and the Founders Hub per-address throttle.
- **Schema** lives in **`db/schema.md`** (narrative) and `lib/collections.ts`
  (authoritative types). MongoDB needs no DDL, so `scripts/db-indexes.mjs` is
  the migration equivalent — run it, then `scripts/db-seed.mjs`, on a new
  cluster.
- **Secrets** live in `.env.local` locally — the full key list is in the
  committed **`.env.example`** template (values never committed):
  `MONGODB_URI` **or** `DB_USER`/`DB_PASSWORD`/`DB_CLUSTER`, `MONGODB_DB`,
  **`AUTH_SECRET`**, `AUTH_URL` (prod), `ADMIN_EMAILS`, `AUTH_GOOGLE_ID`/
  `AUTH_GOOGLE_SECRET`, `ENQUIRY_TO_EMAIL` and the `EmailJs_*` keys. Same keys
  set in the hosting provider's project env for prod. Never echo or commit them.
- **Security headers** set in `next.config.ts` (`headers()`, all routes): CSP, HSTS
  (prod), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy. CSP allows
  `'unsafe-inline'` (no nonce yet) and dev-only `'unsafe-eval'` + localhost ws.
  `connect-src` is `'self'` alone — the database is server-side only and Google
  sign-in is a top-level redirect, not a cross-origin fetch.

### Editable calculator rates (CGT, VAT, Corp Tax, R&D, Capital Allowances, CAT)

- Six calculators (`ireland-cgt`, `ireland-vat`, `ireland-corporation-tax`,
  `ireland-rd-tax-credit`, `ireland-capital-allowances`, `ireland-cat`) share one
  **DB-first-with-code-fallback** pattern so an admin updates rates after a
  Budget with no redeploy:
  - Each calculator's maths + rates live in a pure `app/lib/ireland-<x>.ts`
    (`*_CONFIG_DEFAULT` is the code fallback, `parse<X>Config` validates a
    stored blob) — no React/IO, unit-tested.
  - `app/lib/<x>-data.ts` wraps the shared `getCalculatorConfig` (from
    `app/lib/calculator-settings.ts`) to read one document per calculator from
    `calculator_settings` (`_id` = calculator slug); falls back to the code
    default on a missing document, invalid value, or DB error — never throws,
    never renders broken numbers.
  - `app/admin/<x>-rates/{page,actions,‑manager}.tsx` is a **two-phase**
    preview→confirm editor: phase 1 validates (`app/lib/<x>-guardrails.ts`) and
    returns a diff (`app/lib/rate-diff.ts`); phase 2 re-parses the previewed
    payload and writes via `saveCalculatorConfig`, then logs to `rate_audit`
    (`app/lib/rate-audit.ts`, area `<x>-settings`). `requireAdmin` re-checked on
    both phases.
  - `app/lib/editable-calculators.ts` registers each calculator (label, admin
    href, reviewed-at loader) so the admin dashboard's review-reminder + nav
    badge cover all six.
  - CGT is the one exception with extra state: it also keeps a
    `cgt_multipliers` collection (indexation multipliers) alongside
    `cgt_settings`, and its own two-collection loader.
  - Adding a **new** editable calculator = clone this file set (cheapest
    reference: `ireland-cat.ts` + `cat-data.ts` + `admin/cat-rates/*`, added
    2026-07) — do not invent a new storage shape.

### Contact email (EmailJS)

- `app/contact/actions.ts` saves the enquiry, then sends email through
  `app/lib/emailjs.ts` (the shared **EmailJS REST** sender, also used by the
  signup confirmation link), wrapped in Next's `after()` so it never blocks the
  form response (best-effort — failures logged, not surfaced). Shared keys:
  `EmailJs_Gmail_serviceid_KEY`, `EmailJs_PUBLIC_KEY`, `EmailJs_Private_KEY`.
  **Three separate templates**, each written for a different reader, each
  independently optional:
  - `EmailJs_Template_KEY` + `ENQUIRY_TO_EMAIL` — the notification to the firm.
    Either one unset skips it; the enquiry document is still written.
  - `EmailJs_AutoReply_Template_KEY` — the acknowledgement to the enquirer.
  - `EmailJs_Verify_Template_KEY` — the signup confirmation link. Unset makes
    email signup refuse up front (see the signup bullet above).

  Every template's "To email" field must be `{{to_email}}` or EmailJS returns
  422; the app always passes the recipient under that name, whoever it is. Note
  `company` means the FIRM in the acknowledgement and confirmation templates and
  the ENQUIRER'S employer in the notification template — same variable, opposite
  meanings, because each addresses a different reader. Never hardcode the
  recipient back into the source.
- Public signup and contact submissions use DB-backed fixed-window throttling
  from `app/lib/rate-limit.ts` (per IP + per normalised email). Only SHA-256
  identifiers are stored in `request_rate_limits`; never store raw IP/email
  throttle keys or replace this with per-process memory on serverless.
- **The template's "To email" field is `{{to_email}}`** — `template_params`
  MUST include `to_email` (+ `to_name`) or EmailJS returns HTTP 422 "recipients
  address is corrupted" and the notification silently never sends (the
  best-effort `after()` call only logs it). `reply_to` is the enquirer;
  `to_email` is the firm's monitored inbox. This broke once in production
  silently — if you touch `template_params`, keep `to_email` in it.
- `app/components/contact-form.tsx` is a 3-step wizard (topic → enquiry →
  details) but posts as **one native form**: every step's `<fieldset>` stays
  mounted and toggles via the `hidden` attribute, never conditional render —
  FormData only serialises mounted inputs, so unmounting a step would silently
  drop its fields from the submit. If you add a step, keep this mount-all/
  hide-inactive shape.

### Founders Hub (`/toolkits`)

- **The site never hosts a file.** No upload form, no storage bucket, no public
  download link — for memos, templates, tax/VAT forms, setup guides or anything
  else. This is a product decision, not a missing feature: do not add an upload
  path, an object store or a direct download link back.
- The catalogue **is** `app/lib/toolkit-content.ts` (a pure module, no DB).
  Adding a resource = adding an entry there. `toolkit-types.ts` holds the
  categories and the title→slug helper both the browser and the request route
  use.
- Fulfilment is manual: visitor requests on `/toolkits/request/[slug]` →
  row in `toolkit_requests` → a team member emails the file from their own
  mailbox via `/admin/toolkits` → **Mark sent**
  (`app/admin/toolkits/request-status-button.tsx`, which shows a pending
  spinner and a confirmation so the click is never silent).
- `toolkit_resources` and `toolkit_requests.resource_id` are **gone**: they were
  already read and written by nothing, and were not recreated in MongoDB.

### Testing

- E2E via **Playwright** lives in `/e2e` (gitignored, installed `--no-save` — not a
  project dependency). Run: `npx playwright test --config e2e/playwright.config.ts`
  (spins up prod server on `:3100`). Specs: `site.spec.ts` (marketing pages,
  auth gating, login/signup/logout, role routing), `calculators.spec.ts` +
  `cgt.spec.ts` (public calculators + admin rate editors), `contact-wizard.spec.ts`
  (wizard steps, FAQ hints, validation). Creates `pw-*@example.com`
  users/enquiries — clean these up in the MongoDB database after a run.

---

## Collaboration & merge conflicts

Two contributors work in parallel on personal branches (`niaz`, `nidan`) that
both merge into `main`. Two rules keep them from colliding:

**Area ownership** — route work to the owner instead of both editing one file:

| Area | Owner (branch) |
|------|----------------|
| `/admin/**` (dashboard, enquiries inbox, rate editors) | Niaz (`niaz`) |
| `/portal/**` (client dashboard, settings) | Nidan (`nidan`) |
| Shared components (`app/components/dashboard-*.tsx`), `app/lib/collections.ts`, `db/schema.md`, marketing pages | Either — pull `main` immediately before touching, keep the change additive |

If a task needs a change in the other person's area, prefer a small PR against
their branch (or a chat ping) over editing it on your own branch.

**Resolving conflicts — compose, don't pick a side.** Past incident (PRs #13/#14):
a portal conflict was resolved by taking one branch's whole file, which silently
reverted the other side's redesign to `main` and a second, duplicate fix-PR
followed. The rule since:

- A conflict between a data-layer change and a presentation change is almost
  never either/or — produce the file both authors would have written together
  (e.g. new query **under** new UI).
- Never resolve with `--ours`/`--theirs` on a file the other side rewrote for a
  different reason; diff both sides against the merge-base first and list what
  each adds.
- Appended-list conflicts (icon maps, nav arrays) are always resolved as the
  union of both sides.
- After resolving: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
  must pass before pushing, and say in the merge-commit body which side won where
  and why.

---

## When to update this file

**You do NOT need to update `AGENTS.md` before every prompt.**

| Situation | Update AGENTS.md? | What to do instead |
|-----------|-------------------|-------------------|
| Starting a new feature | **No** | Describe feature in chat prompt |
| One feature done, starting another | **No** | New prompt with next task; Agent reads codebase |
| One-off task ("fix this button") | **No** | Just ask in chat |
| Agent keeps making same mistake | **Yes** | Add rule so it stops |
| New permanent convention (e.g. all forms use X) | **Yes** | Document here |
| Architecture or stack change | **Yes** | Update relevant sections |

**Rule of thumb:** `AGENTS.md` = things true for *all* future work. Chat prompt = what you want *right now*.

---

## Skills (optional)

Repo has design skills under `.claude/skills/` (UI, banners, design system). Use when task involves visual design or new marketing assets — not required for routine code changes.
