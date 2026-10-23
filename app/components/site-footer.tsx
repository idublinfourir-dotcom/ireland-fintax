import { LocaleLink } from "./locale-link";
import { site } from "../lib/content";
import { images } from "../lib/images";
import { LATEST_BUDGET } from "../lib/budgets";
import { LanguageList } from "./language-menu";
import { getMessages } from "../lib/messages";

/* Pricing and Services stay hidden (app/_pricing, app/_services): this is a
   free learning site, not a firm. Labels are t.footer.links. */
const exploreHrefs = {
  budget: LATEST_BUDGET.href,
  calculators: "/tools/ireland-income-tax",
  personal: "/personal/mortgage",
  accounts: "/toolkits",
  blog: "/blog",
  about: "/about",
  faq: "/#faq",
  ask: "/contact",
} as const;

export async function SiteFooter() {
  const { locale, t: all } = await getMessages();
  const t = all.footer;
  return (
    <footer className="relative isolate overflow-hidden bg-navy-900 text-white">
      {/* photographic backdrop — Irish countryside at dusk */}
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
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <LocaleLink locale={locale} href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-none bg-white/10 font-display text-[13px] font-semibold tracking-tight text-primary-300">
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
          </div>

          <nav aria-label={t.explore}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {t.explore}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
              {(Object.keys(exploreHrefs) as (keyof typeof exploreHrefs)[]).map((key) => (
                <li key={key}>
                  <LocaleLink
                    locale={locale}
                    href={exploreHrefs[key]}
                    className="transition-colors duration-200 hover:text-white"
                  >
                    {t.links[key]}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {t.getInTouch}
            </h3>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 block text-sm text-white/70 transition-colors duration-200 hover:text-white"
            >
              {site.email}
            </a>

            {/* The same page in each language: see language-menu.tsx. */}
            <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {t.language}
            </h3>
            <LanguageList />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Irish Fintax. {t.rights}</p>
          <p>{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
