/* Is a Supabase backend wired up at all?

   The project ships with a blank `.env.local` until a backend is provisioned,
   and `createServerClient` throws when handed an empty URL/key. Because the
   root layout reads the session on EVERY route, that throw would take the whole
   site down — marketing pages and calculators included, even though they need
   no backend.

   So every entry point that touches Supabase checks this first and degrades to
   a signed-out site instead of crashing. Safe in the browser too: the
   NEXT_PUBLIC_* vars are inlined at build time.

   Delete nothing here once a backend exists — the guard simply stops firing. */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Shown to the user when an auth action is attempted with no backend. */
export const SUPABASE_NOT_CONFIGURED =
  "Accounts are unavailable right now — this site has no authentication backend configured yet.";
