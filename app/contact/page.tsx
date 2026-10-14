import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { ContactForm } from "../components/contact-form";
import { site } from "../lib/content";
import { getT } from "../lib/messages";
import { contactMessages } from "../lib/messages/contact";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(contactMessages)).meta;
}

export default async function ContactPage() {
  const t = await getT(contactMessages);
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lede={t.hero.lede}
        image="teamMeeting"
      />

      <Container className="grid items-start gap-14 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-none border border-line bg-surface p-6 sm:p-8">
          <ContactForm />
        </div>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-28">
          <div className="rounded-none border-t-2 border-primary-400 bg-surface p-6 shadow-sm shadow-navy-900/5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t.nextHeading}
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              {t.nextSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-none bg-navy-900 text-xs font-semibold text-primary-300">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-ink-body">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-none border border-line bg-surface p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t.preferEmail}
            </h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 block text-sm font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
            >
              {site.email}
            </a>
          </div>
        </aside>
      </Container>
    </>
  );
}
