import type { Metadata } from "next";
import Link from "../components/locale-link";
import { Container, fill, PageHero } from "../components/ui";
import { RETENTION_YEARS } from "../lib/retention";
import { localDate, plural } from "../lib/i18n";
import { getLocale, getT } from "../lib/messages";
import { privacyMessages } from "../lib/messages/privacy";

/* The privacy notice (GDPR Art. 13), in every language; the English one is
   the one that applies, and the others say so. Every statement here is
   checked against the code: change messages/privacy.ts, in every language,
   with any change to what is collected, who processes it or how long it is
   kept (lib/retention.ts, lib/auth/tokens.ts, lib/auth/reset-tokens.ts,
   lib/rate-limit.ts). The site names no firm: the controller is Irish
   Fintax, reached through the question form until it has its own mailbox. */

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(privacyMessages)).meta;
}

const UPDATED = "28 October 2026";

/* Pairs by index with processors.items in messages/privacy.ts. */
const PROCESSORS = ["Vercel", "MongoDB Atlas", "Zoho", "Google", "Unsplash"];

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

export default async function PrivacyPage() {
  const [t, locale] = await Promise.all([getT(privacyMessages), getLocale()]);
  const years = plural(locale, RETENTION_YEARS, t.years);
  const ask = (
    <Link href="/contact" className={link}>
      {t.ask}
    </Link>
  );
  return (
    <>
      <PageHero eyebrow={t.hero.eyebrow} title={t.hero.title} lede={t.hero.lede} image="office" />

      {/* Container fixes max-w-6xl; the reading column is narrowed inside it. */}
      <Container className="py-14 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm text-muted">{t.updated.replace("{date}", localDate(locale, UPDATED))}</p>
          {locale !== "en" && (
            <p className="mt-2 text-sm text-muted">
              {fill(t.translation, {
                english: (
                  <Link href="/privacy" locale="en" className={link}>
                    {t.englishLink}
                  </Link>
                ),
              })}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-10">
            <Section title={t.who.title}>
              <p>{fill(t.who.body, { ask })}</p>
            </Section>

            <Section title={t.calculators.title}>
              <p>{t.calculators.body}</p>
            </Section>

            <Section title={t.collect.title}>
              <ul className={list}>
                {t.collect.items.map((item) => (
                  <li key={item.label}>
                    <strong className="text-ink">{item.label}</strong> {item.body}
                  </li>
                ))}
              </ul>
              <p>{t.collect.basis}</p>
            </Section>

            <Section title={t.processors.title}>
              <ul className={list}>
                {t.processors.items.map((item, i) => (
                  <li key={PROCESSORS[i]}>
                    {fill(item, { name: <strong className="text-ink">{PROCESSORS[i]}</strong> })}
                  </li>
                ))}
              </ul>
              <p>{t.processors.outside}</p>
            </Section>

            <Section title={t.cookies.title}>
              <p>{t.cookies.body}</p>
            </Section>

            <Section title={t.keep.title}>
              <ul className={list}>
                <li>{t.keep.questions.replace("{years}", years)}</li>
                <li>{t.keep.resources.replace("{years}", years)}</li>
                <li>{t.keep.accounts}</li>
                <li>{t.keep.links}</li>
                <li>{t.keep.abuse}</li>
                <li>{t.keep.visits}</li>
              </ul>
            </Section>

            <Section title={t.rights.title}>
              <p>{fill(t.rights.body, { ask })}</p>
              <p>
                {fill(t.rights.complain, {
                  dpc: (
                    <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className={link}>
                      dataprotection.ie
                    </a>
                  ),
                })}
              </p>
            </Section>

            <Section title={t.changes.title}>
              <p>{t.changes.body}</p>
            </Section>
          </div>
        </div>
      </Container>
    </>
  );
}
