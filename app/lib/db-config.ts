/* Database configuration — deliberately free of any `mongodb` import.
 *
 * The Auth.js middleware config imports `isDbConfigured` to decide whether the
 * protected areas should redirect, and middleware runs on the edge runtime
 * where the driver cannot be bundled. Keeping these three env reads in their
 * own module means importing them never drags the driver in.
 *
 * app/lib/mongodb.ts is the counterpart that actually opens a connection. */

/** Database name — one definition so the app and the scripts agree. */
export const MONGODB_DB = process.env.MONGODB_DB?.trim() || "aibn";

/**
 * The connection string, or null when no backend is wired up yet.
 *
 * Two accepted shapes: a complete `MONGODB_URI`, or the Atlas parts
 * (`DB_USER` / `DB_PASSWORD` / `DB_CLUSTER`), which is how the credentials
 * arrive from the Atlas UI. The parts are URI-encoded because generated Atlas
 * passwords routinely contain characters that are reserved in a URI and would
 * otherwise silently truncate the credential.
 */
export function mongoUri(): string | null {
  const direct = process.env.MONGODB_URI?.trim();
  if (direct) return direct;

  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const cluster = process.env.DB_CLUSTER?.trim();
  if (!user || !password || !cluster) return null;

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${cluster}/?retryWrites=true&w=majority`;
}

/* Is a database backend wired up at all?

   The project ships with no connection string until one is provisioned, and
   the driver throws when handed an empty URI. Because the root layout reads the
   session on EVERY route, that throw would take the whole site down —
   marketing pages and calculators included, even though they need no backend.

   So every entry point that touches the database checks this first and degrades
   to a signed-out site instead of crashing. Delete nothing here once a backend
   exists — the guard simply stops firing. */
export function isDbConfigured(): boolean {
  return mongoUri() !== null;
}
