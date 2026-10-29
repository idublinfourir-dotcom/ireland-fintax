import type { Metadata } from "next";
import { ReviewedBy } from "../components/reviewed-by";
import Link from "../components/locale-link";
import { Breadcrumbs, Button, Container, fill, PageHero } from "../components/ui";
import { Accordion } from "../components/accordion";
import { ContactCta } from "../components/sections";
import { AccountProjection } from "../components/investment-account-tools";
import { ACCOUNT_DATA_AS_OF, accountTax, INVESTMENT_ACCOUNT } from "../lib/ireland-investment-account";
import { localDate, MONTHS, numberFormat, shortMonth, type Locale } from "../lib/i18n";
import { getLocale, getT } from "../lib/messages";
import { investmentAccountMessages } from "../lib/messages/investment-account";

/* The Irish Investment Account (Budget 2027, Finance (No. 2) Bill 2026).
 *
 * In every language; copy in messages/investment-account.ts, figures from
 * lib/ireland-investment-account.ts, filled in as {placeholders} so each
 * amount lives in one place. The copy follows docs/investment-account-plan.md,
 * section 4. A learning page: it compares, it never recommends, and the
 * disclaimers are load-bearing. Each fact is stated once; link to it rather
 * than repeating it. Source titles stay English: they name the documents. */

const { annualLimit, taxFreeThreshold } = INVESTMENT_ACCOUNT;
const BILL = "https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf";
const SPEECH = "https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/";

const euros = (locale: Locale) =>
  numberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format;

/** A translated sentence with its {placeholders} swapped for text. */
const sub = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(investmentAccountMessages), getLocale()]);
  return { title: t.meta.title, description: sub(t.meta.description, { threshold: euros(locale)(taxFreeThreshold) }) };
}

/* Pairs by index with timeline in the messages; null is "After the Act". */
const TIMELINE: (string | null)[] = [
  "2026-02-15",
  "2026-03-31",
  "2026-08-31",
  "2026-10-06",
  "2026-10-19",
  "2026-10-20",
  "2026-11",
  "2026-12",
  null,
  "2027-07-01",
];

/** "15 Feb 2026" / "Nov 2026" in English; the long form elsewhere. */
function when(locale: Locale, iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (locale === "en") return d ? `${d} ${shortMonth("en", m - 1)} ${y}` : `${shortMonth("en", m - 1)} ${y}`;
  return localDate(locale, d ? `${d} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`);
}

/* Pair by index with related in the messages. */
const RELATED = ["/personal/investment", "/tools/ireland-cgt", "/budget/2027", "/blog/how-savings-and-investments-are-taxed"];

const sources = [
  { href: BILL, label: "Finance (No. 2) Bill 2026, section 26: new Part 27A, Individual Investment Account (19 October 2026)" },
  { href: "https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/memo/b9826d-memo.pdf", label: "Finance (No. 2) Bill 2026, Explanatory Memorandum" },
  { href: "https://assets.gov.ie/static/documents/c6792805/20261012_Budget_2027_Tax_Policy_Changes_Book.pdf", label: "Department of Finance, Budget 2027 Tax Policy Changes, chapter 9 (12 October 2026)" },
  { href: SPEECH, label: "Statement by the Tánaiste and Minister for Finance on Budget 2027 (6 October 2026)" },
  { href: "https://assets.gov.ie/static/documents/a5d640c2/Roadmap_for_the_Taxation_of_Retail_Investment.pdf", label: "Department of Finance, Taxation of Retail Investment: A New Path Forward for Ireland (August 2026)" },
  { href: "https://www.ccpc.ie/manage-your-money/saving-and-investments/new-investment-account", label: "CCPC, What is Ireland's new Investment Account" },
  { href: "https://www.revenue.ie/en/corporate/press-office/press-releases/2026/pr-100726-irish-investment-account.aspx", label: "Revenue, Irish Investment Account Technical Group Forum" },
];

const h2 = "font-display text-2xl font-bold tracking-[-0.01em] text-ink sm:text-3xl";
const section = "mt-16 border-t border-line pt-10";
const prose = "max-w-3xl text-base leading-7 text-ink-body";
/* Underlined, not colour alone: these links sit inside running text (WCAG 1.4.1). */
const a = "text-primary-500 underline underline-offset-2 hover:text-primary-600";

export default async function InvestmentAccountPage() {
  const [t, locale] = await Promise.all([getT(investmentAccountMessages), getLocale()]);
  const eur = euros(locale);
  /* Every figure the copy can name, by placeholder. */
  const v = {
    limit: eur(annualLimit),
    threshold: eur(taxFreeThreshold),
    age: String(INVESTMENT_ACCOUNT.minAge),
    double: eur(2 * taxFreeThreshold),
    four: eur(4 * annualLimit),
  };
  return (
    <>
      <PageHero
        image="forecast"
        breadcrumb={<Breadcrumbs items={[{ label: t.home, href: "/" }, { label: t.crumb }]} />}
        title={t.title}
        lede={sub(t.lede, v)}
        action={
          <div className="flex flex-col gap-5">
            <p className="flex max-w-xl flex-col items-start gap-2 text-sm leading-6 text-white/70">
              <span className="bg-amber-50 px-3 py-1 font-semibold text-amber-900">{t.status}</span>
              <span>{sub(t.statusBody, { date: localDate(locale, ACCOUNT_DATA_AS_OF) })}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="#eligibility" external variant="outlineLight">{t.canOpen}</Button>
              <Button href="#calculator" external variant="outlineLight">{t.workOut}</Button>
            </div>
          </div>
        }
      />

      <Container className="py-16 sm:py-20">
        <h2 className={h2}>{t.rulesTitle}</h2>
        <dl className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
          {t.rules.map((r) => (
            <div key={r.term} className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-semibold text-ink">{r.term}</dt>
              <dd className="leading-7 text-ink-body">{sub(r.def, v)}</dd>
            </div>
          ))}
        </dl>

        <div className={section}>
          <h2 className={h2}>{t.howTitle}</h2>
          <p className="mt-6 inline-block border border-line bg-surface-muted px-6 py-4 font-display text-xl font-semibold text-ink">
            {sub(t.formula, v)}
          </p>
          <p className={`mt-4 ${prose}`}>
            {fill(sub(t.speech, { avg: eur(52_000), over: eur(2_000), tax: eur(accountTax(52_000)) }), {
              speech: (
                <a href={SPEECH} target="_blank" rel="noopener noreferrer" className={a}>
                  {t.speechLink}
                </a>
              ),
            })}
          </p>
          <ul className={`mt-3 list-disc space-y-1.5 ps-5 ${prose}`}>
            {t.cases.map((c) => (
              <li key={c}>{sub(c, { ...v, avg: eur(60_000), tax: eur(accountTax(60_000)) })}</li>
            ))}
          </ul>
          <p className={`mt-4 ${prose}`}>{t.partYear}</p>
        </div>

        <div id="eligibility" className={`${section} scroll-mt-24`}>
          <h2 className={h2}>{t.whoTitle}</h2>
          <p className={`mt-4 ${prose}`}>{sub(t.whoBody, v)}</p>
        </div>

        <div className={section}>
          <h2 className={h2}>{t.whatTitle}</h2>
          <div className="mt-6 grid max-w-4xl gap-8 md:grid-cols-2">
            {[
              { title: t.allowedTitle, items: t.allowed },
              { title: t.notAllowedTitle, items: t.notAllowed },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="font-semibold text-ink">{col.title}</h3>
                <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm leading-6">
                  {col.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div id="calculator" className={`${section} scroll-mt-24`}>
          <h2 className={h2}>{t.calcTitle}</h2>
          <p className="mt-4 max-w-3xl text-muted">{sub(t.calcIntro, v)}</p>
          <div className="mt-8">
            <AccountProjection />
          </div>
        </div>

        <div className={section}>
          <h2 className={h2}>{t.notFitTitle}</h2>
          <ul className={`mt-4 list-disc space-y-3 ps-5 ${prose}`}>
            {t.notFit.map((n) => (
              <li key={n}>{sub(n, { avg: eur(100_000), tax: eur(accountTax(100_000)), grew: eur(10_000) })}</li>
            ))}
          </ul>
        </div>

        <div className={section}>
          <h2 className={h2}>{t.openTitle}</h2>
          <p className="mt-4 max-w-3xl text-muted">{t.openIntro}</p>
          <dl className="mt-6 max-w-4xl border-t border-line">
            {t.openQs.map((o) => (
              <div key={o.q} className="grid gap-2 border-b border-line py-4 md:grid-cols-2 md:gap-8">
                <dt className="font-semibold text-ink">{o.q}</dt>
                <dd className="text-sm leading-6 text-muted">{o.said}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={section}>
          <h2 className={h2}>{t.timelineTitle}</h2>
          <ol className="mt-6 max-w-3xl border-t border-line text-sm leading-6">
            {t.timeline.map((item, i) => {
              const date = TIMELINE[i];
              return (
                <li
                  key={item.what}
                  className={`grid gap-4 border-b border-line py-2.5 ${
                    locale === "en" ? "grid-cols-[7.5rem_minmax(0,1fr)]" : "grid-cols-[9.5rem_minmax(0,1fr)]"
                  }`}
                >
                  <span className="font-semibold text-ink">{date ? when(locale, date) : t.afterAct}</span>
                  <span>{sub(item.what, v)}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={section}>
          <h2 className={h2}>{t.providersTitle}</h2>
          <p className={`mt-4 ${prose}`}>{t.providersBody}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{t.noBrands}</p>
        </div>

        <div className={section}>
          <h2 className={h2}>{t.faqTitle}</h2>
          <div className="mt-6 max-w-3xl border-t border-line">
            <Accordion items={t.faqs.map((f) => ({ question: sub(f.q, v), answer: sub(f.a, v) }))} />
          </div>
        </div>

        <div className={section}>
          <h2 className="font-display text-xl font-semibold text-ink">{t.seeAlso}</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6">
            {t.related.map((r, i) => (
              <li key={RELATED[i]}>
                <Link href={RELATED[i]} className={`font-semibold ${a}`}>{r.label}</Link>
                <span className="text-muted">: {r.body}</span>
              </li>
            ))}
            <li>
              <a
                href="https://www.ccpc.ie/manage-your-money/saving-and-investments/the-ccpc-investment-readiness-tool"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold ${a}`}
              >
                {t.ccpc.label}
              </a>
              <span className="text-muted">: {t.ccpc.body}</span>
            </li>
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">{t.sourcesTitle}</h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-6">
            {sources.map((s) => (
              <li key={s.href} lang="en">
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={a}>{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="mt-8 bg-surface-muted p-5 text-sm leading-6 text-ink-body">{t.disclaimer}</p>
          <ReviewedBy className="mt-3" />
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
