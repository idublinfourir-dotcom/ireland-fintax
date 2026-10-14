import type { Metadata } from "next";
import { Breadcrumbs, Container, PageHero } from "../components/ui";
import { ContactCta } from "../components/sections";
import { ToolkitBrowser } from "../components/toolkit-browser";
import { getT } from "../lib/messages";
import { toolkitMessages } from "../lib/messages/toolkits";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(toolkitMessages)).meta;
}

export default async function FoundersHubPage() {
  const t = await getT(toolkitMessages);
  return (
    <>
      <PageHero
        image="office"
        breadcrumb={
          <Breadcrumbs
            items={[{ label: t.home, href: "/" }, { label: t.title }]}
          />
        }
        title={t.title}
        lede={t.lede}
      />

      <Container className="py-16 sm:py-20">
        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <ToolkitBrowser />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.notes.map((note) => (
            <div key={note.title} className="rounded-none border border-line bg-surface p-6">
              <h2 className="font-display text-base font-medium tracking-tight text-ink">
                {note.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{note.body}</p>
            </div>
          ))}
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
