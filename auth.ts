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

/**
 * A bcrypt digest of a random string that was generated once and never kept.
 *
 * Not a secret and not a credential: no password can match it, and its only
 * job is to cost the same as a real comparison. Cost 12 so it matches
 * hashPassword; change both together or the timing it exists to hide comes
 * back.
 */
const DECOY_HASH = "$2b$12$jnTSMO7kLjuSahZj92CDtuheKwyGxaAXuuecC/yGx9StbqWBV/1y6";

/** The session shape the two credentials providers hand to the jwt callback. */
function sessionUserFrom(user: UserDoc) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    // Carried so the jwt callback can stamp the token without a second query.
    passwordChangedAt: user.passwordChangedAt?.getTime() ?? 0,
  };
}

/** How long a live session may go without re-checking that its password has
 *  not been reset from somewhere else.
 *
 *  This is a cost/latency trade, not a security constant. auth.config.ts reads
 *  the database exactly never, on purpose, and its jwt callback runs on every
 *  request that touches the session; doing a query there would undo that. So
 *  the check is layered on here in the Node half and is rate-limited to one
 *  query per session per interval. A revoked session therefore survives at
 *  most this long, which is the honest cost of JWT sessions with no
 *  server-side row to delete. */
const PASSWORD_CHECK_INTERVAL_MS = 60 * 1000;

/** The two sign-in paths report this field differently: the credentials
    providers go through `sessionUserFrom` and send a number, while the adapter
    hands Google's user straight through with the raw Date on it. Normalise
    rather than trusting either. */
function epochMs(value: number | Date | undefined): number {
  if (value instanceof Date) return value.getTime();
  return typeof value === "number" ? value : 0;
}

/**
 * Should this session be ended? Two reasons, one query.
 *
 * 1. **The account no longer exists.** Sessions here are JWTs with no
 *    server-side row, and nothing else in the session path reads the database,
 *    so without this a deleted account keeps working until its token expires
 *    (30 days by default). Deleting a user has to actually revoke their
 *    access. This also catches a token minted against a different database on
 *    the same cluster, which is easy to do locally by changing MONGODB_DB and
 *    otherwise presents as a phantom signed-in user with no account.
 * 2. **The password was reset after this token was minted.** Compared against
 *    the value the token carries from its own sign-in rather than its `iat`,
 *    which moves forward on every re-stamp and would leave a narrow race where
 *    a reset landing between a clean check and the re-stamp is never noticed.
 *    `pwdAt` never moves.
 */
async function sessionRevoked(
  userId: string,
  mintedWith: number,
): Promise<boolean> {
  // A subject that is not an account id cannot belong to a live session: both
  // sign-in paths set it from the account's own ObjectId.
  const id = toObjectId(userId);
  if (!id) return true;

  const users = await usersCollection();
  const account = await users.findOne(
    { _id: id },
    { projection: { passwordChangedAt: 1 } },
  );

  if (!account) return true;

  const changed = account.passwordChangedAt;
  return changed instanceof Date && changed.getTime() > mintedWith;
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

  callbacks: {
    ...authConfig.callbacks,

    /**
     * The edge-safe callback from auth.config.ts, plus the two things it
     * cannot do: notice that the password was reset in another browser, and
     * notice that the account behind the token is gone.
     *
     * Sessions here are JWTs, so there is no session row to delete and either
     * event would otherwise leave every existing session signed in. A reset
     * assumes the old password may be in someone else's hands, so that is
     * exactly the session that should stop working. Returning null ends it.
     *
     * Wrapped here and NOT moved into auth.config.ts: that file is imported by
     * proxy.ts and must never reach for the database, or the MongoDB driver is
     * pulled into the edge bundle and the build breaks.
     */
    async jwt(params) {
      const token = await authConfig.callbacks!.jwt!(params);
      if (!token) return token;

      /* Freshly minted this request. The account was just read to authorise
         it, so the stamp comes along in `user` and costs no second query. */
      if (params.user) {
        token.pwdAt = epochMs(params.user.passwordChangedAt);
        token.pwdCheckedAt = Date.now();
        return token;
      }

      const since = token.pwdCheckedAt ?? 0;
      if (Date.now() - since < PASSWORD_CHECK_INTERVAL_MS) return token;

      try {
        if (!token.sub || (await sessionRevoked(token.sub, token.pwdAt ?? 0))) {
          return null;
        }
      } catch (err) {
        /* Fail open, matching the rest of this file: the database being
           briefly unreachable must not sign the whole site out. The window it
           widens is bounded by the token's own expiry. Note this is the only
           branch that keeps a session it could not verify. */
        console.error("[auth] could not verify the session:", err);
      }

      token.pwdCheckedAt = Date.now();
      return token;
    },
  },

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

        /* Spend the same work whichever way this goes.
           
           Returning early for an unknown address skips bcrypt entirely and
           answers in about a millisecond, where a registered address costs
           ~250ms. That gap is a reliable oracle for which addresses have
           accounts, and it defeats the single null return this function is
           built around: the message is identical but the clock is not. A
           Google-only account leaked the same way, having no hash to check.

           So the comparison always runs, against a decoy when there is nothing
           real to compare. */
        const stored =
          user?.emailVerified && user.passwordHash ? user.passwordHash : DECOY_HASH;
        const matches = await verifyPassword(password, stored);

        if (!user || !user.emailVerified || !user.passwordHash) return null;
        if (!matches) return null;

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
