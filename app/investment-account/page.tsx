import type { Metadata } from "next";
import Link from "../components/locale-link";
import { Breadcrumbs, Button, Container, Eyebrow, PageHero } from "../components/ui";
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
 * compares, it never recommends, and the disclaimers are load-bearing. */

export const metadata: Metadata = {
  title: "Irish Investment Account: how the 1% tax works",
  description:
    "The Investment Account from 1 July 2027: who can open one, what can go in, how the 1% tax on value above €50,000 works, with a calculator that follows the Finance Bill day by day.",
};

const eur = numberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format;
const { annualLimit, taxFreeThreshold } = INVESTMENT_ACCOUNT;
const BILL = "https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf";
const SPEECH = "https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/";

const glance = [
  { big: eur(annualLimit), title: "Most you can pay in a year", body: "No minimum. Money only. Taking money out doesn't free up the limit." },
  { big: eur(taxFreeThreshold), title: "Tax-free", body: "If the account's average value stays below this, no tax is due." },
  { big: "1%", title: `A year, above ${eur(taxFreeThreshold)}`, body: "The only tax, unless you pay in over the limit. Nothing more when you withdraw." },
  { big: "Daily", title: "Valued every day", body: "Tax is worked out on the average of those daily values." },
  { big: "0", title: "Forms to file", body: "Your provider calculates, reports and pays the tax to Revenue." },
  { big: "None", title: "Of the usual investment taxes", body: "No CGT, dividend withholding tax, exit tax or 8-year deemed disposal inside the account." },
];

const examples = [
  { title: "Four years of maximum payments", body: `${eur(annualLimit)} a year for four years is ${eur(4 * annualLimit)}, before any growth.`, result: `${eur(accountTax(4 * annualLimit))} tax`, note: `Still under ${eur(taxFreeThreshold)}` },
  { title: "A bad year still costs", body: "Markets fell and the account lost money, but its average was still €60,000.", result: `${eur(accountTax(60_000))} tax`, note: "Tax on value, even in a loss year" },
  { title: "Timing matters", body: "Money paid in on 1 December is in the account for 31 of the year's 365 days.", result: "About 1/12", note: "of it counts toward that year's average" },
];

const notFit = [
  { title: "Money you may need soon", body: "Investments can fall just when you need them. An emergency fund belongs in a deposit account first." },
  { title: "A short time horizon", body: "Over a few years, a bad market can wipe out gains. Investing generally suits goals five or more years away." },
  { title: "You expect low returns", body: `The 1% is charged on value, not on profit. On an average of ${eur(100_000)}, the tax is ${eur(accountTax(100_000))} whether the account grew by ${eur(10_000)} that year or by nothing.` },
  { title: "You have room to pay more into a pension", body: "Pension contributions get income tax relief, within age-related limits. This account gets none on the way in. The trade-off: pension money is locked away until retirement, and this account can be emptied at any time." },
  { title: "You get a means-tested payment", body: "Whether the account counts as savings for welfare means tests has not been said yet." },
  { title: "You already hold ETFs or shares", body: "Only money can be paid in, so moving them in means selling first, which can be a taxable disposal.", link: { href: "/tools/ireland-cgt", label: "CGT calculator" } },
];

const openQs = [
  { q: "Exactly when will accounts open?", said: "The Bill lets accounts run from 1 January 2027, with the start set by a ministerial order. The Government says providers will begin offering them from 1 July 2027." },
  { q: "Does the account count as savings for means-tested welfare payments?", said: "Not covered by the Finance Bill, and not yet stated." },
  { q: "What will it cost?", said: "No fee cap. Industry sources expect 0.5% a year all-in without advice, up to 1.5% with advice. No provider has published prices." },
  { q: "Which providers will offer it?", said: "Providers must register with Revenue, which will publish a list. Credit unions want to take part but are not among the types named in the Bill." },
  { q: "How exactly will investments be valued each day?", said: "Revenue will set the price sources and currency rules in regulations." },
  { q: "Will the Bill change before it becomes law?", said: "The Dáil debated it at Second Stage on 20 October and sent it to Select Committee. It can be amended at Committee and Report Stages, and Part 27A then needs a ministerial order to start." },
  { q: "Will children or second accounts be allowed?", said: "Not at launch. The Minister says children's accounts will be considered in future Finance Bills." },
];

const timeline = [
  { date: "15 Feb 2026", what: "Minister announces plans for a savings and investment scheme", state: "Done" },
  { date: "31 Mar 2026", what: "Savings and Investment Forum sets the principles", state: "Done" },
  { date: "31 Aug 2026", what: "Retail Investment Roadmap gives the design", state: "Done" },
  { date: "6 Oct 2026", what: `Budget 2027 sets ${eur(annualLimit)}, ${eur(taxFreeThreshold)} and 1%`, state: "Done" },
  { date: "19 Oct 2026", what: "Finance (No. 2) Bill published with the account's legal rules", state: "Done" },
  { date: "20 Oct 2026", what: "Dáil Second Stage debate; the Bill goes to Select Committee", state: "Done" },
  { date: "Nov 2026", what: "Committee and Report Stages, where the Bill can be amended", state: "Expected" },
  { date: "Dec 2026", what: "Finance Act signed into law", state: "Expected" },
  { date: "After the Act", what: "Minister's order starts the account rules", state: "Expected" },
  { date: "1 Jan 2027", what: "Earliest date the Bill allows accounts to run", state: "In the Bill" },
  { date: "1 Jul 2027", what: "Providers start offering accounts", state: "Government plan" },
];

const faqs = [
  { q: "Is my money guaranteed by the State?", a: "No. The account is a tax treatment set by the State, not a State savings product. Your investments can fall in value, and you could get back less than you put in." },
  { q: "Can I lose money?", a: `Yes. It holds shares, bonds and funds, whose values rise and fall. The 1% tax can still be due in a year the account loses money, if its average value is above ${eur(taxFreeThreshold)}.` },
  { q: "Can I take my money out?", a: `Yes, at any time, with no lock-in and no tax on withdrawal. But money taken out does not free up any of that year's ${eur(annualLimit)}: the limit counts everything paid in.` },
  { q: "Can I move shares or ETFs I already own into it?", a: "No. Only money can be paid in, so you would have to sell them first, which can mean tax outside the account." },
  { q: `What if I pay in more than ${eur(annualLimit)} in a year?`, a: "The excess is charged 1% a month until you take it out, even into later years, and the provider faces a penalty, so providers are likely to stop you going over." },
  { q: "Do I need to file anything with Revenue?", a: "No. Your provider works out, reports and pays any tax due on the account, and sends you a yearly statement." },
  { q: "Can a couple have one?", a: `Each adult can have their own, so a couple has ${eur(2 * taxFreeThreshold)} of tax-free room between them. Joint accounts are not allowed.` },
  { q: "What if I move abroad?", a: "Tell your provider. You cannot pay in or move it to another provider while you are not resident, but the account stays open." },
  { q: "What happens to the account when someone dies?", a: "Their personal representatives take it over. Nothing more can be paid in, and the investments must be sold within a year of the grant of probate or administration, or of the third anniversary of the death, whichever comes first. Anything not sold by then is treated as sold at its market value." },
  { q: "Can my child have one?", a: "Not at launch. Accounts for children are being considered for future Finance Bills." },
  { q: "Is it the same as a UK ISA?", a: "No. It is closer to Sweden's ISK: a small yearly tax on the value, instead of a fully tax-free wrapper with a larger limit." },
];

const related = [
  { href: "/personal/investment", label: "Investment planner", body: "Compare 32 Irish options by return after tax." },
  { href: "/tools/ireland-cgt", label: "CGT calculator", body: "Tax on selling shares outside the account, at 31%." },
  { href: "/budget/2027", label: "Budget 2027", body: "Everything else that changes for you." },
  { href: "/blog/how-savings-and-investments-are-taxed", label: "How savings and investments are taxed", body: "The plain-English guide on our blog." },
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

const h2 = "font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-4xl";
const section = "mt-20 border-t border-line pt-12";

export default function InvestmentAccountPage() {
  return (
    <>
      <PageHero
        image="forecast"
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Investment Account" }]} />}
        title="Irish Investment Account"
        lede={`A new way to invest from 1 July 2027. Shares, bonds and funds in one account, taxed at 1% a year only on value above ${eur(taxFreeThreshold)}, with your provider handling the tax.`}
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
        <Eyebrow>At a glance</Eyebrow>
        <h2 className={`mt-4 ${h2}`}>The scheme in six numbers</h2>
        <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {glance.map((g) => (
            <div key={g.title} className="bg-surface p-6">
              <p className="font-display text-4xl font-bold text-primary-500">{g.big}</p>
              <p className="mt-2 font-semibold text-ink">{g.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{g.body}</p>
            </div>
          ))}
        </div>

        <div className={section}>
          <Eyebrow>How the tax works</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>One rule, applied once a year</h2>
          <p className="mt-6 inline-block border border-line bg-surface-muted px-6 py-4 font-display text-xl font-semibold text-ink">
            (average value − {eur(taxFreeThreshold)}) × 1%
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink-body">
            The Government&apos;s own worked example, from the{" "}
            <a href={SPEECH} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
              Budget speech on 6 October 2026
            </a>
            : an account with an average value of €52,000 is €2,000 over the threshold, so the tax for that year is{" "}
            {eur(accountTax(52_000))}.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            If the average is {eur(taxFreeThreshold)} or less, there is no tax. The tax follows the account&apos;s value, not its profit. The average
            covers only the days the account was open that year, and your provider takes the tax from the account. Pay in more
            than {eur(annualLimit)} in a year and the excess is charged 1% a month until you take it out, even into later years.
            Close the account during a year and that part of the year is taxed when it closes.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {examples.map((e) => (
              <div key={e.title} className="flex flex-col border border-line p-5">
                <p className="text-sm font-semibold text-primary-500">{e.title}</p>
                <p className="mt-2 text-sm leading-6">{e.body}</p>
                <p className="mt-auto pt-4 font-display text-2xl font-bold text-ink">{e.result}</p>
                <p className="mt-1 text-xs text-muted">{e.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="eligibility" className={`${section} scroll-mt-24`}>
          <Eyebrow>Eligibility</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>Who can open one</h2>
          <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 leading-7">
            <li>You are {INVESTMENT_ACCOUNT.minAge} or over.</li>
            <li>You are resident in Ireland for tax.</li>
            <li>You have a PPS number.</li>
          </ul>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            One account each, in your own name only; no joint accounts. If you close your account during a year, you cannot
            open another until the next year. Providers check these when you apply.
          </p>
        </div>

        <div className={section}>
          <Eyebrow>What it can hold</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>What can go in, and what can&apos;t</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              { title: "Allowed", items: ["Shares traded on a regulated market in the EEA, or on an equivalent market elsewhere", "Bonds traded the same way", "UCITS funds, which includes most ETFs sold in Europe", "Insurance-based investment products"] },
              { title: "Not allowed", items: ["Anything not on that list, such as crypto assets and derivatives", "Funds that aren't UCITS, such as US-domiciled ETFs, and structured UCITS", "Personal portfolio funds and personal portfolio life policies", "Shares you got through an employee share scheme", "Cash as savings. Cash can sit there only while it waits to be invested, and earns no interest.", "Shares or funds you already own. Only money can be paid in, so they'd have to be sold first."] },
            ].map((col) => (
              <div key={col.title} className="border border-line p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold text-ink">{col.title}</h3>
                  <span className="bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600">In the Finance Bill</span>
                </div>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-6">
                  {col.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div id="calculator" className={`${section} scroll-mt-24`}>
          <Eyebrow>Calculator</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>Your account, year by year</h2>
          <p className="mt-4 max-w-3xl text-muted">
            Choose when you open it, what you pay in and a growth rate. It values the account every day, averages those values
            over the days it is open, and takes the 1% on anything over {eur(taxFreeThreshold)}, as the Finance Bill sets out.
          </p>
          <div className="mt-8">
            <AccountProjection />
          </div>
        </div>

        <div className={section}>
          <Eyebrow>Think it through</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>When it may not be the right fit</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notFit.map((n) => (
              <div key={n.title} className="border-t-2 border-ink pt-4">
                <h3 className="font-semibold text-ink">{n.title}</h3>
                <p className="mt-2 text-sm leading-6">{n.body}</p>
                {n.link && <Link href={n.link.href} className="mt-2 inline-block text-sm font-semibold text-primary-500 hover:underline">{n.link.label} →</Link>}
              </div>
            ))}
          </div>
        </div>

        <div className={section}>
          <Eyebrow>Still open</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>What the Finance Bill hasn&apos;t settled</h2>
          <p className="mt-4 max-w-3xl text-muted">
            The Finance (No. 2) Bill 2026, published on 19 October 2026, answers most questions about the account. These are
            still open, and the Bill itself can still change before it becomes law.
          </p>
          <dl className="mt-8 border-t border-line">
            {openQs.map((o) => (
              <div key={o.q} className="grid gap-2 border-b border-line py-4 md:grid-cols-2 md:gap-8">
                <dt className="font-semibold text-ink">{o.q}</dt>
                <dd className="text-sm leading-6 text-muted">{o.said}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={section}>
          <Eyebrow>Timeline</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>From announcement to opening day</h2>
          <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((t) => (
              <li key={t.date} className={`border-t-[3px] pt-4 ${t.state === "Done" ? "border-primary-500" : "border-line"}`}>
                <p className="text-sm font-semibold text-primary-500">{t.date}</p>
                <p className="mt-1 text-sm leading-6 text-ink">{t.what}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">{t.state}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={`${section} grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]`}>
          <div>
            <Eyebrow>Providers</Eyebrow>
            <h2 className={`mt-4 ${h2}`}>Who can offer it</h2>
            <p className="mt-4">Only regulated firms. Providers based elsewhere in the EEA can offer it too, and must run the Irish tax for you.</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Each provider must register with Revenue, which will publish the list. Credit unions are not among the types named
              in the Bill. We do not list brands: no provider has published its prices yet, and a list would read as a
              recommendation.
            </p>
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {[
              ["Investment firms and brokers", "Authorised under MiFID"],
              ["Banks", "Where they hold investment permissions"],
              ["Fund managers", "Regulated management companies"],
              ["Insurers", "For insurance-based investment products"],
            ].map(([title, body]) => (
              <div key={title} className="bg-surface-muted p-5">
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={section}>
          <Eyebrow>Questions</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>Common questions</h2>
          <div className="mt-6 max-w-3xl border-t border-line">
            <Accordion items={faqs.map((f) => ({ question: f.q, answer: f.a }))} />
          </div>
        </div>

        <div className={section}>
          <Eyebrow>Go further</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>Related tools on Irish Fintax</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.href} href={r.href} className="group block border border-line bg-surface p-6 transition-colors duration-200 hover:border-primary-300">
                <span className="font-display text-base font-medium text-ink group-hover:text-primary-500">
                  {r.label} <span aria-hidden="true" className="text-primary-500">→</span>
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">{r.body}</span>
              </Link>
            ))}
            <a
              href="https://www.ccpc.ie/manage-your-money/saving-and-investments/the-ccpc-investment-readiness-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="group block border border-line bg-surface p-6 transition-colors duration-200 hover:border-primary-300"
            >
              <span className="font-display text-base font-medium text-ink group-hover:text-primary-500">
                CCPC Investment Readiness Tool <span aria-hidden="true" className="text-primary-500">→</span>
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted">A short check from the CCPC on whether you are ready to invest.</span>
            </a>
          </div>
        </div>

        <div className={section}>
          <h2 className="font-display text-2xl font-semibold text-ink">Sources</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
            {sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">{s.label}</a>
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
