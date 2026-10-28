"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LocaleLink, useT } from "./locale-link";
import { LanguageMenu } from "./language-menu";
import { calcMessages } from "../lib/messages/calc";
import { usePathname } from "next/navigation";
import { CALCULATOR_TOOLS } from "./calculator-tabs";
import { PERSONAL_TOOLS } from "./personal-tabs";
import { BUDGETS, LATEST_BUDGET } from "../lib/budgets";
import type { SessionUser } from "../lib/auth/guards";
import { splitLocale, type Locale } from "../lib/i18n";
import type { Messages } from "../lib/messages/en";

/* Pricing is hidden site-wide while the fee model is being decided; restore
   { href: "/pricing", label: "Pricing" } here to bring it back.
   Blog took the top-level slot the Services mega-menu freed, which makes the
   row full again at six links (see the note on <nav> below).
   Budget took Contact's slot (Oct 2026) as a dropdown of years (BUDGETS in
   lib/budgets.ts): the "Ask a question" button beside the links, and at the
   foot of the mobile menu, already goes to /contact, so the link was a
   duplicate. */
const secondaryHrefs = ["/investment-account", "/blog"] as const;

/* Founders Hub resource categories (t.founderResources), shown in the nav
   dropdown. Each links to the single /toolkits page (which carries its own
   category tabs). */

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Avatar({ user, size = 36 }: { user: SessionUser; size?: number }) {
  const initial = (user.name ?? user.email).trim().charAt(0).toUpperCase();
  const dim = { width: size, height: size };
  if (user.avatarUrl) {
    // Plain <img> (avatar host isn't in next/image remote config); Google's
    // CDN needs no-referrer to serve the picture.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        style={dim}
        className="rounded-full object-cover ring-1 ring-line"
      />
    );
  }
  return (
    <span
      style={dim}
      className="grid place-items-center rounded-full bg-primary-500 text-sm font-semibold text-white"
    >
      {initial || "U"}
    </span>
  );
}

function Logo({ locale, onClick }: { locale: Locale; onClick?: () => void }) {
  return (
    <LocaleLink locale={locale} href="/" className="flex items-center" onClick={onClick}>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          IRISH
        </span>
        {/* Back to the wider 0.16em: the descriptor is one short word now, so
            the nav row has the room the old four-word lockup did not. */}
        <span className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
          Fintax
        </span>
      </span>
    </LocaleLink>
  );
}

/* One desktop dropdown, in the disclosure pattern: the label is a link to
   the section and the chevron is a button that opens the panel, so keyboard
   and screen-reader users choose to open it instead of tabbing through every
   link in it. Hover still opens it for the mouse. Closed, the panel is
   visibility:hidden, which also takes its links out of the Tab order. Escape
   or moving focus out of the menu closes it. */
function NavMenu({
  locale,
  href,
  label,
  active,
  toggleLabel,
  panelClass,
  children,
}: {
  locale: Locale;
  href: string;
  label: string;
  active: boolean;
  toggleLabel: string;
  /** Position and width of the panel. */
  panelClass: string;
  children: (close: (e: React.MouseEvent<HTMLElement>) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Shut after a link is clicked, until the mouse comes back: otherwise the
  // hover keeps the panel open over the new page.
  const [suppressed, setSuppressed] = useState(false);
  const panelId = useId();
  const button = useRef<HTMLButtonElement>(null);
  function close(e: React.MouseEvent<HTMLElement>) {
    setOpen(false);
    setSuppressed(true);
    e.currentTarget.blur();
  }
  // Opened from the button it shows at once: during a fade, visibility is still
  // hidden on the first frame, and a quick Tab would skip the panel's links.
  const panelState = open
    ? "visible opacity-100 transition-none"
    : suppressed
      ? "invisible opacity-0"
      : "invisible opacity-0 group-hover:visible group-hover:opacity-100";
  return (
    <div
      className="group relative"
      onMouseEnter={() => setSuppressed(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          button.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className="flex items-center">
        <LocaleLink
          locale={locale}
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={close}
          className={`relative whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
            active ? "text-primary-600" : "text-ink-body hover:text-ink"
          }`}
        >
          {label}
          <span
            className={`pointer-events-none absolute -bottom-1.5 inset-s-0 h-0.5 w-full origin-left rtl:origin-right bg-primary-500 transition-transform duration-200 ease-snappy ${
              active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </LocaleLink>
        {/* 24px tap target (WCAG 2.5.8) that takes 16px of the row: -me-2
            borrows the rest from the gap after it. */}
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={toggleLabel}
          onClick={() => {
            setOpen((o) => !o);
            setSuppressed(false);
          }}
          className="-me-2 grid h-6 w-6 cursor-pointer place-items-center text-muted transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <Chevron
            className={`transition-transform duration-200 group-hover:rotate-180 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div
        id={panelId}
        className={`absolute top-full z-50 pt-4 transition-all duration-200 ${panelClass} ${panelState}`}
      >
        {children(close)}
      </div>
    </div>
  );
}

export function SiteHeader({
  user,
  locale,
  t,
}: {
  user: SessionUser | null;
  locale: Locale;
  t: Messages["header"];
}) {
  // A menu entry in this language, or the English one it was built from.
  const entry = <T extends { href: string; label: string; desc: string }>(e: T) =>
    t.tools[e.href] ?? e;
  const secondaryLinks = secondaryHrefs.map((h) => ({
    href: h,
    label: h === "/blog" ? t.blog : t.investmentAccount,
  }));
  const FOUNDER_RESOURCES = t.founderResources;
  const nav = useT(calcMessages);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [mobilePersonalOpen, setMobilePersonalOpen] = useState(false);
  const [mobileFoundersOpen, setMobileFoundersOpen] = useState(false);
  const [mobileBudgetOpen, setMobileBudgetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const pathname = splitLocale(usePathname()).path;
  const toolsActive = isActive(pathname, "/tools");
  const personalActive = isActive(pathname, "/personal");
  const foundersActive = isActive(pathname, "/toolkits");
  const budgetActive = isActive(pathname, "/budget");

  const firstName =
    user?.name?.trim().split(" ")[0] ??
    user?.email?.split("@")[0] ??
    t.account;

  // Auto-hide: slide the header away on scroll-down, reveal it on scroll-up.
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const goingDown = y > lastY.current;
      // ignore tiny jitter; never hide near the very top or while the menu is open
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(goingDown && y > 120 && !menuOpen);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  function closeMobile() {
    setMenuOpen(false);
    setMobileToolsOpen(false);
    setMobilePersonalOpen(false);
    setMobileFoundersOpen(false);
    setMobileBudgetOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-300 ease-snappy ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* main nav (warm paper). The navy office-details bar that sat above it
          went with the firm: this is a learning site now. */}
      <div
        className={`border-b backdrop-blur-md transition-all duration-300 ease-snappy ${
          scrolled
            ? "border-line bg-canvas/95 shadow-[0_8px_24px_-12px] shadow-navy-900/25"
            : "border-line/70 bg-canvas/85"
        }`}
      >
        {/* max-w-7xl: the nav row (logo + 6 links + sign-in + CTA) needs
            ~1235px: it stopped fitting the 6xl container when the
            Entrepreneur Toolkits link was added, and Personal Hub took most of
            what was left. Blog is the sixth link now, in the slot Services
            left; Budget 2027 replaced Contact, which duplicated the "Ask a
            question" button. The labels were renamed in Oct 2026 (Tax Calculators,
            Accounting Hub, Personal Finance, Budget Explanation, IE Investment
            Account, Insights), about as long in total as before, which is why the
            signed-in pill drops its name at xl. Another top-level link needs
            the row re-thought, not another entry. */}
        <nav
          aria-label={nav.mainNav}
          className="relative mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-5 sm:px-8"
        >
          <Logo locale={locale} onClick={closeMobile} />

          {/* xl breakpoint: with "Entrepreneur Toolkits" the full nav no longer
              fits at 1024px: below xl the hamburger menu takes over.
              gap tightened from 6 when "Personal Hub" was added: signed in, the
              avatar pill is ~120px wider than the Sign in button and the row
              was down to its last few pixels at xl. */}
          <div className="hidden items-center gap-5 xl:flex">
            {/* Tools dropdown. Left-aligned to the trigger, not centred: this
                item sits near the left edge, and a centred 52rem panel ran
                off-screen below ~1700px wide. */}
            <NavMenu
              locale={locale}
              href="/tools/ireland-income-tax"
              label={t.taxHub}
              active={toolsActive}
              toggleLabel={t.submenu.replace("{label}", t.taxHub)}
              panelClass="inset-s-0 w-[min(52rem,calc(100vw-2rem))]"
            >
              {(close) => (
                <div className="rounded-none border border-line bg-white p-6 shadow-2xl shadow-navy-900/15">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {t.calculatorsHeading}
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-3">
                    {CALCULATOR_TOOLS.map((tool) => (
                      <LocaleLink
                        locale={locale}
                        key={tool.href}
                        href={tool.href}
                        onClick={close}
                        aria-current={pathname === tool.href ? "page" : undefined}
                        className="group/item block"
                      >
                        <span className="font-display text-sm font-semibold text-ink transition-colors duration-200 group-hover/item:text-primary-500">
                          {entry(tool).label}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-muted">
                          {entry(tool).desc}
                        </span>
                      </LocaleLink>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-line pt-4">
                    <LocaleLink
                      locale={locale}
                      href="/tools/ireland-income-tax"
                      onClick={close}
                      className="text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
                    >
                      {t.openCalculators} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
                    </LocaleLink>
                  </div>
                </div>
              )}
            </NavMenu>

            {/* Founders Hub mega-menu */}
            <NavMenu
              locale={locale}
              href="/toolkits"
              label={t.accounts}
              active={foundersActive}
              toggleLabel={t.submenu.replace("{label}", t.accounts)}
              panelClass="inset-s-0 w-[min(44rem,calc(100vw-2rem))]"
            >
              {(close) => (
                <div className="rounded-none border border-line bg-white p-6 shadow-2xl shadow-navy-900/15">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {t.founderHeading}
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-3">
                    {FOUNDER_RESOURCES.map((res) => (
                      <LocaleLink
                        locale={locale}
                        key={res.label}
                        href="/toolkits"
                        onClick={close}
                        className="group/item block"
                      >
                        <span className="font-display text-sm font-semibold text-ink transition-colors duration-200 group-hover/item:text-primary-500">
                          {res.label}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-muted">
                          {res.desc}
                        </span>
                      </LocaleLink>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-line pt-4">
                    <LocaleLink
                      locale={locale}
                      href="/toolkits"
                      onClick={close}
                      className="text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
                    >
                      {t.browseAccounts} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
                    </LocaleLink>
                  </div>
                </div>
              )}
            </NavMenu>

            {/* Personal Hub dropdown (matches Accountants Hub).
                Sits after the Founders Hub: the two business-facing hubs read
                first, personal finance last, before the plain links. */}
            <NavMenu
              locale={locale}
              href="/personal/mortgage"
              label={t.personal}
              active={personalActive}
              toggleLabel={t.submenu.replace("{label}", t.personal)}
              panelClass="left-1/2 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2"
            >
              {(close) => (
                <div className="rounded-none border border-line bg-white p-6 shadow-2xl shadow-navy-900/15">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {t.personalHeading}
                  </p>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    {PERSONAL_TOOLS.map((tool) => (
                      <LocaleLink
                        locale={locale}
                        key={tool.href}
                        href={tool.href}
                        onClick={close}
                        aria-current={pathname === tool.href ? "page" : undefined}
                        className="group/item block"
                      >
                        <span className="font-display text-sm font-semibold text-ink transition-colors duration-200 group-hover/item:text-primary-500">
                          {entry(tool).label}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-muted">
                          {entry(tool).desc}
                        </span>
                      </LocaleLink>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-line pt-4">
                    <LocaleLink
                      locale={locale}
                      href="/personal/mortgage"
                      onClick={close}
                      className="text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
                    >
                      {t.openPersonal} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
                    </LocaleLink>
                  </div>
                </div>
              )}
            </NavMenu>

            {/* Budget dropdown: one entry per year, newest first. The label
                stays "Budget" so the row never grows with the years. */}
            <NavMenu
              locale={locale}
              href={LATEST_BUDGET.href}
              label={t.budget}
              active={budgetActive}
              toggleLabel={t.submenu.replace("{label}", t.budget)}
              panelClass="left-1/2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2"
            >
              {(close) => (
                <div className="rounded-none border border-line bg-white p-5 shadow-2xl shadow-navy-900/15">
                  <div className="flex flex-col gap-4">
                    {BUDGETS.map((b) => (
                      <LocaleLink
                        locale={locale}
                        key={b.href}
                        href={b.href}
                        onClick={close}
                        aria-current={pathname === b.href ? "page" : undefined}
                        className="group/item block"
                      >
                        <span className="font-display text-sm font-semibold text-ink transition-colors duration-200 group-hover/item:text-primary-500">
                          {entry(b).label}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-muted">
                          {entry(b).desc}
                        </span>
                      </LocaleLink>
                    ))}
                  </div>
                </div>
              )}
            </NavMenu>

            {secondaryLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <LocaleLink
                  locale={locale}
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                    active ? "text-primary-600" : "text-ink-body hover:text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    className={`pointer-events-none absolute -bottom-1.5 inset-s-0 h-0.5 w-full origin-left rtl:origin-right bg-primary-500 transition-transform duration-200 ease-snappy ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </LocaleLink>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <LanguageMenu label={t.language} />
            {user ? (
              <LocaleLink
                locale={locale}
                href={user.role === "admin" ? "/admin" : "/portal"}
                aria-label={
                  user.role === "admin" ? t.adminDashboard : t.myDashboard
                }
                title={`${firstName}: ${user.role === "admin" ? t.adminDashboard : t.myDashboard}`}
                className="group flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 ps-1 pe-1.5 shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:pe-4 xl:pe-1.5"
              >
                <span className="rounded-full ring-2 ring-primary-300/60 ring-offset-2 ring-offset-surface">
                  <Avatar user={user} size={34} />
                </span>
                {/* The name is hidden at xl, where the full nav row is shown: with
                    the longer hub names (Oct 2026) the row has no room for it
                    when signed in. It stays in the title and aria-label. */}
                <span className="hidden flex-col pe-1 leading-tight sm:flex xl:hidden">
                  <span className="text-sm font-semibold text-ink">
                    {firstName}
                  </span>
                  <span className="text-xs font-medium text-primary-600 transition-colors duration-200 group-hover:text-primary-500">
                    {user.role === "admin" ? t.adminDashboard : t.myDashboard}
                  </span>
                </span>
              </LocaleLink>
            ) : (
              <LocaleLink
                locale={locale}
                href="/login"
                className="inline-flex h-10 cursor-pointer items-center whitespace-nowrap rounded-none border border-line px-3 text-sm font-semibold sm:px-4 text-ink transition-colors duration-200 hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {t.signIn}
              </LocaleLink>
            )}
            <LocaleLink
              locale={locale}
              href="/contact"
              className="hidden h-10 cursor-pointer items-center rounded-none bg-primary-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:inline-flex"
            >
              {t.ask}
            </LocaleLink>
            <button
              type="button"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-none border border-line text-ink transition-colors duration-200 hover:bg-secondary-50 xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.closeMenu : t.openMenu}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path
                    d="M3 3l12 12M15 3L3 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2 4.5h14M2 9h14M2 13.5h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="max-h-[calc(100vh-4.75rem)] overflow-y-auto border-t border-line bg-canvas px-5 py-4 xl:hidden"
          >
            <div className="flex flex-col gap-1">
              {/* Tools accordion */}
              <button
                type="button"
                aria-expanded={mobileToolsOpen}
                onClick={() => setMobileToolsOpen((open) => !open)}
                className={`flex items-center justify-between rounded-none px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                  toolsActive
                    ? "bg-secondary-50 font-semibold text-primary-500"
                    : "text-ink-body hover:bg-secondary-50"
                }`}
              >
                {t.taxHub}
                <Chevron
                  className={`text-muted transition-transform duration-200 ${
                    mobileToolsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileToolsOpen && (
                <div className="mb-1 ms-3 flex flex-col gap-0.5 border-s border-line ps-3">
                  {CALCULATOR_TOOLS.map((tool) => (
                    <LocaleLink
                      locale={locale}
                      key={tool.href}
                      href={tool.href}
                      onClick={closeMobile}
                      aria-current={pathname === tool.href ? "page" : undefined}
                      className="rounded-none px-3 py-2 text-sm text-muted transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-500"
                    >
                      {entry(tool).label}
                    </LocaleLink>
                  ))}
                </div>
              )}

              {/* Founders Hub accordion */}
              <button
                type="button"
                aria-expanded={mobileFoundersOpen}
                onClick={() => setMobileFoundersOpen((open) => !open)}
                className={`flex items-center justify-between rounded-none px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                  foundersActive
                    ? "bg-secondary-50 font-semibold text-primary-500"
                    : "text-ink-body hover:bg-secondary-50"
                }`}
              >
                {t.accounts}
                <Chevron
                  className={`text-muted transition-transform duration-200 ${
                    mobileFoundersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileFoundersOpen && (
                <div className="mb-1 ms-3 flex flex-col gap-0.5 border-s border-line ps-3">
                  {FOUNDER_RESOURCES.map((res) => (
                    <LocaleLink
                      locale={locale}
                      key={res.label}
                      href="/toolkits"
                      onClick={closeMobile}
                      className="rounded-none px-3 py-2 text-sm text-muted transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-500"
                    >
                      {res.label}
                    </LocaleLink>
                  ))}
                </div>
              )}

              {/* Personal Hub accordion: same order as the desktop row. */}
              <button
                type="button"
                aria-expanded={mobilePersonalOpen}
                onClick={() => setMobilePersonalOpen((open) => !open)}
                className={`flex items-center justify-between rounded-none px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                  personalActive
                    ? "bg-secondary-50 font-semibold text-primary-500"
                    : "text-ink-body hover:bg-secondary-50"
                }`}
              >
                {t.personal}
                <Chevron
                  className={`text-muted transition-transform duration-200 ${
                    mobilePersonalOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobilePersonalOpen && (
                <div className="mb-1 ms-3 flex flex-col gap-0.5 border-s border-line ps-3">
                  {PERSONAL_TOOLS.map((tool) => (
                    <LocaleLink
                      locale={locale}
                      key={tool.href}
                      href={tool.href}
                      onClick={closeMobile}
                      aria-current={pathname === tool.href ? "page" : undefined}
                      className="rounded-none px-3 py-2 text-sm text-muted transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-500"
                    >
                      {entry(tool).label}
                    </LocaleLink>
                  ))}
                </div>
              )}

              {/* Budget accordion: the years, newest first. */}
              <button
                type="button"
                aria-expanded={mobileBudgetOpen}
                onClick={() => setMobileBudgetOpen((open) => !open)}
                className={`flex items-center justify-between rounded-none px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                  budgetActive
                    ? "bg-secondary-50 font-semibold text-primary-500"
                    : "text-ink-body hover:bg-secondary-50"
                }`}
              >
                {t.budget}
                <Chevron
                  className={`text-muted transition-transform duration-200 ${
                    mobileBudgetOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileBudgetOpen && (
                <div className="mb-1 ms-3 flex flex-col gap-0.5 border-s border-line ps-3">
                  {BUDGETS.map((b) => (
                    <LocaleLink
                      locale={locale}
                      key={b.href}
                      href={b.href}
                      onClick={closeMobile}
                      aria-current={pathname === b.href ? "page" : undefined}
                      className="rounded-none px-3 py-2 text-sm text-muted transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-500"
                    >
                      {entry(b).label}
                    </LocaleLink>
                  ))}
                </div>
              )}

              {secondaryLinks.map((link) => (
                <LocaleLink
                  locale={locale}
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={`rounded-none px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                    isActive(pathname, link.href)
                      ? "bg-secondary-50 font-semibold text-primary-500"
                      : "text-ink-body hover:bg-secondary-50"
                  }`}
                  onClick={closeMobile}
                >
                  {link.label}
                </LocaleLink>
              ))}
              <LocaleLink
                locale={locale}
                href="/contact"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-none bg-primary-500 px-5 text-sm font-semibold text-white"
                onClick={closeMobile}
              >
                {t.ask}
              </LocaleLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
