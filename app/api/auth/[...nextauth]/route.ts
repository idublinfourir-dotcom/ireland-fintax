/* Auth.js request handler: sign-in, the OAuth callback, sign-out, CSRF.

   Google's authorized redirect URI is now this app's own
   `<origin>/api/auth/callback/google` — under Supabase it pointed at
   `https://<ref>.supabase.co/auth/v1/callback` instead, so the entry in the
   Google Cloud console has to be updated when this ships. */

import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
