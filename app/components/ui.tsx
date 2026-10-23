import { Fragment, type CSSProperties, type ReactNode } from "react";
import Link from "./locale-link";
import { images, type ImageKey } from "../lib/images";
import { LocaleLink } from "./locale-link";
import type { Locale } from "../lib/i18n";
import { BreadcrumbNav, BudgetNoteLink } from "./calculator-fields";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "light",
  align = "left",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] ${
        align === "center" ? "justify-center" : ""
      } ${tone === "dark" ? "text-primary-300" : "text-primary-500"}`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Eyebrow align={align}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-display text-4xl font-bold leading-[1.03] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
        {title}
      </h2>
      {lede && <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-body sm:text-xl">{lede}</p>}
    </div>
  );
}

type ButtonVariant = "primary" | "outline" | "outlineLight";

const buttonBase =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none px-7 text-sm font-semibold tracking-wide transition-[color,background-color,border-color,transform] duration-200 ease-snappy active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500",
  outline:
    "border border-ink/20 text-ink hover:border-ink/40 hover:bg-ink/5 focus-visible:outline-ink/40",
  outlineLight:
    "border border-white/30 bg-white/5 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/15 focus-visible:outline-white/60",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
  locale,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  external?: boolean;
  /** The page's language, on pages that are translated (see LocaleLink). */
  locale?: Locale;
}) {
  const cls = `${buttonBase} ${buttonVariants[variant]} ${className}`;
  if (locale && !external) {
    return (
      <LocaleLink locale={locale} href={href} className={cls}>
        {children}
      </LocaleLink>
    );
  }
  if (external) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** A translated sentence with {placeholders} swapped for nodes, so a bold
    figure or a link can sit wherever the language puts it:
    fill("VAT paid: {vat}.", { vat: <b>€10</b> }). */
export function fill(template: string, values: Record<string, ReactNode>): ReactNode[] {
  return template
    .split(/\{(\w+)\}/)
    .map((part, i) => (i % 2 ? <Fragment key={i}>{values[part]}</Fragment> : part));
}

/** A translated title with its *emphasised* words wrapped in <em>. The
    sentence stays whole in the message file, so a language can move the
    emphasis instead of being handed two fragments to glue together. */
export function Emphasis({ text, className }: { text: string; className: string }) {
  return text.split("*").map((part, i) =>
    i % 2 ? (
      <em key={i} className={className}>
        {part}
      </em>
    ) : (
      part
    ),
  );
}

/** Compact photographic hero for inner pages. */
export function PageHero({
  eyebrow,
  title,
  lede,
  image = "tower",
  breadcrumb,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: string;
  image?: ImageKey;
  breadcrumb?: ReactNode;
  action?: ReactNode;
}) {
  const style: CSSProperties = { backgroundImage: `url(${images[image]})` };
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={style}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/90 to-navy-900/55"
      />
      <Container className="py-24 sm:py-32">
        <div className="max-w-3xl">
          <span className="animate-fade-up block">
            {breadcrumb ?? (eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>)}
          </span>
          <h1 className="animate-fade-up mt-6 flex flex-wrap items-center gap-3 font-display text-5xl font-bold leading-[0.98] tracking-[-0.025em] text-balance [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {lede && (
            <p className="animate-fade-up mt-6 max-w-xl text-lg leading-8 text-white/75 [animation-delay:150ms] sm:text-xl">
              {lede}
            </p>
          )}
          {action && (
            <div className="animate-fade-up mt-8 [animation-delay:220ms]">{action}</div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function Breadcrumbs({
  items,
  tone = "dark",
}: {
  items: { label: string; href?: string }[];
  tone?: "light" | "dark";
}) {
  const linkCls =
    tone === "dark"
      ? "text-white/60 hover:text-white"
      : "text-muted hover:text-ink";
  const currentCls = tone === "dark" ? "text-white/90" : "text-ink";
  const sepCls = tone === "dark" ? "text-white/30" : "text-line";
  return (
    <BreadcrumbNav>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em]">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={`${linkCls} transition-colors duration-200`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={currentCls} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className={sepCls}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </BreadcrumbNav>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 8.5l3.2 3.2L13 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A small chevron; points right, or down with `down`. Inside a
    `<details className="group">` it turns down as the details open. */
export function Chevron({ className = "", down = false }: { className?: string; down?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`h-3 w-3 shrink-0 ${className}`}>
      <path
        d={down ? "M2.5 4.5L6 8l3.5-3.5" : "M4.5 2.5L8 6l-3.5 3.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A labelled row: its name on the left from `lg`, its content on the right.
    The Budget planner's steps and its full list share it. */
export function GroupRow({
  title,
  children,
  className = "border-line py-6",
  titleClassName = "text-base",
}: {
  title: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={`grid gap-4 border-t lg:grid-cols-[12rem_1fr] lg:gap-10 ${className}`}>
      <h3 className={`font-display font-semibold text-ink ${titleClassName}`}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/** The line a calculator page carries about the newest Budget: what changed
    for this tool, then a link. It follows LATEST_BUDGET, so next October's
    Budget needs no edit here or on the pages. */
export function BudgetNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-sm leading-6 text-muted">
      {children} <BudgetNoteLink />
    </p>
  );
}
