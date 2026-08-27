/* Auth configuration facts, derived from env only.
 *
 * Deliberately free of database and `next-auth` imports: the edge middleware
 * config imports this, and anything it pulls in has to be edge-safe. */

import { isDbConfigured } from "../db-config";

/**
 * Is there an authentication backend at all?
 *
 * Needs both a database to hold the accounts and a secret to sign the session
 * JWT with. Without either, every auth entry point degrades to a signed-out
 * site rather than throwing — the root layout reads the session on every
 * route, so a throw there would take the marketing pages down too.
 */
export function isAuthConfigured(): boolean {
  return isDbConfigured() && Boolean(process.env.AUTH_SECRET?.trim());
}

/** Shown to the user when an auth action is attempted with no backend. */
export const AUTH_NOT_CONFIGURED =
  "Accounts are unavailable right now — this site has no authentication backend configured yet.";

/**
 * Is "Continue with Google" available? Auth.js talks to Google directly, so
 * this needs the OAuth client credentials in this app's own env — under
 * Supabase they lived in the Supabase dashboard instead.
 *
 * The sign-in pages read this server-side and hide the button when it is
 * false, rather than rendering a button that can only fail.
 */
export function isGoogleEnabled(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}

/**
 * THE ADMIN ALLOW-LIST. `ADMIN_EMAILS` is a comma-separated list of addresses;
 * anyone signing up with one of them gets `role: "admin"`, everyone else gets
 * `client`. This replaces the `handle_new_user` Postgres trigger and is the
 * single source of truth for the role, on every sign-in path — password or
 * Google.
 *
 * A role is only ever assigned at account creation, and nothing in the app
 * writes `role` afterwards, so a client cannot self-promote. To change an
 * existing account, update the document directly (see db/schema.md).
 */
export function roleForEmail(email: string): "admin" | "client" {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return "client";

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(normalised) ? "admin" : "client";
}
