import type { Metadata } from "next";
import Link from "../components/locale-link";
import { Container, PageHero, SectionHeading } from "../components/ui";
import { ContactCta } from "../components/sections";
import { Reveal } from "../components/reveal";
import { ClipReveal } from "../components/clip-reveal";
import { images } from "../lib/images";
import { getMessages, getT } from "../lib/messages";
import { FIGURES_LAST_CHECKED } from "../lib/content";
import { localDate } from "../lib/i18n";
import { aboutMessages } from "../lib/messages/about";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(aboutMessages)).meta;
}

/* What is actually on the site, each pointing at it. No firm story, team or
   credentials: this is a learning platform. Copy: aboutMessages.sections,
   paired by index. */
const sectionHrefs = ["/tools/ireland-income-tax", "/personal/mortgage", "/toolkits", "/contact"];

export default async function AboutPage() {
  const t = await getT(aboutMessages);
  const { locale } = await getMessages();
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lede={t.hero.lede}
        image="office"
      />

      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <SectionHeading eyebrow={t.whyEyebrow} title={t.whyTitle} />
          <div className="mt-6 flex flex-col gap-5 text-[15px] leading-7 text-ink-body">
            {t.body.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-5">
          <ClipReveal
            url={images.teamLaptops}
            className="h-48 w-full rounded-none"
          />
          {t.sections.map((section, i) => (
            <Link
              key={sectionHrefs[i]}
              href={sectionHrefs[i]}
              className="group border-s-2 border-primary-400 bg-surface py-1 ps-5"
            >
              <h3 className="font-display text-lg font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-500">
                {section.title} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {section.description}
              </p>
            </Link>
          ))}
        </Reveal>
      </Container>

      {/* How the figures are kept right: the site's trust story, since it
          names no firm or author. Sources and dates are on every calculator. */}
      <section id="how-we-check" className="scroll-mt-24 border-y border-line bg-surface-muted">
        <Container className="py-16 sm:py-20">
          <Reveal>
            <SectionHeading eyebrow={t.checkEyebrow} title={t.checkTitle} lede={t.checkIntro} />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {t.checks.map((check, i) => (
              <Reveal key={check.title} delay={i * 60}>
                <div className="h-full border border-line bg-surface p-6">
                  <h3 className="font-display text-lg font-medium tracking-tight text-ink">
                    {check.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-body">{check.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            {t.lastChecked.replace("{date}", localDate(locale, FIGURES_LAST_CHECKED))}
          </p>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
