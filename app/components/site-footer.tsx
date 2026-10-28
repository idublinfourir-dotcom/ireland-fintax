import { LocaleLink } from "./locale-link";
import { site } from "../lib/content";
import { images } from "../lib/images";
import { LATEST_BUDGET } from "../lib/budgets";
import { LanguageList } from "./language-menu";
import { getMessages } from "../lib/messages";

/* Three columns of links as the ui-ux-reviews design has them (28 Oct 2026).
   Labels are t.footer.links. Pricing and Services stay hidden (app/_pricing,
   app/_services): this is a learning site, not a firm. The design's "Our
   partners", "Rates at a glance" and "Disclaimer" links are left out: there
   is no page behind them (the disclaimer is the line at the bottom). */
const columns = {
  suite: {
    incomeTax: "/tools/ireland-income-tax",
    corporationTax: "/tools/ireland-corporation-tax",
    cgt: "/tools/ireland-cgt",
    cat: "/tools/ireland-cat",
    rd: "/tools/ireland-rd-tax-credit",
  },
  resources: {
    mortgage: "/personal/mortgage",
    investment: "/personal/investment",
    budget: LATEST_BUDGET.href,
    calendar: "/#calendar",
  },
  company: {
    about: "/about",
    news: "/blog",
    contact: "/contact",
    method: "/about#how-we-check",
    report: "/contact",
  },
} as const;

export async function SiteFooter() {
  const { locale, t: all } = await getMessages();
  const t = all.footer;
  const budget = all.header.tools[LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;
  return (
    <footer className="relative isolate overflow-hidden bg-navy-900 text-white">
      {/* photographic backdrop: Irish countryside at dusk */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-55"
        style={{ backgroundImage: `url(${images.footerLand})` }}
      />
      {/* navy scrim keeps text legible while letting the photo read through */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900/85 via-navy-900/65 to-navy-900/90"
      />
      {/* harvest hairline at the seam */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent"
      />
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <LocaleLink locale={locale} href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-none bg-white/10 font-display text-[13px] font-semibold tracking-tight text-primary-200">
                IF
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-semibold tracking-tight text-white">
                  IRISH
                </span>
                <span className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                  Fintax
                </span>
              </span>
            </LocaleLink>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
              {t.blurb}
            </p>

            <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {t.getInTouch}
            </h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 block text-sm text-white/70 transition-colors duration-200 hover:text-white"
            >
              {site.email}
            </a>

            {/* The same page in each language: see language-menu.tsx. */}
            <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {t.language}
            </h2>
            <LanguageList />
          </div>

          {(Object.keys(columns) as (keyof typeof columns)[]).map((column) => (
            <nav key={column} aria-label={t[column]}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
                {t[column]}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
                {Object.entries(columns[column]).map(([key, href]) => (
                  <li key={key}>
                    <LocaleLink
                      locale={locale}
                      href={href}
                      className="transition-colors duration-200 hover:text-white"
                    >
                      {t.links[key as keyof typeof t.links].replace("{budget}", budget)}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-white/45 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p>
            © {new Date().getFullYear()} Irish Fintax. {t.disclaimer} {t.sources}
          </p>
          <p className="flex shrink-0 gap-2">
            <LocaleLink
              locale={locale}
              href="/privacy"
              className="underline-offset-2 transition-colors duration-200 hover:text-white hover:underline"
            >
              {t.privacy}
            </LocaleLink>
            <span aria-hidden="true">·</span>
            <a
              href="/sitemap.xml"
              className="underline-offset-2 transition-colors duration-200 hover:text-white hover:underline"
            >
              {t.sitemap}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
