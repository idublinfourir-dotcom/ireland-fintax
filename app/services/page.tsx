import type { Metadata } from "next";
import Link from "next/link";
import { Button, Container, PageHero, CheckIcon } from "../components/ui";
import { ContactCta } from "../components/sections";
import { Reveal } from "../components/reveal";
import { serviceCategories } from "../lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Accounting, tax, business consulting, digital transformation, AI and fractional CFO services for businesses across Ireland.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything your finance function needs."
        lede="From day-to-day bookkeeping to AI and international expansion, built for businesses across Ireland. Take one service or the whole stack, scoped upfront."
        image="tower"
      />

      <Container className="py-16 sm:py-20">
        <Reveal>
        <div className="grid gap-px overflow-hidden border border-line bg-line lg:grid-cols-2">
          {serviceCategories.map((category, index) => {
            const comingSoon = category.status === "coming-soon";
            const previews =
              category.items.length > 0
                ? category.items.slice(0, 4).map((item) => item.title)
                : (category.included ?? []).slice(0, 4);
            return (
              <article
                key={category.slug}
                className="group relative flex flex-col bg-surface p-8 transition-colors duration-200 hover:bg-secondary-50/50"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-0.5 w-0 bg-primary-400 transition-all duration-300 group-hover:w-full"
                />
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-sm font-semibold text-primary-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/services/${category.slug}`}
                    className="relative z-10 text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
                  >
                    {comingSoon ? "Learn more" : "Explore"}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <h2 className="mt-3 flex flex-wrap items-center gap-2.5 font-display text-2xl font-medium tracking-tight text-ink">
                  <Link
                    href={`/services/${category.slug}`}
                    className="transition-colors duration-200 before:absolute before:inset-0 before:content-[''] hover:text-primary-500"
                  >
                    {category.title}
                  </Link>
                  {comingSoon && (
                    <span className="rounded-none bg-secondary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-500">
                      Soon
                    </span>
                  )}
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-muted">
                  {category.blurb}
                </p>
                {previews.length > 0 && (
                  <ul className="mt-5 grid gap-2.5 border-t border-line pt-5 sm:grid-cols-2">
                    {previews.map((title) => (
                      <li
                        key={title}
                        className="flex items-start gap-2.5 text-sm text-ink-body"
                      >
                        <span className="mt-1 text-primary-500">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                        {title}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
        </Reveal>

        <Reveal>
        <div className="mt-14 flex flex-col items-center gap-3 rounded-none border-t-2 border-primary-400 bg-surface px-8 py-12 text-center shadow-sm shadow-navy-900/5">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
            Not sure what you need?
          </h2>
          <p className="max-w-md text-[15px] leading-7 text-muted">
            Start with a free discovery call. We’ll look at where things stand
            and recommend only what earns its fee.
          </p>
          <Button href="/contact" className="mt-3">
            Book a discovery call
          </Button>
        </div>
        </Reveal>
      </Container>

      <ContactCta />
    </>
  );
}
