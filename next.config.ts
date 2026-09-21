import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/* Content-Security-Policy is NOT here. It carries a per-request nonce, so it
   is built and set in proxy.ts; a static header cannot have one. Everything
   below is request-independent and stays. */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  /* A stray package-lock.json in the home directory above this one makes Next
     infer THAT as the workspace root, which is where it then traces server
     files from and where Turbopack roots the dev server. Pin both to this
     project. `process.cwd()` rather than __dirname/import.meta: next.config.ts
     is loaded as CJS or ESM depending on the runner, and next build / next dev
     always run from the project root. */
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      // The mortgage calculator moved from the Accountants Hub to the Personal
      // Hub. Permanent so the indexed URL passes its ranking to the new one;
      // the page had been live and linked from the portal, so it cannot 404.
      { source: "/tools/ireland", destination: "/personal/mortgage", permanent: true },
      /* "Crypto and Digital Assets" was retired from the service line-up (see
         RETIRED_SERVICES in app/lib/content.ts), so its routes no longer
         resolve. Send the category and every sub-service beneath it to the
         index rather than to a 404. */
      { source: "/services/crypto", destination: "/services", permanent: true },
      { source: "/services/crypto/:slug*", destination: "/services", permanent: true },
    ];
  },
};

export default nextConfig;
