"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { LocaleLink } from "./locale-link";

export interface FaqEntry {
  question: string;
  answer: string;
  /** A "read more" under the answer: a site path, or an https:// URL that
      opens in a new tab. */
  link?: { label: string; href: string };
}

function AccordionItem({ question, answer, link, defaultOpen = false }: FaqEntry & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const panelId = useId();
  const external = link?.href.startsWith("http");

  return (
    <div className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-start text-[17px] font-medium text-ink"
      >
        {question}
        {/* a plus that loses its upright when open, so it reads as a minus */}
        <svg className="h-4 w-4 shrink-0 text-primary-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M8 2v12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className={`origin-center transition-transform duration-300 ${open ? "scale-y-0" : ""}`}
          />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-[60ch] pb-5 text-[15px] leading-7 text-muted">{answer}</p>
            {link && (
              <p className="-mt-1 pb-5">
                <LocaleLink
                  href={link.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
                >
                  {link.label}
                  <span aria-hidden="true" className="inline-block rtl:-scale-x-100">↗</span>
                </LocaleLink>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** `openFirst` starts with the first answer showing, as the home page does. */
export function Accordion({ items, openFirst = false }: { items: FaqEntry[]; openFirst?: boolean }) {
  return (
    <div>
      {items.map((item, i) => (
        <AccordionItem key={item.question} {...item} defaultOpen={openFirst && i === 0} />
      ))}
    </div>
  );
}
