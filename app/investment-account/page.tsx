import type { Metadata } from "next";
import Link from "../components/locale-link";
import { Breadcrumbs, Button, Container, PageHero } from "../components/ui";
import { Accordion } from "../components/accordion";
import { ContactCta } from "../components/sections";
import { AccountProjection } from "../components/investment-account-tools";
import { ACCOUNT_DATA_AS_OF, accountTax, INVESTMENT_ACCOUNT } from "../lib/ireland-investment-account";
import { numberFormat } from "../lib/i18n";

/* The Irish Investment Account (Budget 2027, Finance (No. 2) Bill 2026).
 *
 * English only on purpose: not in TRANSLATED_PATHS, so /ga, /es and /pt
 * redirect here. Figures come from lib/ireland-investment-account.ts; the copy
 * follows docs/investment-account-plan.md, section 4. A learning page: it
 * compares, it never recommends, and the disclaimers are load-bearing.
 * Each fact is stated once; link to it rather than repeating it. */

export const metadata: Metadata = {
  title: "Irish Investment Account: how the 1% tax works",
  description:
    "The Investment Account from 1 July 2027: who can open one, what can go in, how the 1% tax on value above €50,000 works, with a calculator that follows the Finance Bill day by day.",
};

const eur = numberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format;
const { annualLimit, taxFreeThreshold } = INVESTMENT_ACCOUNT;
const BILL = "https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf";
const SPEECH = "https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/";

const rules = [
  { term: "Paying in", def: `Up to ${eur(annualLimit)} a year, in money only. There is no minimum, and taking money out doesn't give you any of that year's limit back.` },
  { term: "The tax", def: `1% a year on the account's average value above ${eur(taxFreeThreshold)}. Below that, nothing. Inside the account there is no CGT, dividend withholding tax, exit tax or 8-year deemed disposal, and nothing is due when you take money out.` },
  { term: "The average", def: "The account is valued at the close of every day it is open, and the tax uses the average of those values for the year." },
  { term: "Paperwork", def: "None for you. The provider works out the tax, pays it to Revenue from the account and sends you a yearly statement." },
];

const notFit = [
  "Money you might need in the next few years. Investments can fall just when you need them, so an emergency fund belongs in a deposit account first, and investing generally suits goals five or more years away.",
  `Low expected returns. The 1% is charged on value, not profit: on an average of ${eur(100_000)} the tax is ${eur(accountTax(100_000))} whether the account grew by ${eur(10_000)} that year or not at all.`,
  "Unused pension room. Pension contributions get income tax relief, within age-related limits, and this account gets none on the way in. Pension money is locked away until retirement, though, and this account can be emptied at any time.",
];

const openQs = [
  { q: "When will accounts open?", said: "The Bill allows accounts from 1 January 2027, with the start set by ministerial order. The Government says providers will begin offering them from 1 July 2027." },
  { q: "Will it count as savings for means-tested welfare payments?", said: "The Finance Bill doesn't cover it and nothing has been said yet." },
  { q: "What will it cost?", said: "There is no fee cap. Industry sources expect about 0.5% a year all-in without advice and up to 1.5% with it. No provider has published prices." },
  { q: "How will investments be valued each day?", said: "Revenue will set the price sources and currency rules in regulations." },
  { q: "Will children's accounts be allowed?", said: "Not at launch. The Minister says they will be considered in future Finance Bills." },
  { q: "Will the Bill change?", said: "It went to Select Committee after the Dáil's Second Stage debate on 20 October and can be amended at Committee and Report Stages." },
];

const timeline = [
  { date: "15 Feb 2026", what: "Minister announces plans for a savings and investment scheme" },
  { date: "31 Mar 2026", what: "Savings and Investment Forum sets the principles" },
  { date: "31 Aug 2026", what: "Retail Investment Roadmap gives the design" },
  { date: "6 Oct 2026", what: `Budget 2027 sets ${eur(annualLimit)}, ${eur(taxFreeThreshold)} and 1%` },
  { date: "19 Oct 2026", what: "Finance (No. 2) Bill published with the account's legal rules" },
  { date: "20 Oct 2026", what: "Dáil Second Stage debate; the Bill goes to Select Committee" },
  { date: "Nov 2026", what: "Committee and Report Stages (expected)" },
  { date: "Dec 2026", what: "Finance Act signed into law (expected)" },
  { date: "After the Act", what: "Ministerial order starts the account rules" },
  { date: "1 Jul 2027", what: "Providers start offering accounts (Government plan; the Bill allows 1 January 2027)" },
];

const faqs = [
  { q: "Is my money guaranteed?", a: `No. The account is a tax treatment, not a State savings product. It holds shares, bonds and funds, which can fall, and you could get back less than you put in. The 1% can still be due in a year the account loses money, if its average value is above ${eur(taxFreeThreshold)}.` },
  { q: "Can I take money out?", a: `Yes, at any time, with no lock-in and no tax on withdrawal. Money taken out does not free up any of that year's ${eur(annualLimit)}: the limit counts everything paid in.` },
  { q: "Can I move shares or ETFs I already own into it?", a: "No. Only money can be paid in, so you would have to sell them first, which can be a taxable disposal outside the account." },
  { q: `What if I pay in more than ${eur(annualLimit)} in a year?`, a: "The excess is charged 1% a month until you take it out, even into later years, and the provider faces a penalty, so providers are likely to stop you going over." },
  { q: "Can a couple share one?", a: `No, joint accounts aren't allowed. Each adult can have their own, so a couple has ${eur(2 * taxFreeThreshold)} of tax-free room between them.` },
  { q: "What if I move abroad?", a: "Tell your provider. The account stays open, but you cannot pay in or move it to another provider while you are not resident." },
  { q: "What happens when someone dies?", a: "Their personal representatives take it over. Nothing more can be paid in, and the investments must be sold within a year of the grant of probate or administration, or by the third anniversary of the death, whichever comes first. Anything not sold by then is treated as sold at market value." },
  { q: "Is it the same as a UK ISA?", a: "No. It is closer to Sweden's ISK: a small yearly tax on the value, instead of a fully tax-free wrapper with a larger limit." },
];

const related = [
  { href: "/personal/investment", label: "Investment planner", body: "compare 32 Irish options by return after tax" },
  { href: "/tools/ireland-cgt", label: "CGT calculator", body: "tax on selling shares outside the account, at 31%" },
  { href: "/budget/2027", label: "Budget 2027", body: "the other changes" },
  { href: "/blog/how-savings-and-investments-are-taxed", label: "How savings and investments are taxed", body: "the longer guide" },
];

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

export default function InvestmentAccountPage() {
  return (
    <>
      <PageHero
        image="forecast"
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Investment Account" }]} />}
        title="Irish Investment Account"
        lede={`A new account for shares, bonds and funds, due from 1 July 2027. Instead of CGT or exit tax, you pay 1% a year on whatever it is worth above ${eur(taxFreeThreshold)}, and the provider deals with Revenue.`}
        action={
          <div className="flex flex-col gap-5">
            <p className="flex max-w-xl flex-col items-start gap-2 text-sm leading-6 text-white/70">
              <span className="bg-amber-50 px-3 py-1 font-semibold text-amber-900">In the Finance Bill. Not law yet.</span>
              <span>Finance (No. 2) Bill 2026 published 19 October 2026. Becomes law with the Finance Act, then starts by ministerial
              order. Last checked {ACCOUNT_DATA_AS_OF}.</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="#eligibility" external variant="outlineLight">Can I open one?</Button>
              <Button href="#calculator" external variant="outlineLight">Work out the tax</Button>
            </div>
          </div>
        }
      />

      <Container className="py-16 sm:py-20">
        <h2 className={h2}>The rules in short</h2>
        <dl className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
          {rules.map((r) => (
            <div key={r.term} className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-semibold text-ink">{r.term}</dt>
              <dd className="leading-7 text-ink-body">{r.def}</dd>
            </div>
          ))}
        </dl>

        <div className={section}>
          <h2 className={h2}>How the tax is worked out</h2>
          <p className="mt-6 inline-block border border-line bg-surface-muted px-6 py-4 font-display text-xl font-semibold text-ink">
            (average value − {eur(taxFreeThreshold)}) × 1%
          </p>
          <p className={`mt-4 ${prose}`}>
            The{" "}
            <a href={SPEECH} target="_blank" rel="noopener noreferrer" className={a}>
              Budget speech
            </a>{" "}
            used an account averaging €52,000: that is €2,000 over the threshold, so the tax is {eur(accountTax(52_000))}. A few
            more cases:
          </p>
          <ul className={`mt-3 list-disc space-y-1.5 ps-5 ${prose}`}>
            <li>
              Paying in the full {eur(annualLimit)} for four years gives {eur(4 * annualLimit)} before growth, still under the
              threshold, so no tax yet.
            </li>
            <li>
              An account that lost money over the year but still averaged €60,000 owes {eur(accountTax(60_000))}. The tax follows
              value, not profit.
            </li>
            <li>
              Money paid in on 1 December is there for 31 of the year&apos;s 365 days, so only about a twelfth of it counts toward
              that year&apos;s average.
            </li>
          </ul>
          <p className={`mt-4 ${prose}`}>
            The average covers only the days the account was open. If you close it partway through a year, that part of the
            year is taxed when it closes.
          </p>
        </div>

        <div id="eligibility" className={`${section} scroll-mt-24`}>
          <h2 className={h2}>Who can open one</h2>
          <p className={`mt-4 ${prose}`}>
            Anyone {INVESTMENT_ACCOUNT.minAge} or over who is resident in Ireland for tax and has a PPS number. You get one
            account, in your own name. If you close it during a year, you can&apos;t open another until the next year.
            Providers check all of this when you apply.
          </p>
        </div>

        <div className={section}>
          <h2 className={h2}>What can go in</h2>
          <div className="mt-6 grid max-w-4xl gap-8 md:grid-cols-2">
            {[
              { title: "Allowed", items: ["Shares traded on a regulated market in the EEA, or on an equivalent market elsewhere", "Bonds traded the same way", "UCITS funds, which covers most ETFs sold in Europe", "Insurance-based investment products"] },
              { title: "Not allowed", items: ["Anything else, such as crypto assets and derivatives", "Funds that aren't UCITS, such as US-domiciled ETFs, and structured UCITS", "Personal portfolio funds and personal portfolio life policies", "Shares from an employee share scheme", "Cash as savings: it can sit there only while waiting to be invested, and earns no interest"] },
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
          <h2 className={h2}>Calculator</h2>
          <p className="mt-4 max-w-3xl text-muted">
            Pick when you open it, what you pay in and a growth rate. It values the account every day it is open, averages
            those values and takes 1% of anything over {eur(taxFreeThreshold)}, as the Finance Bill sets out.
          </p>
          <div className="mt-8">
            <AccountProjection />
          </div>
        </div>

        <div className={section}>
          <h2 className={h2}>When it may not suit you</h2>
          <ul className={`mt-4 list-disc space-y-3 ps-5 ${prose}`}>
            {notFit.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </div>

        <div className={section}>
          <h2 className={h2}>Not decided yet</h2>
          <p className="mt-4 max-w-3xl text-muted">
            The Bill answers most questions, but not these, and the Bill itself can still change.
          </p>
          <dl className="mt-6 max-w-4xl border-t border-line">
            {openQs.map((o) => (
              <div key={o.q} className="grid gap-2 border-b border-line py-4 md:grid-cols-2 md:gap-8">
                <dt className="font-semibold text-ink">{o.q}</dt>
                <dd className="text-sm leading-6 text-muted">{o.said}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={section}>
          <h2 className={h2}>Where it stands</h2>
          <ol className="mt-6 max-w-3xl border-t border-line text-sm leading-6">
            {timeline.map((t) => (
              <li key={t.date} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5">
                <span className="font-semibold text-ink">{t.date}</span>
                <span>{t.what}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={section}>
          <h2 className={h2}>Who can offer it</h2>
          <p className={`mt-4 ${prose}`}>
            Only regulated firms: investment firms and brokers authorised under MiFID, banks with investment permissions, fund
            management companies, and insurers for insurance-based products. Firms elsewhere in the EEA can offer it too, as
            long as they run the Irish tax for you. Each provider must register with Revenue, which will publish the list.
            Credit unions want to take part but aren&apos;t among the types named in the Bill.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            We don&apos;t name brands. None has published prices yet, and a list would read as a recommendation.
          </p>
        </div>

        <div className={section}>
          <h2 className={h2}>Questions</h2>
          <div className="mt-6 max-w-3xl border-t border-line">
            <Accordion items={faqs.map((f) => ({ question: f.q, answer: f.a }))} />
          </div>
        </div>

        <div className={section}>
          <h2 className="font-display text-xl font-semibold text-ink">See also</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6">
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className={`font-semibold ${a}`}>{r.label}</Link>
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
                CCPC Investment Readiness Tool
              </a>
              <span className="text-muted">: a short check on whether you are ready to invest</span>
            </li>
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">Sources</h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-6">
            {sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={a}>{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="mt-8 bg-surface-muted p-5 text-sm leading-6 text-ink-body">
            General information only, not financial, tax or legal advice. Rules are as set out in the Finance (No. 2) Bill 2026,
            published on 19 October 2026, and may change before it becomes law. The account is not a State guarantee:
            investments can fall as well as rise.
          </p>
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
