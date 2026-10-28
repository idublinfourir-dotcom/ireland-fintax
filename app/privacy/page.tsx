import type { Metadata } from "next";
import Link from "../components/locale-link";
import { Container, PageHero } from "../components/ui";
import { RETENTION_YEARS } from "../lib/retention";

/* The privacy notice (GDPR Art. 13). English only, like the other legal-ish
   pages. Every statement here is checked against the code: change the page
   with any change to what is collected, who processes it or how long it is
   kept (lib/retention.ts, lib/auth/tokens.ts, lib/auth/reset-tokens.ts,
   lib/rate-limit.ts). The site names no firm: the controller is Irish Fintax,
   reached through the question form until it has its own mailbox. */

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Irish Fintax collects, why, who handles it and how long it is kept.",
};

const UPDATED = "28 October 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-7 text-ink-body">{children}</div>
    </section>
  );
}

const list = "flex list-disc flex-col gap-2 ps-5 marker:text-primary-400";
const link = "font-medium text-primary-500 underline underline-offset-2 hover:text-primary-600";

export default function PrivacyPage() {
  const years = `${RETENTION_YEARS} years`;
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Your data on Irish Fintax."
        lede="What the site collects, why, who handles it and how long it is kept."
        image="office"
      />

      {/* Container fixes max-w-6xl; the reading column is narrowed inside it. */}
      <Container className="py-14 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm text-muted">Last updated {UPDATED}.</p>

          <div className="mt-8 flex flex-col gap-10">
            <Section title="Who is responsible">
              <p>
                Irish Fintax (irishfintax.ie) is a site for learning about Irish tax and
                personal finance. Irish Fintax decides how the personal data described here is
                used. For anything about your data, send a message through{" "}
                <Link href="/contact" className={link}>
                  Ask a question
                </Link>
                .
              </p>
            </Section>

            <Section title="The calculators">
              <p>
                The calculators work in your browser. The figures you type are not sent to us or
                stored, and you do not need an account to use them.
              </p>
            </Section>

            <Section title="What we collect, and why">
              <ul className={list}>
                <li>
                  <strong className="text-ink">When you ask a question:</strong> your name, email
                  address, company if you give one, the topic you pick, your message and our
                  replies. We use them to answer you. If you have an account with the same
                  confirmed email address, the question also appears in your account.
                </li>
                <li>
                  <strong className="text-ink">When you create an account:</strong> your name,
                  email address and password. The password is stored only in a scrambled form (a
                  one-way hash) that cannot be turned back into the password. If you sign in with
                  Google, Google gives us your name, email address and the address of your
                  profile picture instead.
                </li>
                <li>
                  <strong className="text-ink">When you request a resource from the Accounting
                  Hub:</strong> your name, phone number, email address, website and what you need
                  it for. We use them to send you the resource.
                </li>
                <li>
                  <strong className="text-ink">When you visit a page:</strong> Vercel Web Analytics
                  counts the visit. It records the page address (without anything after a
                  &ldquo;?&rdquo;), the site you came from, your country and city, and your
                  device, browser and operating system. It sets no cookies and does not identify
                  you: visits are told apart by a scrambled value worked out from the request,
                  which is thrown away after 24 hours. Sign-in, account and admin pages are not
                  counted. We use the totals to see which pages are useful.
                </li>
                <li>
                  <strong className="text-ink">To stop abuse:</strong> the site counts sign-in and
                  form attempts. It keeps only a scrambled form of your IP address and email
                  address, never the addresses themselves.
                </li>
                <li>
                  <strong className="text-ink">Emails we send:</strong> a link to confirm your
                  address, codes to reset your password, an acknowledgement when you ask a
                  question, and our replies.
                </li>
              </ul>
              <p>
                We use this data to do what you asked for (answer your question, run your account,
                send a resource), and to keep the site secure and see which pages are used, which
                is in our legitimate interest.
              </p>
            </Section>

            <Section title="Who handles it for us">
              <ul className={list}>
                <li>
                  <strong className="text-ink">Vercel</strong> hosts the site, on servers in
                  Dublin, and counts visits (Web Analytics, above). Like any host it keeps
                  short-lived request logs (time, page and IP address).
                </li>
                <li>
                  <strong className="text-ink">MongoDB Atlas</strong> stores the database, on
                  Amazon Web Services in Dublin.
                </li>
                <li>
                  <strong className="text-ink">Zoho</strong> delivers the emails we send.
                </li>
                <li>
                  <strong className="text-ink">Google</strong>, only if you choose to sign in with
                  Google.
                </li>
                <li>
                  <strong className="text-ink">Unsplash</strong> serves some of the photos, so your
                  browser fetches them from Unsplash&apos;s servers, as it does for any image
                  hosted elsewhere.
                </li>
              </ul>
              <p>
                Some of these companies are based outside the EU and may handle data there under
                the safeguards in their own terms. We do not sell your data or use it for
                advertising.
              </p>
            </Section>

            <Section title="Cookies">
              <p>
                Only the cookies needed to sign in: one keeps you signed in, one protects the
                sign-in form, and one remembers which page to return to. Visits are counted
                without cookies, and there are no advertising cookies, so there is nothing to
                accept or decline.
              </p>
            </Section>

            <Section title="How long we keep it">
              <ul className={list}>
                <li>Questions and our replies: deleted automatically {years} after the last message.</li>
                <li>Resource requests: deleted automatically {years} after the request.</li>
                <li>
                  Accounts: kept until you delete yours (Settings, then Delete my account) or ask
                  us to. Deleting an account also deletes your questions and our replies.
                </li>
                <li>
                  Email confirmation links expire after 24 hours and password reset codes after 15
                  minutes; both are then deleted.
                </li>
                <li>Abuse-prevention counts: deleted after 8 days.</li>
                <li>
                  Visit counts: kept by Vercel as totals; the value that tells visits apart is
                  thrown away after 24 hours.
                </li>
              </ul>
            </Section>

            <Section title="Your rights">
              <p>
                You can ask to see the data we hold about you, have it corrected or deleted, or
                object to how we use it. Send a message through{" "}
                <Link href="/contact" className={link}>
                  Ask a question
                </Link>{" "}
                saying what you need, and we will reply within one month.
              </p>
              <p>
                If you are not happy with our answer, you can complain to the Data Protection
                Commission at{" "}
                <a
                  href="https://www.dataprotection.ie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  dataprotection.ie
                </a>
                .
              </p>
            </Section>

            <Section title="Changes">
              <p>When this notice changes, the date at the top changes with it.</p>
            </Section>
          </div>
        </div>
      </Container>
    </>
  );
}
