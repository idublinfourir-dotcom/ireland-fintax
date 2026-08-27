import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { isAuthConfigured } from "./config";
import type { UserRole } from "../collections";

/* Route guards and the session read. SERVER ONLY.
 *
 * Every function here reads the signed session JWT locally — no database round
 * trip, no network call — so the root layout can call getSessionUser() on every
 * request without cost. The role travels in the token, stamped at sign-in from
 * the account document, which is the same trade Supabase's
 * `custom_access_token_hook` made. One consequence, unchanged from before: a
 * role edited directly in the database takes effect on that user's next
 * sign-in, not immediately. */

/** The authenticated account, as the app uses it. */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}

/** Current authenticated user, or null (also null when no backend is configured). */
export async function getUser(): Promise<AuthUser | null> {
  // No backend yet → render the site signed-out rather than throwing. The root
  // layout calls into here on every route, so a throw would 500 the whole site.
  if (!isAuthConfigured()) return null;

  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    role: user.role === "admin" ? "admin" : "client",
  };
}

export type SessionUser = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
};

/**
 * User summary for UI (the header avatar/menu). Returns null when signed out.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await getUser();
  if (!user) return null;

  return {
    email: user.email,
    name: user.name,
    avatarUrl: user.image,
    role: user.role,
  };
}

/** Require any signed-in user; otherwise redirect to login. */
export async function requireUser(next = "/portal"): Promise<AuthUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/**
 * Require a non-admin (client) user. Admins are redirected to /admin so the two
 * areas stay segregated — an admin can't browse the client portal and vice
 * versa.
 */
export async function requireClient(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/portal")}`);
  if (user.role === "admin") redirect("/admin");
  return user;
}

/**
 * Require an admin. Non-admins are sent to /portal (not 404) to avoid leaking
 * the existence of the admin area.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/admin")}`);
  if (user.role !== "admin") redirect("/portal");
  return user;
}
