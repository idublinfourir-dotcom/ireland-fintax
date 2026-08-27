import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";

import authConfig from "./auth.config";
import { getMongoClient, MONGODB_DB } from "./app/lib/mongodb";
import { toObjectId, usersCollection, type UserDoc } from "./app/lib/collections";
import { verifyPassword } from "./app/lib/auth/password";
import { roleForEmail } from "./app/lib/auth/config";
import { consumeVerificationToken } from "./app/lib/auth/tokens";
import { claimVerifiedGuestEnquiries } from "./app/lib/enquiry-ownership";

/* Node-runtime half of the Auth.js configuration: the database adapter and the
 * email + password provider. Never import this from `proxy.ts` — see the note
 * at the top of ./auth.config.ts.
 *
 * The adapter's default collection names are already the ones this app uses
 * (`users`, `accounts`, `sessions`), so only the database name is passed. The
 * client is handed over as a thunk so nothing connects at import time. */

function mongoAdapter(): Adapter {
  const base = MongoDBAdapter(() => getMongoClient(), {
    databaseName: MONGODB_DB,
  });

  return {
    ...base,
    /**
     * The adapter creates the account on a first Google sign-in and knows
     * nothing about our extra fields, so they are stamped here — at creation,
     * once. `role` in particular must never be assignable later: nothing else
     * in the app writes it, so a client cannot promote themselves.
     *
     * The adapter copies unknown keys through verbatim in both directions, so
     * they also arrive in the `user` the jwt callback sees.
     */
    async createUser(user: AdapterUser) {
      const email = user.email.toLowerCase();
      return base.createUser!({
        ...user,
        email,
        role: roleForEmail(email),
        passwordHash: null,
        createdAt: new Date(),
      });
    },
  };
}

/** The session shape the two credentials providers hand to the jwt callback. */
function sessionUserFrom(user: UserDoc) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  };
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
  // Re-stamps the session JWT in place. Used by the settings page after a
  // rename so the header updates without making the user sign in again.
  unstable_update: updateSession,
} = NextAuth({
  ...authConfig,
  adapter: mongoAdapter(),

  events: {
    /**
     * Link guest enquiries to the account that has just proved the address.
     *
     * Restricted to the two paths where ownership of the address was actually
     * demonstrated in this request — clicking the emailed confirmation link, or
     * signing in through Google. A plain password sign-in is deliberately not
     * one of them: its enquiries were already claimed when the account was
     * confirmed, and widening this to every sign-in would make an unproved
     * address look like an ownership boundary.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google" && account?.provider !== "verify-email") {
        return;
      }
      if (!user.id || !user.email) return;

      /* Auth.js creates — and links — OAuth accounts with `emailVerified:
         null`; it only stamps that field for its own Email provider. Google
         does verify addresses, which is the whole justification for
         allowDangerousEmailAccountLinking, so the proof is recorded here.
         Without it two things break: a password set later on the settings page
         can never be used to sign in (`authorize` below refuses an unverified
         account), and the signup form mistakes a live Google account for an
         abandoned registration and overwrites its name and password hash.
         `emailVerified: null` in the filter makes this a one-time stamp. */
      if (account.provider === "google") {
        try {
          const id = toObjectId(user.id);
          if (id) {
            const users = await usersCollection();
            await users.updateOne(
              { _id: id, emailVerified: null },
              { $set: { emailVerified: new Date() } },
            );
          }
        } catch (err) {
          console.error("[auth] could not mark the Google address verified:", err);
        }
      }

      try {
        await claimVerifiedGuestEnquiries(user.id, user.email);
      } catch (err) {
        console.error("[auth] could not claim verified guest enquiries:", err);
      }
    },
  },

  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * Returns the user on success and null on every failure — a wrong
       * password, an unknown address and an unconfirmed address are all
       * indistinguishable from here, so the response cannot be used to probe
       * which addresses exist. The login action re-reads the account after a
       * rejection purely to tell the user which of those it was.
       *
       * Signing in requires a confirmed address: confirmation is the boundary
       * that lets guest enquiries be claimed by email, so an unproved address
       * must never hold a session.
       */
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const users = await usersCollection();
        const user = await users.findOne({ email });
        if (!user || !user.emailVerified) return null;
        if (!(await verifyPassword(password, user.passwordHash))) return null;

        return sessionUserFrom(user);
      },
    }),

    Credentials({
      id: "verify-email",
      name: "Email confirmation",
      credentials: { token: { label: "Token", type: "text" } },

      /**
       * Redeems the token from a signup confirmation link: marks the address
       * proved and signs the user straight in. The token is single-use (see
       * consumeVerificationToken), so a replayed link lands on the same
       * failure notice as an expired one.
       */
      async authorize(credentials) {
        const token = String(credentials?.token ?? "");
        const userId = await consumeVerificationToken(token);
        if (!userId) return null;

        const users = await usersCollection();
        const user = await users.findOneAndUpdate(
          { _id: userId },
          { $set: { emailVerified: new Date() } },
          { returnDocument: "after" },
        );
        if (!user) return null;

        return sessionUserFrom(user);
      },
    }),
  ],
});
