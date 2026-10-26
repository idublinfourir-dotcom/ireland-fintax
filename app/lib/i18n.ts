/* Languages the site is offered in, and the URL rules that go with them.
 *
 * English lives at the bare URLs (/, /tools/...) and every other language
 * under its own prefix (/ga, /es, /pt, /ar, /bn, /hi), which is what Google asks for: one
 * crawlable URL per language, never a cookie or Accept-Language switch.
 * proxy.ts strips the prefix, rewrites to the same route and passes the
 * locale on in LOCALE_HEADER; nothing under app/ moves.
 * ponytail: header + rewrite, not app/[lang]/ + next/root-params. Fine while
 * every page renders per request (the root layout reads the session); move to
 * the folder layout if pages ever need static rendering per locale.
 *
 * Pure: proxy.ts (edge) and the unit tests import it. */

export const LOCALES = ["en", "ga", "es", "pt", "ar", "bn", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/* The languages a production build serves. The others stay in the code and
   the tests, and dev serves them all so they can be reviewed; in production
   their URLs redirect to the English page and they drop out of the switcher,
   hreflang and sitemap. Add a language here to launch it. */
const PRODUCTION_LOCALES: readonly Locale[] = ["en", "ga", "es", "pt", "ar"];
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
  bn: "বাংলা",
  hi: "हिन्दी",
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
   rather than the Arabic-Indic ones some browsers default to. Bangla and
   Hindi likewise keep Western digits for dates and plurals, and take their
   numbers from NUMBER_LOCALE below. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-IE",
  ga: "ga-IE",
  es: "es-ES",
  pt: "pt-BR",
  ar: "ar-u-nu-latn",
  bn: "bn-u-nu-latn",
  hi: "hi-u-nu-latn",
};

/* Bangla and Hindi group digits the Indian way (€85,00,000.50, in lakhs),
   and no locale tag turns that off. Readers in Ireland deal in €8,500,000,
   so their numbers are written as Ireland writes them. */
const NUMBER_LOCALE: Record<Locale, string> = { ...INTL_LOCALE, bn: "en-IE", hi: "en-IE" };

/** Intl.NumberFormat for `locale`; pass the same options as before. */
export function numberFormat(locale: Locale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], options);
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

/* Month names and date patterns, written out rather than asked of Intl.
   Browsers ship different locale data: Chrome has none for Irish and falls
   back to "October 13, 2026", and Safari spells Hindi अक्तूबर where Node
   writes अक्टूबर. A date formatted by Intl in a client component then
   differs between the server's HTML and the browser, React throws the page
   away and re-renders it, and Chrome readers of /ga see American English.
   These tables are Node's own output (full ICU), so the server's text is
   unchanged and every browser now produces exactly the same. {d} day,
   {M} month name, {Y} year. */
type DateWords = { long: string[]; short: string[]; dmy: string; my: string; dm: string };
const DATE_WORDS: Record<Exclude<Locale, "en">, DateWords> = {
  ga: {
    long: ["Eanáir", "Feabhra", "Márta", "Aibreán", "Bealtaine", "Meitheamh", "Iúil", "Lúnasa", "Meán Fómhair", "Deireadh Fómhair", "Samhain", "Nollaig"],
    short: ["Ean", "Feabh", "Márta", "Aib", "Beal", "Meith", "Iúil", "Lún", "MFómh", "DFómh", "Samh", "Noll"],
    dmy: "{d} {M} {Y}", my: "{M} {Y}", dm: "{d} {M}",
  },
  es: {
    long: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    short: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
    dmy: "{d} de {M} de {Y}", my: "{M} de {Y}", dm: "{d} {M}",
  },
  pt: {
    long: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
    short: ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."],
    dmy: "{d} de {M} de {Y}", my: "{M} de {Y}", dm: "{d} de {M}",
  },
  ar: {
    long: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    short: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    dmy: "{d} {M} {Y}", my: "{M} {Y}", dm: "{d} {M}",
  },
  bn: {
    long: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
    short: ["জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভেম্বর", "ডিসে"],
    dmy: "{d} {M}, {Y}", my: "{M} {Y}", dm: "{d} {M}",
  },
  hi: {
    long: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
    short: ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्टू॰", "नव॰", "दिस॰"],
    dmy: "{d} {M} {Y}", my: "{M} {Y}", dm: "{d} {M}",
  },
};
const SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fillDate = (pattern: string, d: string, month: string, y = "") =>
  pattern.replace("{d}", d).replace("{M}", month).replace("{Y}", y);

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
  const w = DATE_WORDS[locale];
  return m[1]
    ? fillDate(w.dmy, String(Number(m[1])), w.long[month], m[3])
    : fillDate(w.my, "", w.long[month], m[3]);
}

/**
 * A message timestamp, "24 Oct, 14:23", in `locale`'s words: the same text
 * on the server and in every browser. The clock is 24-hour in every
 * language, read in the runtime's own time zone as before.
 */
export function shortDateTime(locale: Locale, date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const day = locale === "en"
    ? `${dd} ${SHORT_EN[date.getMonth()]}`
    : fillDate(DATE_WORDS[locale].dm, dd, DATE_WORDS[locale].short[date.getMonth()]);
  return `${day}, ${time}`;
}

/** A rate in `locale`'s style: 13.5% (en, ga), 13,5 % (es), 13,5% (pt). */
export function percent(locale: Locale, n: number): string {
  return numberFormat(locale, { style: "percent", maximumFractionDigits: 4 }).format(n / 100);
}
