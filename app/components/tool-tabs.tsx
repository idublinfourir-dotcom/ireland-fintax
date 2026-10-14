"use client";

/* The on-page tool switchers: the Accountants Hub (CalculatorTabs), the
   Personal Hub (PersonalTabs) and the shared ToolTabs they render. Client
   side so each tab reads its name in the page's language (toolNames); the
   tool lists themselves are plain data in calculator-tabs / personal-tabs. */

import Link from "./locale-link";
import { useT } from "./locale-link";
import { CALCULATOR_TOOLS, type ToolTab } from "./calculator-tabs";
import { PERSONAL_TOOLS } from "./personal-tabs";
import { toolNames } from "../lib/messages/tool-names";
import { calcMessages } from "../lib/messages/calc";

/* Tab body: uppercase label + two animated layers — a top/bottom rule that
   draws in and a green fill that grows down from it, turning the text white.
   Active = both layers locked on; inactive = they reveal on hover/focus. */
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

/** On-page switcher between the tools of one hub. `current` is the active
    tool's href; it renders as a locked (filled) tab, the rest as hover links.
    Shared so the Accountants Hub and the Personal Hub switchers stay identical. */
export function ToolTabs({
  heading,
  tools,
  current,
}: {
  heading: string;
  tools: readonly ToolTab[];
  current: string;
}) {
  const names = useT(toolNames);
  return (
    <nav aria-label={heading} className="mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {heading}
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-2">
        {tools.map((tool) => {
          const active = tool.href === current;
          return (
            <li key={tool.href}>
              {active ? (
                <span
                  aria-current="page"
                  className="group relative inline-block cursor-default"
                >
                  <TabInner label={names[tool.href]?.label ?? tool.label} active />
                </span>
              ) : (
                <Link
                  href={tool.href}
                  className="group relative inline-block outline-none"
                >
                  <TabInner label={names[tool.href]?.label ?? tool.label} active={false} />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The Accountants Hub switcher. */
export function CalculatorTabs({ current }: { current: string }) {
  const t = useT(calcMessages);
  return <ToolTabs heading={t.calculatorsHeading} tools={CALCULATOR_TOOLS} current={current} />;
}

/** The Personal Hub switcher. */
export function PersonalTabs({ current }: { current: string }) {
  const t = useT(calcMessages);
  return <ToolTabs heading={t.personalHeading} tools={PERSONAL_TOOLS} current={current} />;
}
