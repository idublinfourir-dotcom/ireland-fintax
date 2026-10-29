import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import Link from "../../components/locale-link";
import { Breadcrumbs, BudgetNote, Button, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { PersonalTabs } from "../../components/tool-tabs";
import { IrelandInvestmentPlanner } from "../../components/ireland-investment-planner";
import { DATA_AS_OF, SOURCES } from "../../lib/ireland-investment";
import { getMessages, getT } from "../../lib/messages";
import { investmentMessages } from "../../lib/messages/investment";
import { investmentData } from "../../lib/messages/investment-options";
import { calcMessages } from "../../lib/messages/calc";
import { localDate } from "../../lib/i18n";

/* Personal investment: the options planner plus the tax explainer behind it.
 *
 * No rate, threshold or return figure is written into this page: they all live
 * in app/lib/ireland-investment.ts, which is pure, unit-tested and carries the
 * source for every number. Keep it that way: a figure inlined here is one
 * nobody will find when the Budget moves it.
 *
 * The page explains the TAX of an investment, not the investment itself. It is
 * a learning page, not a firm's: no "we advise", no "talk to us".
 * The tool ranks option types by return after Irish tax and must never be
 * phrased as a personal recommendation; the disclaimers in the planner and at
 * the foot of this page are load-bearing, not boilerplate. */

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(investmentMessages)).meta;
}

/* Copy: investmentMessages (coverage, approach, related). The order matters
   for `approach`: each step depends on the one before it. `related` pairs by
   index with these hrefs: existing tools that already answer part of the
   question. */
const relatedHrefs = ["/tools/ireland-cgt", "/tools/ireland-cat", "/tools/ireland-income-tax", "/personal/mortgage"];

export default async function PersonalInvestmentPage() {
  const { locale } = await getMessages();
  const t = await getT(investmentMessages);
  const c = await getT(calcMessages);
  const data = await getT(investmentData);
  const asOf = localDate(locale, DATA_AS_OF);
  return (
    <>
      <PageHero
        image="forecast"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: c.home, href: "/" },
              { label: t.crumbHub, href: "/personal/mortgage" },
              { label: t.crumb },
            ]}
          />
        }
        title={t.title}
        lede={t.lede.replace("{date}", asOf)}
        action={
          <Button href="/contact" variant="outlineLight">
            {t.ask}
          </Button>
        }
      />

      <Container className="py-16 sm:py-20">
        <PersonalTabs current="/personal/investment" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandInvestmentPlanner />
        </div>

        <BudgetNote>
          {t.budgetNote}{" "}
          <Link href="/investment-account" className="font-medium text-primary-500 underline-offset-2 hover:underline">
            {t.accountLink}
          </Link>
        </BudgetNote>
        <ReviewedBy className="mt-2" />

        <div className="mt-16 max-w-3xl border-t border-line pt-12">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
            {t.wrapperTitle}
          </h2>
          <p className="mt-5 text-lg leading-8 text-ink-body">
            {t.wrapperBody}
          </p>
          <p className="mt-4 text-base leading-7 text-muted">
            {t.wrapperNote}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.coverage.map((item) => (
            <div
              key={item.title}
              className="rounded-none border border-line bg-surface p-6"
            >
              <h3 className="font-display text-base font-medium tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-line pt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t.approachTitle}
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.approach.map((item, i) => ({ ...item, step: String(i + 1).padStart(2, "0") })).map((item) => (
              <div key={item.step}>
                <span className="font-display text-sm font-semibold tracking-[0.16em] text-primary-500">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-base font-medium tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t.relatedTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            {t.relatedLede}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {t.related.map((item, i) => ({ ...item, href: relatedHrefs[i] })).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-none border border-line bg-surface p-6 transition-colors duration-200 hover:border-primary-300"
              >
                <span className="font-display text-base font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-500">
                  {item.label}{" "}
                  <span aria-hidden="true" className="inline-block rtl:-scale-x-100 text-primary-500">
                    →
                  </span>
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">
                  {item.body}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t.sourcesTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            {t.sourcesLede.replace("{date}", asOf)}
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {SOURCES.map((source) => (
              <li key={source.url} className="border-t border-line pt-3">
                <span className="block text-sm font-medium text-ink">
                  {data.topics[source.url] ?? source.topic}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm leading-6 text-muted underline-offset-4 transition-colors duration-200 hover:text-primary-500 hover:underline"
                >
                  {source.source}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 max-w-3xl border-t border-line pt-6 text-sm leading-6 text-muted">
          {t.pageDisclaimer}
        </p>
      </Container>

      <ContactCta />
    </>
  );
}
