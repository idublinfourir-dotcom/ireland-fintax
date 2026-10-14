import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Container, PageHero } from "../../../components/ui";
import { ResourceRequestForm } from "../../../components/resource-request-form";
import { findRequestableResourceBySlug } from "../../../lib/toolkit-content";
import { getT } from "../../../lib/messages";
import { toolkitMessages } from "../../../lib/messages/toolkits";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await getT(toolkitMessages)).request.meta,
    robots: { index: false, follow: true },
  };
}

export default async function RequestResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = findRequestableResourceBySlug(slug);
  if (!resource) notFound();
  const t = await getT(toolkitMessages);
  const text = t.resources[resource.title] ?? resource;

  return (
    <>
      <PageHero
        image="office"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: t.home, href: "/" },
              { label: t.title, href: "/toolkits" },
              { label: t.request.title },
            ]}
          />
        }
        title={t.request.title}
        lede={t.request.lede}
      />

      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-xl">
          {/* What they are asking for, so the form is never ambiguous. */}
          <div className="rounded-none border-l-2 border-primary-500 bg-surface-muted p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t.request.requesting}
            </p>
            <h2 className="mt-1.5 font-display text-lg font-medium tracking-tight text-ink">
              {text.title}
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
              {t.browser.categories[resource.category]}
              {resource.framework ? ` · ${resource.framework}` : ""}
            </p>
            {text.description && (
              <p className="mt-2.5 text-sm leading-6 text-muted">
                {text.description}
              </p>
            )}
          </div>

          <div className="mt-8">
            <ResourceRequestForm slug={slug} />
          </div>

          <p className="mt-8 text-xs leading-5 text-muted">
            {t.request.privacy}
          </p>
        </div>
      </Container>
    </>
  );
}
