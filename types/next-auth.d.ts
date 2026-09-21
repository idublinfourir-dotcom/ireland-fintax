import type { DefaultSession } from "next-auth";

/* Module augmentation for the fields this app adds to Auth.js' own types.
 *
 * `role` is the /admin vs /portal split. It is written once, when the account
 * is created (see roleForEmail in app/lib/auth/config.ts), read into the JWT at
 * sign-in, and never written again. */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "client";
    } & DefaultSession["user"];
  }

  /** What `authorize` returns and what the adapter hands to the jwt callback. */
  interface User {
    role?: "admin" | "client";
    /** Epoch ms of the last password reset, or 0. Read once, at mint. */
    passwordChangedAt?: number;
  }
}

/* Augment `@auth/core/jwt`, NOT `next-auth/jwt`.
 *
 * The latter is a bare `export * from "@auth/core/jwt"`, so declaring an
 * interface against it creates a SECOND, unrelated JWT rather than extending
 * the one the callbacks actually receive. That failure is quiet: the real JWT
 * extends Record<string, unknown>, so the property still resolves, just as
 * `unknown` — which reads fine at an `===` but breaks the moment it is used as
 * a number. Keep these here. */
declare module "@auth/core/jwt" {
  interface JWT {
    role?: "admin" | "client";
    /* The two fields behind password-reset session revocation, both stamped in
       auth.ts. `pwdAt` is the account's passwordChangedAt as it stood when this
       token was minted, and is never rewritten afterwards: the check compares
       the live value against it, so a token cannot outrun a reset by being
       re-stamped. `pwdCheckedAt` bounds how often that costs a query. */
    pwdAt?: number;
    pwdCheckedAt?: number;
  }
}

declare module "@auth/core/adapters" {
  /** Extra columns the adapter carries through untouched on create/read. */
  interface AdapterUser {
    role: "admin" | "client";
    passwordHash: string | null;
    createdAt: Date;
    /** Set when a password reset completes. Absent on accounts that never had
        one, which is why every read of it is optional. */
    passwordChangedAt?: Date;
  }
}

export {};
