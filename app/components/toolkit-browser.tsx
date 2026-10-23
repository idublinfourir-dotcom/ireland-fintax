"use client";

/* Founders Hub resource browser. The tab strip is a 1:1 visual copy of the
   Ireland-calculators switcher (calculator-tabs.tsx TabInner) so both hubs
   share one design language — the only difference is these tabs switch a
   category client-side instead of navigating between routes.

   Nothing is downloadable here by design: every entry comes from the catalogue
   in toolkit-content.ts and links to the request form, and a team member emails
   the file over by hand. */

import { useState } from "react";
import Link from "./locale-link";
import {
  TOOLKIT_CATEGORIES,
  toolkitSlug,
  type ToolkitCategory,
} from "../lib/toolkit-types";
import { STARTER_RESOURCES, type StarterResource } from "../lib/toolkit-content";
import { useT } from "./locale-link";
import { toolkitMessages, type ToolkitMessages } from "../lib/messages/toolkits";

/* ---------- tab visuals (mirrors calculator-tabs.tsx exactly) ---------- */

function TabInner({ label, active }: { label: string; active: boolean }) {
  return (
    <>
      <span
        className={`relative z-10 block px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${
          active ? "text-white" : "text-ink group-hover:text-white group-focus-visible:text-white"
        }`}
      >
        {label}
      </span>
      {/* top & bottom rule */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 origin-center border-y-2 border-primary-500 transition-all duration-300 ${
          active
            ? "scale-y-100 opacity-100"
            : "scale-y-[2] opacity-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:scale-y-100 group-focus-visible:opacity-100"
        }`}
      />
      {/* fill */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 inset-y-[2px] origin-top bg-primary-500 transition-all duration-300 ${
          active
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        }`}
      />
    </>
  );
}

/* ---------- shared bits ---------- */

const ctaLink =
  "whitespace-nowrap text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600";

function Badge({ tone, children }: { tone: "framework" | "format"; children: React.ReactNode }) {
  const cls =
    tone === "framework"
      ? "bg-secondary-50 text-secondary-600"
      : "bg-surface-muted text-muted";
  return (
    <span className={`shrink-0 rounded-none px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

/* ---------- catalogue list ---------- */

function StarterRow({ resource, t }: { resource: StarterResource; t: ToolkitMessages }) {
  const text = t.resources[resource.title] ?? resource;
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-medium text-ink">{text.title}</p>
          {resource.framework && <Badge tone="framework">{resource.framework}</Badge>}
          <Badge tone="format">{resource.format}</Badge>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted">{text.description}</p>
      </div>
      <Link
        href={`/toolkits/request/${toolkitSlug(resource.title)}`}
        className={`${ctaLink} shrink-0`}
      >
        {t.browser.request} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
      </Link>
    </li>
  );
}

function StarterList({ items, t }: { items: StarterResource[]; t: ToolkitMessages }) {
  return (
    <ul className="divide-y divide-line rounded-none border border-line bg-surface-muted/40">
      {items.map((resource) => (
        <StarterRow key={resource.title} resource={resource} t={t} />
      ))}
    </ul>
  );
}

/* ---------- browser ---------- */

export function ToolkitBrowser() {
  const t = useT(toolkitMessages);
  /* Only show a tab that has something behind it. */
  const categories = TOOLKIT_CATEGORIES.filter((c) =>
    STARTER_RESOURCES.some((r) => r.category === c.value),
  );
  const [active, setActive] = useState<ToolkitCategory>(
    categories[0]?.value ?? "memo",
  );

  const items = STARTER_RESOURCES.filter((r) => r.category === active);

  return (
    <div>
      <nav aria-label={t.browser.nav} className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.browser.heading}
        </p>
        <div role="tablist" className="flex flex-wrap gap-x-3 gap-y-2">
          {categories.map((category) => {
            const isActive = category.value === active;
            return (
              <button
                key={category.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(category.value)}
                className="group relative inline-block cursor-pointer outline-none"
              >
                <TabInner label={t.browser.tabs[category.value]} active={isActive} />
              </button>
            );
          })}
        </div>
      </nav>

      <p className="text-sm leading-6 text-muted">{t.browser.intros[active]}</p>

      {items.length > 0 && (
        <section className="mt-8">
          <p className="mb-4 text-sm leading-6 text-muted">
            {t.browser.nothingToDownload}
          </p>
          <StarterList items={items} t={t} />
        </section>
      )}
    </div>
  );
}
