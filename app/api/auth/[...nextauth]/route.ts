/* Auth.js request handler: sign-in, the OAuth callback, sign-out, CSRF.

   Google's authorized redirect URI is this app's own
   `<origin>/api/auth/callback/google`, registered in the Google Cloud console
   — one entry per host you sign in from. */

import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
