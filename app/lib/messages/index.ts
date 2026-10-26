import { headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_HEADER,
  LIVE_LOCALES,
  PATH_HEADER,
  isLocale,
  isTranslated,
  localeHref,
  type Locale,
  type Translations,
} from "../i18n";
import { ar } from "./ar";
import { bn } from "./bn";
import { en, type Messages } from "./en";
import { es } from "./es";
import { ga } from "./ga";
import { hi } from "./hi";
import { pt } from "./pt";

const MESSAGES: Record<Locale, Messages> = { en, ga, es, pt, ar, bn, hi };

/** The request's locale, as proxy.ts set it. Server only. */
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER) ?? "";
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The request's locale and its copy. */
export async function getMessages(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getLocale();
  return { locale, t: MESSAGES[locale] };
}

/** A page's or component's copy in the request's language. Server only. */
export async function getT<T>(messages: Translations<T>): Promise<T> {
  return messages[await getLocale()];
}

/** `path` in the request's language, for redirect(). Server only. */
export async function localePath(path: string): Promise<string> {
  return localeHref(await getLocale(), path);
}

/**
 * The hreflang alternates for this request's page: every language's URL and
 * this one as canonical. Empty for a page that exists in English only. The
 * root layout adds them to every page, so no page has to.
 */
export async function languageAlternates(): Promise<{
  canonical?: string;
  languages?: Record<string, string>;
}> {
  const h = await headers();
  const path = h.get(PATH_HEADER) ?? "";
  if (!path || !isTranslated(path)) return {};
  const locale = await getLocale();
  return {
    canonical: localeHref(locale, path),
    languages: {
      ...Object.fromEntries(LIVE_LOCALES.map((l) => [l, localeHref(l, path)])),
      "x-default": path,
    },
  };
}
