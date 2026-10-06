import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  Button,
  Container,
  Eyebrow,
  PageHero,
  CheckIcon,
} from "../../components/ui";
import { ContactCta, RelatedServices } from "../../components/sections";
import { Reveal } from "../../components/reveal";
import { serviceCategories, getCategory, site } from "../../lib/content";

export function generateStaticParams() {
  return serviceCategories.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return { title: cat.title, description: cat.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const comingSoon = cat.status === "coming-soon";
  const isPersona = cat.kind === "personas";
  const isSingle = cat.kind === "single";

  return (
    <>
      <PageHero
        image="office"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: cat.title },
            ]}
          />
        }
        title={
          <>
            {cat.title}
            {comingSoon && (
              <span className="rounded-none bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-300">
                Coming soon
              </span>
            )}
          </>
        }
        lede={cat.blurb}
        action={
          <Button href="/contact">
            {comingSoon
              ? "Register your interest"
              : `Talk to us about ${cat.title.toLowerCase()}`}
          </Button>
        }
      />

      {/* services / personas: grid of sub-service cards */}
      {!comingSoon && !isSingle && (
        <Container className="py-14 sm:py-16">
          <Reveal className="max-w-3xl">
          <p className="text-lg leading-8 text-ink-body sm:text-xl">
            {cat.overview}
          </p>
          <div className="mt-10 border-t border-line pt-10">
            <Eyebrow>{isPersona ? "Who we help" : "What this covers"}</Eyebrow>
            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              {isPersona
                ? "Specialist support by profession"
                : `${cat.items.length} ways we help`}
            </h2>
          </div>
          </Reveal>
          <Reveal>
          <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {cat.items.map((item, index) => (
              <Link
                key={item.slug}
                href={`/services/${cat.slug}/${item.slug}`}
                className="group relative flex flex-col bg-surface p-7 transition-colors duration-200 hover:bg-secondary-50/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-0.5 w-0 bg-primary-400 transition-all duration-300 group-hover:w-full"
                />
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-sm font-semibold text-primary-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-primary-500">
                    Details{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-500">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-7 text-muted">
                  {item.blurb}
                </p>
                {item.included.length > 0 && (
                  <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
                    {item.included.slice(0, 3).map((entry) => (
                      <li
                        key={entry}
                        className="flex items-start gap-2.5 text-sm leading-6 text-ink-body"
                      >
                        <span className="mt-1 text-primary-500">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                        {entry}
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            ))}
          </div>
          </Reveal>
        </Container>
      )}

      {/* single: included list + sticky CTA / best-for aside */}
      {!comingSoon && isSingle && (
        <Container className="grid items-start gap-12 py-14 sm:py-16 lg:grid-cols-[1fr_22rem]">
          <Reveal>
            <p className="max-w-2xl border-l-[3px] border-primary-500 pl-6 font-display text-xl font-light leading-9 text-ink sm:text-[1.7rem] sm:leading-[2.6rem]">
              {cat.overview}
            </p>
            <div className="mt-12 flex items-baseline justify-between gap-4 border-t border-line pt-6">
              <Eyebrow>What’s included</Eyebrow>
              <span className="font-display text-sm font-semibold text-primary-500">
                {String((cat.included ?? []).length).padStart(2, "0")} items
              </span>
            </div>
            <ul className="mt-2 divide-y divide-line border-b border-line">
              {(cat.included ?? []).map((entry) => {
                const [label, ...rest] = entry.split(": ");
                const detail = rest.join(": ");
                return (
                  <li
                    key={entry}
                    className="group flex items-baseline gap-4 py-5 transition-colors duration-200 hover:bg-secondary-50/40"
                  >
                    <span className="mt-1 shrink-0 text-primary-500">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[15px] leading-7 text-muted">
                      <span className="font-display font-semibold text-ink">
                        {label}
                      </span>
                      {detail && <>: {detail}</>}
                    </p>
                  </li>
                );
              })}
            </ul>

            {cat.context && (
              <div className="mt-12 border-t border-line pt-10">
                <Eyebrow>What you should know</Eyebrow>
                <div className="mt-5 max-w-2xl space-y-5 text-[15px] leading-7 text-ink-body">
                  {cat.context.split("\n\n").map((para) => (
                    <p key={para.slice(0, 32)}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
            <div className="rounded-none bg-navy-900 p-7 text-white">
              <h2 className="font-display text-lg font-medium tracking-tight">
                Talk to us about {cat.title.toLowerCase()}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                A partner-led conversation, scoped to your situation. No pitch,
                no obligation.
              </p>
              <Button href="/contact" className="mt-5 w-full">
                Book a free consultation
              </Button>
              <a
                href={site.phoneHref}
                className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-primary-300 transition-colors duration-200 hover:text-primary-400"
              >
                {site.phone}
              </a>
            </div>
            {(cat.bestFor ?? []).length > 0 && (
              <div className="rounded-none border-t-2 border-primary-400 bg-surface p-6 shadow-sm shadow-navy-900/5">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Best for
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {(cat.bestFor ?? []).map((entry) => (
                    <li
                      key={entry}
                      className="border-l-2 border-primary-400 pl-3 text-sm leading-6 text-ink-body"
                    >
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      )}

      {/* coming soon: simple reassurance block */}
      {comingSoon && (
        <Container className="py-16 sm:py-20">
          <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-none border-t-2 border-primary-400 bg-surface px-8 py-12 text-center shadow-sm shadow-navy-900/5">
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
              We’re building this service
            </h2>
            <p className="text-[15px] leading-7 text-muted">
              Tell us what you need and we’ll be in touch the moment it launches,
              or sooner, if we can already help.
            </p>
            <Button href="/contact" className="mt-3">
              Register your interest
            </Button>
          </Reveal>
        </Container>
      )}

      <RelatedServices currentSlug={cat.slug} heading="Other service areas" />

      <ContactCta />
    </>
  );
}
