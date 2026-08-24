import type { Metadata } from "next";
import { Breadcrumbs, Container, PageHero } from "../components/ui";
import { ContactCta } from "../components/sections";
import { ToolkitBrowser } from "../components/toolkit-browser";

export const metadata: Metadata = {
  title: "Founders Hub: memos, templates, tax & VAT forms",
  description:
    "Practical resources for founders and business owners: memos, templates, tax forms, VAT forms and business setup guides for Ireland and the UK, prepared by chartered accountants.",
};

const notes = [
  {
    title: "Prepared by accountants",
    body: "Every memo, template and walkthrough is drafted and reviewed by our chartered accountants, the same standards we apply to client work.",
  },
  {
    title: "Ireland & UK focused",
    body: "Aligned with Revenue and HMRC practice: the forms, thresholds and deadlines referenced are the ones you will actually deal with.",
  },
  {
    title: "Growing every month",
    body: "New memos, templates and guides are added regularly. If you need something that isn't here yet, just ask and we'll send it over.",
  },
];

export default function FoundersHubPage() {
  return (
    <>
      <PageHero
        image="office"
        breadcrumb={
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Founders Hub" }]}
          />
        }
        title="Founders Hub"
        lede="Memos, templates, tax and VAT forms, and step-by-step business setup guides: practical resources prepared by our accountants for founders in Ireland and the UK."
      />

      <Container className="py-16 sm:py-20">
        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <ToolkitBrowser />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {notes.map((note) => (
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
