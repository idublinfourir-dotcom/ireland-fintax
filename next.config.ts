import type { NextConfig } from "next";
import { LATEST_BUDGET } from "./app/lib/budgets";
import { DEFAULT_LOCALE, LOCALES } from "./app/lib/i18n";

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
  // Says nothing an attacker needs to know about the stack.
  poweredByHeader: false,
  /* A stray package-lock.json in the home directory above this one makes Next
     infer THAT as the workspace root, which is where it then traces server
     files from and where Turbopack roots the dev server. Pin both to this
     project. `process.cwd()` rather than __dirname/import.meta: next.config.ts
     is loaded as CJS or ESM depending on the runner, and next build / next dev
     always run from the project root. */
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },

  experimental: {
    agentUpgrade: "security",
    /* Every page is dynamic (the root layout reads the session), so by default
       each client-side navigation refetches the page, even one visited a
       moment ago. Keep a visited page for 30s so going back and forth is
       instant. Server actions (sign-in, forms, admin edits) still clear this
       client cache. */
    staleTimes: { dynamic: 30 },
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      /* Next serves public/ with max-age=0, so the browser re-checks every
         file on every visit: the hero videos are 1.3 to 1.7MB each. Their
         names carry a content hash (hero-1.77020ed2.mp4), so a changed file
         is a new URL and these can be kept for a year, as Next does for its
         own hashed assets. The optimiser's copies (/_next/image) follow, as
         it takes the longer of this and images.minimumCacheTTL. Only names
         with the hash match: a plain hero-1.mp4 would fall back to max-age=0
         rather than stick for a year. */
      {
        source: "/:name(hero-\\d+\\.[0-9a-f]{8}\\.(?:jpg|mp4))",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  async redirects() {
    return [
      // The mortgage calculator moved from the Accountants Hub to the Personal
      // Hub. Permanent so the indexed URL passes its ranking to the new one;
      // the page had been live and linked from the portal, so it cannot 404.
      { source: "/tools/ireland", destination: "/personal/mortgage", permanent: true },
      // The newest Budget page (LATEST_BUDGET in app/lib/budgets.ts). Temporary,
      // so /budget can point at the next one each October without browsers
      // holding on to this year's.
      { source: "/budget", destination: LATEST_BUDGET.href, permanent: false },
      // The same for each language. Built from LOCALES: a hand-kept list
      // missed ar, bn and hi, which then fell through to the English page.
      {
        source: `/:lang(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join("|")})/budget`,
        destination: `/:lang${LATEST_BUDGET.href}`,
        permanent: false,
      },
      // Section roots have no page of their own: send them where the menu
      // label does. Temporary, so a hub page can take the URL later.
      { source: "/tools", destination: "/tools/ireland-income-tax", permanent: false },
      { source: "/personal", destination: "/personal/mortgage", permanent: false },
      {
        source: `/:lang(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join("|")})/tools`,
        destination: "/:lang/tools/ireland-income-tax",
        permanent: false,
      },
      {
        source: `/:lang(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join("|")})/personal`,
        destination: "/:lang/personal/mortgage",
        permanent: false,
      },
      /* The whole Services section is hidden site-wide: its pages are parked
         in app/_services (unrouted, like app/_pricing) and every /services URL
         goes home. Temporary on purpose, so browsers don't cache it and the
         section can come back by deleting this line and renaming the folder.
         It matches first, so the crypto lines below only apply again then. */
      { source: "/services/:path*", destination: "/", permanent: false },
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
