import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { claimVerifiedGuestEnquiries } from "../../lib/enquiry-ownership";

/**
 * Email-confirmation landing route. Supabase links here with a `token_hash`;
 * we verify it, which sets the session cookie, then forward the user on.
 * Requires the Supabase email template to point at {{ .TokenHash }}.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/portal";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/portal";

  // No backend: no token could have been issued, so there is nothing to verify.
  if (!isSupabaseConfigured()) {
    console.error("[auth] confirm: no Supabase backend configured");
    return NextResponse.redirect(`${origin}/login?notice=confirm`);
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await claimVerifiedGuestEnquiries(user.id, user.email);
        } catch (claimError) {
          console.error(
            "[auth] could not claim verified guest enquiries:",
            claimError,
          );
        }
      }
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?notice=confirm`);
}
