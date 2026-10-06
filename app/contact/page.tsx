import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { ContactForm } from "../components/contact-form";
import { site } from "../lib/content";

export const metadata: Metadata = {
  title: "Ask a question",
  description:
    "Ask a question about Irish tax or personal finance and get a plain-English answer by email. Free.",
};

const nextSteps = [
  "Pick a topic and ask it in your own words.",
  "A real person reads it and replies by email, in plain English.",
  "Ask while signed in and your questions and answers stay in your account.",
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Ask a question"
        title="Ask us anything about tax and money."
        lede="No question is too basic. Ask it the way you’d ask a friend and we’ll explain it in plain English. It’s free."
        image="teamMeeting"
      />

      <Container className="grid items-start gap-14 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-none border border-line bg-surface p-6 sm:p-8">
          <ContactForm />
        </div>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-28">
          <div className="rounded-none border-t-2 border-primary-400 bg-surface p-6 shadow-sm shadow-navy-900/5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              What happens next
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              {nextSteps.map((step, index) => (
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
              Prefer email?
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
