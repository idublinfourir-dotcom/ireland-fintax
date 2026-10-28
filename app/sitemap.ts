import type { MetadataRoute } from "next";
import { site } from "./lib/content";
import { BUDGETS } from "./lib/budgets";
import { listPublishedSlugs } from "./lib/posts";
import { LIVE_LOCALES, isTranslated, localeHref } from "./lib/i18n";

/* Rendered per request, not at build time: it lists published posts, so a
   build-time copy would miss every post published after the deploy, and the
   build would need the database to succeed. */
export const dynamic = "force-dynamic";

// No /services pages: the section is hidden (see next.config.ts redirects).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* Each page once per language it exists in, each entry listing the others
     (the sitemap form of hreflang). The blog is English only. */
  const pages: MetadataRoute.Sitemap = [
    "/",
    "/blog",
    ...BUDGETS.map((b) => b.href),
    "/personal/mortgage",
    "/personal/investment",
    "/investment-account",
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
    "/privacy",
  ].flatMap((path) => {
    /* No lastModified: these pages have no stored edit date, and stamping
       "now" on every request taught search engines to ignore the field.
       Posts below carry their real updatedAt. */
    const base = { changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.8 };
    if (!isTranslated(path)) return [{ ...base, url: `${site.url}${path}` }];
    const languages = Object.fromEntries(LIVE_LOCALES.map((l) => [l, `${site.url}${localeHref(l, path)}`]));
    return LIVE_LOCALES.map((l) => ({ ...base, url: languages[l], alternates: { languages } }));
  });

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
