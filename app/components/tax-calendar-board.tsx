"use client";

import { useId, useState, type ReactNode } from "react";

/** One deadline, already in the page's language (TaxCalendar in sections.tsx). */
export interface CalendarRow {
  /** YYYY-MM-DD, for <time>. */
  date: string;
  day: string;
  /** "Oct 2026", in this language. */
  month: string;
  /** "31 October 2026", in this language. */
  long: string;
  audience: string;
  title: string;
  note: string;
  link: string;
  /** The Revenue page that states the date. */
  href: string;
}

/* The first four dates show; "View full calendar" opens the rest in place,
   since the full list is short enough not to need a page of its own. */
const SHOWN = 4;

export function TaxCalendarBoard({
  intro,
  rows,
  nextLabel,
  more,
  less,
}: {
  intro: ReactNode;
  rows: CalendarRow[];
  nextLabel: string;
  more: string;
  less: string;
}) {
  const [all, setAll] = useState(false);
  const listId = useId();
  const next = rows[0];
  const shown = all ? rows : rows.slice(0, SHOWN);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-[70px]">
      <div>
        {intro}
        <div className="mt-7 rounded-lg border border-primary-100 bg-surface-soft px-5 py-[18px]">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-primary-500">{nextLabel}</p>
          <p className="mt-1 text-sm leading-[1.65] text-ink">
            <time dateTime={next.date}>{next.long}</time> · {next.title}
          </p>
        </div>
        {rows.length > SHOWN && (
          <button
            type="button"
            aria-expanded={all}
            aria-controls={listId}
            onClick={() => setAll((value) => !value)}
            className="group mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {all ? less : more}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`transition-transform duration-200 ${all ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5l3 3 3-3" />
            </svg>
          </button>
        )}
      </div>

      <ol id={listId} className="border-t border-line">
        {shown.map((row) => (
          <li
            key={row.date}
            className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-5 gap-y-3 border-b border-line py-6 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6"
          >
            <time
              dateTime={row.date}
              className="flex h-[66px] flex-col items-center justify-center self-start rounded-[7px] bg-primary-500 text-white shadow-[0_10px_20px_-6px_rgb(37_64_168/0.6),inset_0_1px_0_rgb(255_255_255/0.2)] sm:h-[75px] sm:self-center"
            >
              <span className="font-display text-[26px] leading-none font-bold sm:text-[30px]">{row.day}</span>
              <span className="mt-1.5 text-[9px] leading-none tracking-[0.1em] uppercase">{row.month}</span>
            </time>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary-300">{row.audience}</p>
              <h3 className="mt-1.5 font-display text-lg leading-tight font-bold tracking-[-0.01em] text-ink sm:text-xl">
                {row.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-muted">{row.note}</p>
            </div>
            <a
              href={row.href}
              target="_blank"
              rel="noopener noreferrer"
              className="col-start-2 inline-flex items-center gap-1.5 justify-self-start text-xs font-bold whitespace-nowrap text-primary-500 transition-colors duration-200 hover:text-primary-600 sm:col-start-3 sm:justify-self-end"
            >
              {row.link}
              <span aria-hidden="true" className="inline-block rtl:-scale-x-100">↗</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
