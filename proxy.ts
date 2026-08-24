import { type NextRequest } from "next/server";
import { updateSession } from "./app/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only the authenticated areas need session refresh + gating. Marketing,
  // login and signup pages skip the proxy entirely (no per-request getUser).
  matcher: ["/portal/:path*", "/admin/:path*"],
};
