import type { MetadataRoute } from "next";
import { site } from "./lib/content";
import { listPublishedSlugs } from "./lib/posts";

/* Rendered per request, not at build time: it lists published posts, so a
   build-time copy would miss every post published after the deploy, and the
   build would need the database to succeed. */
export const dynamic = "force-dynamic";

// No /services pages: the section is hidden (see next.config.ts redirects).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    "",
    "/blog",
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

  // Published posts only, read through publishedFilter. An unreachable
  // database yields none, so the sitemap still serves the static pages.
  const posts = (await listPublishedSlugs()).map(({ slug, updatedAt }) => ({
    url: `${site.url}/blog/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
