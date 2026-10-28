import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isGoogleEnabled } from "./app/lib/auth/config";
import { nameFromUpdate } from "./app/lib/auth/session-update";

/* Edge-safe half of the Auth.js configuration.
 *
 * `proxy.ts` (Next 16 middleware) runs on the edge runtime, where the MongoDB
 * driver and bcrypt cannot be bundled. So the config is split: everything the
 * middleware needs to VERIFY a session lives here, and everything needed to
 * ISSUE one (the adapter and the Credentials provider) lives in ./auth.ts,
 * which only ever loads in the Node runtime.
 *
 * Nothing in this file, or in anything it imports, may reach for the database.
 */

export default {
  // Sessions are JWTs, not database rows. This is not optional: the Credentials
  // provider only works with the JWT strategy. It also lets the role travel in
  // the token, so the header can authorise without a per-request query.
  session: { strategy: "jwt" },

  // Auth.js' own /api/auth/signin page is never shown; the app has its own.
  pages: { signIn: "/login" },

  // Trust the request's host header. Production also sets AUTH_URL, which
  // pins the callback origin; locally AUTH_URL is empty, so `next dev` and
  // `next start` (the e2e server on :3100) take the origin from the request.
  trustHost: true,

  providers: isGoogleEnabled()
    ? [
        Google({
          // Client id/secret are read from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
          //
          // Links a Google login to an existing account with the same address
          // instead of failing with OAuthAccountNotLinked. "Dangerous" only
          // when the provider does not verify addresses: Google does, so
          // signing in with Google reaches the account you already registered
          // rather than dead-ending on a duplicate.
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [],

  callbacks: {
    /**
     * Refuses a Google profile whose address Google has not verified.
     *
     * allowDangerousEmailAccountLinking above, and the `emailVerified` stamp
     * the signIn event in auth.ts applies to Google sign-ins, both rest on
     * Google having proved the address. Google says so per profile, and an
     * unverified one would otherwise be linked to whatever account already
     * holds that address. Runs before Auth.js links anything. Every other
     * provider decides for itself in its own `authorize`.
     */
    signIn({ account, profile }) {
      if (account?.provider === "google") return profile?.email_verified === true;
      return true;
    },

    /**
     * Runs on every request that touches the session, including in middleware.
     * `user` is present only on the sign-in that mints the token, so this half
     * never reads the DB and the role rides along in the JWT afterwards. The
     * Node half in auth.ts re-reads the role at most once a minute, so a role
     * changed in the database lands within that.
     */
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = "role" in user && user.role === "admin" ? "admin" : "client";
        token.name = user.name ?? null;
        token.picture = user.image ?? null;
      }

      /* The settings page renames the account. The header reads the name from
         this token, so without re-stamping it the old name would stay on
         screen until the next sign-in. `role` is deliberately NOT updatable
         this way: it is set once, at account creation. */
      if (trigger === "update") {
        const name = nameFromUpdate(session);
        if (name !== undefined) token.name = name;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "admin" ? "admin" : "client";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
