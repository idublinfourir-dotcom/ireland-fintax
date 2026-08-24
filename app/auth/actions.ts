"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";

/** Sign the current user out and return them to the homepage. */
export async function signOutAction() {
  // With no backend there is no session to clear — just go home.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
