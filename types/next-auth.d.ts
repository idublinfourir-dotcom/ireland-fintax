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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "client";
  }
}

declare module "@auth/core/adapters" {
  /** Extra columns the adapter carries through untouched on create/read. */
  interface AdapterUser {
    role: "admin" | "client";
    passwordHash: string | null;
    createdAt: Date;
  }
}

export {};
