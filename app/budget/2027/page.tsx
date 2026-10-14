import type { Metadata } from "next";
import { Breadcrumbs, Chevron, Container, GroupRow } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { Budget2027Planner } from "../../components/budget-2027-planner";
import { BUDGET_DATA_AS_OF, BUDGET_SOURCES, GROUPS, YEARS, allMeasures } from "../../lib/budget-2027";
import { getTaxRates } from "../../lib/tax-data";
import { getMessages, getT } from "../../lib/messages";
import { budgetMessages } from "../../lib/messages/budget";
import { calcMessages } from "../../lib/messages/calc";
import { localDate } from "../../lib/i18n";

/* Budget 2027 for you. Thin on purpose: every figure, rule and source lives in
   app/lib/budget-2027.ts (pure, tested), and the tax maths is the income tax
   engine. Nothing here may be phrased as advice; the disclaimers are
   load-bearing. Plan and verification: docs/budget-2027-plan.md.

   Layout: a compact navy hero carrying the Budget's own calendar (the three
   dates most of it hangs on) instead of a stock photo; the planner; then the
   full list in the same group-row structure the planner uses; sources folded
   away at the end. */

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(budgetMessages)).meta;
}

/* The dates most of the Budget hangs on (budgetMessages.keyDates). Every one
   is confirmed in docs/budget-2027-plan.md section 6. */

/* The full list never changes between deploys: grouped once, not per request. */
const MEASURES_BY_GROUP = GROUPS.map((group) => ({
  group,
  measures: allMeasures().filter((m) => m.group === group),
}));

export default async function Budget2027Page() {
  // Only the two years the planner compares go to the browser.
  const rates = await getTaxRates();
  const ratesByYear = { [YEARS.before]: rates[YEARS.before], [YEARS.after]: rates[YEARS.after] };
  const { locale } = await getMessages();
  const t = await getT(budgetMessages);
  const c = await getT(calcMessages);

  return (
    <>
      <section className="bg-navy-900 text-white">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Breadcrumbs
              items={[
                { label: c.home, href: "/" },
                // No href: there is no Budget index yet, and /budget only
                // redirects back here.
                { label: t.crumb },
                { label: "2027" },
              ]}
            />
            <h1 className="mt-8 font-display text-6xl font-bold leading-[0.92] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/75">
              {t.lede}
            </p>
          </div>

          <dl className="border-t border-white/20">
            {t.keyDates.map((d) => (
              <div key={d.date} className="grid grid-cols-[9.5rem_1fr] gap-4 border-b border-white/20 py-4">
                <dt className="font-display text-base font-semibold text-white">{d.date}</dt>
                <dd className="text-sm leading-6 text-white/70">{d.what}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <Budget2027Planner ratesByYear={ratesByYear} />
      </Container>

      <section aria-labelledby="everything" className="border-t border-line bg-surface-muted">
        <Container className="py-16 sm:py-20">
          <h2
            id="everything"
            className="font-display text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl"
          >
            {t.everything}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-body">
            {t.everythingLede}
          </p>

          <div className="mt-10">
            {MEASURES_BY_GROUP.map(({ group, measures }) => (
              <GroupRow key={group} title={t.groups[group] ?? group} className="border-ink/15 py-8" titleClassName="text-lg">
                <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                  {measures.map((m) => (
                    <li key={m.id}>
                      <p className="text-[15px] font-semibold text-ink">{t.measures[m.id]?.title ?? m.title}</p>
                      <p className="mt-1 text-sm leading-6 text-ink-body">{t.measures[m.id]?.summary ?? m.summary}</p>
                      <p className="mt-1.5 text-xs text-muted">{t.measures[m.id]?.starts ?? m.starts.label}</p>
                    </li>
                  ))}
                </ul>
              </GroupRow>
            ))}
          </div>

          <details className="group mt-6 border-t border-ink/15 pt-6">
            <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
              <Chevron className="text-muted transition-transform duration-200 group-open:rotate-90" />
              <span className="font-display text-lg font-semibold text-ink">
                {t.sources}
              </span>
            </summary>
            <div className="mt-5 max-w-3xl pl-6">
              <p className="text-sm leading-6 text-ink-body">
                {t.sourcesBody.replace("{date}", localDate(locale, BUDGET_DATA_AS_OF))}
              </p>
              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {Object.values(BUDGET_SOURCES).map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-primary-600 underline decoration-primary-300 underline-offset-2 transition-colors duration-200 hover:text-primary-500"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <p className="mt-10 max-w-2xl text-xs leading-5 text-muted">
            {t.pageDisclaimer}
          </p>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
