"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  localeHref,
  splitLocale,
  type Locale,
  type Translations,
} from "../lib/i18n";

/* The page's locale for client components. Set once in the root layout; that
   is safe because every navigation into another language is a full load (see
   LocaleLink), so the value never goes stale. */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** This component's copy in the page's language.
    ponytail: every language of a client component's copy ships in its bundle
    (a few KB each); load per locale if that ever shows up in a profile. */
export function useT<T>(messages: Translations<T>): T {
  return messages[useLocale()];
}

/**
 * The site's link: prefixed when the target is translated, and a plain <a>
 * when it lands in another language. A client-side navigation never
 * re-renders the root layout, so following a <Link> from /ga to an English
 * page would leave the header, footer and <html lang> in Irish.
 * `locale` defaults to the page's.
 */
export function LocaleLink({
  locale,
  href,
  ...props
}: ComponentProps<"a"> & { locale?: Locale; href: string }) {
  const current = useLocale();
  const from = locale ?? current;
  const to = href.startsWith("/") ? localeHref(from, href) : href;
  if (!href.startsWith("/") || splitLocale(to).locale !== from) {
    return <a href={to} {...props} />;
  }
  return <Link href={to} {...props} />;
}

export default LocaleLink;
