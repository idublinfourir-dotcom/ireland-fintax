import type { MetadataRoute } from "next";
import { site } from "./lib/content";

// No /services pages: the section is hidden (see next.config.ts redirects).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/personal/mortgage",
    "/personal/investment",
    "/tools/ireland-income-tax",
    "/tools/ireland-vat",
    "/tools/ireland-corporation-tax",
    "/tools/ireland-rd-tax-credit",
    "/tools/ireland-capital-allowances",
    "/tools/ireland-cgt",
    "/tools/ireland-cat",
    "/toolkits",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
