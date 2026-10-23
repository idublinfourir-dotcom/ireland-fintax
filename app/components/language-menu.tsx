"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "./locale-link";
import { LIVE_LOCALES, LOCALE_NAMES, splitLocale, switchHref, type Locale } from "../lib/i18n";

/* The language switchers: a dropdown in the header, a plain list in the
   footer. Both send you to the page you are on in the other language (or
   that language's home page, for an English-only page), read from the
   pathname on the client: the footer lives in the root layout, which a
   client navigation never re-renders, so a server-side path would go stale.
   Plain <a>: switching language swaps <html lang dir>, which lives in the
   root layout too. */

function useSwitchHref(): (l: Locale) => string {
  const path = splitLocale(usePathname()).path;
  return (l) => switchHref(l, path);
}

function Globe() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1.75 8h12.5M8 1.75c1.7 1.8 2.5 3.9 2.5 6.25S9.7 12.45 8 14.25C6.3 12.45 5.5 10.35 5.5 8S6.3 3.55 8 1.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Header: a globe and the current language's code, opening the list. */
export function LanguageMenu({ label }: { label: string }) {
  const locale = useLocale();
  const hrefFor = useSwitchHref();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="language-menu"
        aria-label={`${label}: ${LOCALE_NAMES[locale]}`}
        title={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-none border border-line px-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors duration-200 hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <Globe />
        {locale}
      </button>
      {open && (
        <ul
          id="language-menu"
          className="absolute inset-e-0 top-full z-50 mt-2 min-w-40 border border-line bg-white py-1.5 shadow-2xl shadow-navy-900/15"
        >
          {LIVE_LOCALES.map((l) => (
            <li key={l}>
              <a
                href={hrefFor(l)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                className={`flex items-center justify-between gap-4 px-4 py-2 text-sm transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-500 ${
                  l === locale ? "font-semibold text-primary-600" : "text-ink-body"
                }`}
              >
                {LOCALE_NAMES[l]}
                <span className="text-[11px] font-medium uppercase text-muted">{l}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Footer: every language as a link, the current one marked. */
export function LanguageList() {
  const locale = useLocale();
  const hrefFor = useSwitchHref();
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/70">
      {LIVE_LOCALES.map((l) => (
        <li key={l}>
          <a
            href={hrefFor(l)}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={`transition-colors duration-200 hover:text-white ${
              l === locale ? "font-semibold text-white" : ""
            }`}
          >
            {LOCALE_NAMES[l]}
          </a>
        </li>
      ))}
    </ul>
  );
}
