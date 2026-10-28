"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { analyticsUrl } from "../lib/analytics-url";

/* Vercel Web Analytics: page views only, no cookies (see /privacy). Every
   event passes through analyticsUrl first, which drops query strings and
   skips the admin, auth, API and member areas. Sends nothing in development
   or anywhere off Vercel. A client component because beforeSend is a
   function, which a server component cannot pass down. */

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = analyticsUrl(event.url, window.location.origin);
  return url ? { ...event, url } : null;
}

export function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
