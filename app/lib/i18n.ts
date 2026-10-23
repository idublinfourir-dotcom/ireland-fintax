/* Languages the site is offered in, and the URL rules that go with them.
 *
 * English lives at the bare URLs (/, /tools/...) and every other language
 * under its own prefix (/ga, /es, /pt, /ar), which is what Google asks for: one
 * crawlable URL per language, never a cookie or Accept-Language switch.
 * proxy.ts strips the prefix, rewrites to the same route and passes the
 * locale on in LOCALE_HEADER; nothing under app/ moves.
 * ponytail: header + rewrite, not app/[lang]/ + next/root-params. Fine while
 * every page renders per request (the root layout reads the session); move to
 * the folder layout if pages ever need static rendering per locale.
 *
 * Pure: proxy.ts (edge) and the unit tests import it. */

export const LOCALES = ["en", "ga", "es", "pt", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/* The languages a production build serves. The others stay in the code and
   the tests, and dev serves them all so they can be reviewed; in production
   their URLs redirect to the English page and they drop out of the switcher,
   hreflang and sitemap. Add a language here to launch it. */
const PRODUCTION_LOCALES: readonly Locale[] = ["en", "ga", "es", "pt"];
export const LIVE_LOCALES: readonly Locale[] =
  process.env.NODE_ENV === "production" ? PRODUCTION_LOCALES : LOCALES;

export function isLive(locale: Locale): boolean {
  return LIVE_LOCALES.includes(locale);
}

/** Languages written right to left: the root layout sets <html dir="rtl">. */
export const RTL_LOCALES: readonly Locale[] = ["ar"];

/** Request headers proxy.ts sets; read back on the server (lib/messages). */
export const LOCALE_HEADER = "x-locale";
/** The page's path without its language prefix, for the hreflang tags. */
export const PATH_HEADER = "x-locale-path";

/** Each language's name in that language, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ga: "Gaeilge",
  es: "Español",
  pt: "Português",
  ar: "العربية",
};

/* Pages that exist in every language: an exact path, or everything below it
   for an entry ending in "/*" (not the parent itself). Anything else under a
   prefix redirects to the English page, except CHROME_ONLY_PATHS below.
   English only, on purpose: /admin, and the API and auth routes. */
export const TRANSLATED_PATHS = [
  "/",
  "/about",
  "/contact",
  "/toolkits",
  "/toolkits/*",
  "/tools/*",
  "/personal/*",
  "/budget/*",
  "/login",
  "/signup",
  "/forgot-password",
  "/portal",
  "/portal/*",
];

/* Pages whose body stays English but which are still served under a prefix,
   so the header, footer and calls to action stay in the reader's language
   instead of the whole site flipping to English: the blog (posts are written
   in English). Google warns against a translated nav over an untranslated
   body, so these get no hreflang and a canonical pointing at the English URL,
   which keeps the English page the only one indexed. */
export const CHROME_ONLY_PATHS = ["/blog", "/blog/*"];

const matches = (list: string[], path: string) =>
  list.some((p) => (p.endsWith("/*") ? path.startsWith(p.slice(0, -1)) : path === p));

/** A page with a body in every language (hreflang, sitemap alternates). */
export function isTranslated(path: string): boolean {
  return matches(TRANSLATED_PATHS, path);
}

/** A page served under a language prefix: translated, or chrome-only. */
export function hasLocaleRoute(path: string): boolean {
  return isTranslated(path) || matches(CHROME_ONLY_PATHS, path);
}

/** One piece of copy in every language; `en` is the shape the rest follow. */
export type Translations<T> = Record<Locale, T>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** "/ga/x" → { locale: "ga", path: "/x" }; "/x" → { locale: "en", path: "/x" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first = "", ...rest] = pathname.split("/");
  if (isLocale(first)) return { locale: first, path: `/${rest.join("/")}` };
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/** The href for `href` in `locale`: prefixed only if that page has a route in that language. */
export function localeHref(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  if (!hasLocaleRoute(path)) return href;
  const tail = cut === -1 ? "" : href.slice(cut);
  return path === "/" ? `/${locale}${tail}` : `/${locale}${path}${tail}`;
}

/** Where the language switcher sends `path` in `locale`: the same page, or
    that language's home page when the page is English only (/admin, ...). */
export function switchHref(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE || hasLocaleRoute(path)) return localeHref(locale, path);
  return localeHref(locale, "/");
}

/* Formatting and plurals, on the Intl APIs i18next itself builds on.
   Irish and English follow Ireland's conventions (€85,000.50), Spanish
   Spain's (85.000,50 €), Portuguese Brazil's (€ 85.000,50), Arabic with
   Western digits (€ 85,000.50), as euro amounts are written in Ireland,
   rather than the Arabic-Indic ones some browsers default to. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-IE",
  ga: "ga-IE",
  es: "es-ES",
  pt: "pt-BR",
  ar: "ar-u-nu-latn",
};

/** Intl.NumberFormat for `locale`; pass the same options as before. */
export function numberFormat(locale: Locale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(INTL_LOCALE[locale], options);
}

/** Forms by plural category. Arabic uses all six, Irish five; English only one/other. */
export type PluralForms = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;

/**
 * The form for `n` in `locale`, with "{n}" replaced by the formatted number:
 * plural("ga", 3, { one: "{n} bhliain", two: "{n} bhliain", few: "{n} bliana",
 * many: "{n} mbliana", other: "{n} bliain" }) → "3 bliana".
 */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  const rule = new Intl.PluralRules(INTL_LOCALE[locale]).select(n);
  return (forms[rule] ?? forms.other).replace("{n}", numberFormat(locale).format(n));
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * A date written in English in the rate data ("July 2026", "1 January
 * 2025") in `locale`'s words. Anything else comes back unchanged, so a
 * free-text date an admin typed never turns into a wrong one.
 */
export function localDate(locale: Locale, text: string): string {
  if (locale === "en") return text;
  const m = /^(?:(\d{1,2}) )?([A-Z][a-z]+) (\d{4})$/.exec(text.trim());
  const month = m ? MONTHS.indexOf(m[2]) : -1;
  if (!m || month < 0) return text;
  const date = new Date(Date.UTC(Number(m[3]), month, m[1] ? Number(m[1]) : 1));
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    ...(m[1] ? { day: "numeric" } : {}),
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** A rate in `locale`'s style: 13.5% (en, ga), 13,5 % (es), 13,5% (pt). */
export function percent(locale: Locale, n: number): string {
  return numberFormat(locale, { style: "percent", maximumFractionDigits: 4 }).format(n / 100);
}
