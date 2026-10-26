/* The new display name from an Auth.js update() call, which hands its payload
   to the jwt callback unchanged. The settings page sends { user: { name } }.
   Pure, so proxy.ts (edge) can import it through auth.config.ts. */
export function nameFromUpdate(session: unknown): string | undefined {
  const name = (session as { user?: { name?: unknown } } | null)?.user?.name;
  return typeof name === "string" ? name : undefined;
}
