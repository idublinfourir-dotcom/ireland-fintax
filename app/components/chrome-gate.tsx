"use client";

import { usePathname } from "next/navigation";
import { splitLocale } from "../lib/i18n";

// Routes that render their own dedicated shell (sidebar + topbar) and must NOT
// show the public site header/footer.
const SHELL_ROUTES = ["/admin", "/portal"];

/**
 * Hides the public site chrome (header/footer) on dashboard routes, which
 * render their own shells in `app/admin/layout.tsx` and `app/portal/layout.tsx`.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = splitLocale(usePathname() ?? "").path;
  if (SHELL_ROUTES.some((r) => pathname?.startsWith(r))) return null;
  return <>{children}</>;
}
