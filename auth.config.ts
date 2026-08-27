import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isGoogleEnabled } from "./app/lib/auth/config";

/* Edge-safe half of the Auth.js configuration.
 *
 * `proxy.ts` (Next 16 middleware) runs on the edge runtime, where the MongoDB
 * driver and bcrypt cannot be bundled. So the config is split: everything the
 * middleware needs to VERIFY a session lives here, and everything needed to
 * ISSUE one — the adapter and the Credentials provider — lives in ./auth.ts,
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

  // The app is deployed behind its own host rather than on Vercel, where the
  // host would be inferred. Set AUTH_URL in production to pin the callback
  // origin rather than relying on the forwarded host header.
  trustHost: true,

  providers: isGoogleEnabled()
    ? [
        Google({
          // Client id/secret are read from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
          //
          // Links a Google login to an existing account with the same address
          // instead of failing with OAuthAccountNotLinked. "Dangerous" only
          // when the provider does not verify addresses — Google does, so
          // signing in with Google reaches the account you already registered
          // rather than dead-ending on a duplicate.
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [],

  callbacks: {
    /**
     * Runs on every request that touches the session, including in middleware.
     * `user` is present only on the sign-in that mints the token, so the DB is
     * read exactly once per session and the role rides along in the JWT
     * afterwards.
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
      if (trigger === "update" && session && typeof session === "object") {
        const name = (session as { name?: unknown }).name;
        if (typeof name === "string") token.name = name;
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
