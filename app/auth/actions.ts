"use server";

import { redirect } from "next/navigation";
import { signOut } from "../../auth";
import { isAuthConfigured } from "../lib/auth/config";

/** Sign the current user out and return them to the homepage. */
export async function signOutAction() {
  // With no backend there is no session to clear — just go home.
  if (isAuthConfigured()) {
    // `redirect: false` so the redirect below is the only one; Auth.js still
    // clears the session cookie server-side either way.
    await signOut({ redirect: false });
  }
  redirect("/");
}
