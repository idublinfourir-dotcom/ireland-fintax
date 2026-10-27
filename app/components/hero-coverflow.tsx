"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { LocaleLink, useLocale, useT } from "./locale-link";
import { useFormat } from "./calculator-fields";
import { RTL_LOCALES, plural } from "../lib/i18n";
import { heroCardMessages } from "../lib/messages/hero-cards";
import { toolNames } from "../lib/messages/tool-names";
import { computeIrishTax, type YearRates } from "../lib/ireland-income-tax";
import { addVat, getVatRate, removeVat, type VatConfig, type VatRateKey } from "../lib/ireland-vat";
import { computeCorporationTax, type CtConfig } from "../lib/ireland-corporation-tax";
import { computeRdCredit, type RdConfig } from "../lib/ireland-rd-tax-credit";
import { computeCapitalAllowance, type AssetKey, type CaConfig } from "../lib/ireland-capital-allowances";
import { computeCgt, type CgtConfig } from "../lib/ireland-cgt";
import { computeCat, type BenefitType, type CatConfig, type Relationship } from "../lib/ireland-cat";
import { monthlyPayment } from "../lib/ireland-mortgage";

/* The home hero's coverflow: one live card per calculator page, each running
   that page's own module on the rates the page uses (loaded in Hero), so a
   card never shows a figure its calculator would not. Ported from the
   "Coverflow Right" design export: spring-eased 3D fan (motion), drag, autoplay. */

export interface HeroCardsData {
  year: number;
  rates: YearRates;
  vat: VatConfig;
  ct: CtConfig;
  rd: RdConfig;
  ca: CaConfig;
  cgt: CgtConfig;
  cat: CatConfig;
  /** Median owner-occupier rate on the mortgage page, as the card's start. */
  mortgageRate: number;
}

type CardProps = { d: HeroCardsData; n: number };

const DWELL = 4000; // ms per card on autoplay
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Phones get a native scroll-snap strip (hero-flow.css), not the 3D fan. */
const phone = () => matchMedia("(max-width: 767px)").matches;

/** The fan, for a card `d` places from the front (negative = towards the copy). */
function fan(d: number) {
  const ad = Math.abs(d), side = Math.sign(d);
  return {
    ad,
    side,
    scale: ad <= 1 ? 1 - ad * 0.16 : 0.84 - (Math.min(ad, 3) - 1) * 0.12,
    /** Sideways shift in card widths. */
    shift: side * (ad <= 1 ? ad * 0.7 : 0.7 + (ad - 1) * 0.44),
    z: -Math.min(ad, 3) * 60,
    turn: -side * Math.min(ad, 1) * 24,
  };
}

export function HeroCoverflow({ data }: { data: HeroCardsData }) {
  const t = useT(heroCardMessages);
  const names = useT(toolNames);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  // pos is the card under the eye (fractional while moving); target is where it settles.
  const pos = useMotionValue(0);
  const target = useRef(0);
  const pan = useRef<number | null>(null);
  const moved = useRef(false);
  // When the cards were last touched: autoplay waits DWELL after it.
  const touched = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const N = CARDS.length;
  const rtl = RTL_LOCALES.includes(useLocale());
  const dir = () => (stage.current && getComputedStyle(stage.current).direction === "rtl" ? -1 : 1);
  const unit = () => (cards.current[0]?.offsetWidth || 340) * 0.7;
  const wrap = (k: number) => ((k % N) + N * 1.5) % N - N / 2;

  const go = (to: number) => {
    target.current = to;
    if (!phone()) {
      animate(pos, to, { type: "spring", stiffness: 14, damping: 7.5 });
      return;
    }
    // scrollBy, not scrollIntoView: that would also scroll the page to the card.
    const el = cards.current[((Math.round(to) % N) + N) % N], tr = stage.current;
    if (!el || !tr) return;
    const a = el.getBoundingClientRect(), b = tr.getBoundingClientRect();
    tr.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: "smooth" });
  };
  const step = (by: number) => go(Math.round(target.current) + by);

  // Every change of pos lays the fan out; nothing runs once it settles.
  useEffect(() => {
    const layout = () => {
      if (phone()) {
        // The strip lays itself out; drop whatever the fan last wrote.
        cards.current.forEach((c) => c?.removeAttribute("style"));
        return;
      }
      const p = pos.get(), side0 = dir();
      const cw = cards.current[0]?.offsetWidth || 340;
      const W = stage.current?.clientWidth ?? 0, fade = W * 0.12;
      const tilt = clamp(-pos.getVelocity() * 4.2 * side0, -18, 18);
      const vp = ((p % N) + N) % N;
      cards.current.forEach((c, i) => {
        if (!c) return;
        const f = fan(wrap(i - vp) * side0);
        const x = f.shift * cw;
        c.style.transform = `translate3d(${x}px,0,${f.z}px) rotateY(${f.turn + tilt * 0.4}deg) scale(${f.scale})`;
        c.style.zIndex = String(100 - Math.round(f.ad * 10));
        c.style.visibility = f.ad > 3.3 ? "hidden" : "";
        c.style.setProperty("--dim", String(Math.min(f.ad * 0.16, 0.45)));
        // Fade a card as it slides under the copy: the last 12% of the stage
        // on the copy side. Per card, not one mask on the stage: a masked
        // ancestor stops Chrome's backdrop-filter, and the frost with it.
        const half = (cw * f.scale) / 2;
        const centre = c.offsetLeft + cw / 2 + x;
        const edge = (side0 > 0 ? centre : W - centre) - half; // copy-side edge, from the stage's start
        const end = (fade - edge) / (half * 2);
        const mask = end > 0 ? `linear-gradient(to ${side0 > 0 ? "right" : "left"}, transparent ${(-edge / (half * 2)) * 100}%, #000 ${end * 100}%)` : "";
        c.style.setProperty("mask-image", mask);
        c.style.setProperty("-webkit-mask-image", mask);
      });
      setActive(((Math.round(p) % N) + N) % N);
    };
    layout();
    addEventListener("resize", layout);
    const off = pos.on("change", layout);
    return () => {
      off();
      removeEventListener("resize", layout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, N]);

  // Autoplay: always on unless paused with the button. Touching the cards
  // (a drag, a slider, a toggle) restarts the wait, so a card never slides
  // away mid-use. Plays under prefers-reduced-motion too, at the owner's ask;
  // the pause button is the way to stop it.
  useEffect(() => {
    if (paused) return;
    touched.current = Date.now();
    const id = setInterval(() => {
      if (pan.current === null && Date.now() - touched.current >= DWELL) {
        touched.current = Date.now();
        step(1);
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // A horizontal wheel (trackpad swipe) turns the cards; a vertical one scrolls the page.
  // Native listener: React's onWheel is passive and cannot preventDefault.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let timer = 0;
    const wheel = (ev: WheelEvent) => {
      if (phone() || Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return;
      ev.preventDefault();
      target.current += (clamp(ev.deltaX, -180, 180) * dir()) / 360;
      pos.set(target.current);
      clearTimeout(timer);
      timer = window.setTimeout(() => go(Math.round(target.current)), 120);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hf-wrap">
      <motion.div
        ref={stage}
        className="hf-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label={t.carousel}
        onPointerDown={() => {
          moved.current = false;
          touched.current = Date.now();
        }}
        onInput={() => (touched.current = Date.now())}
        onScroll={(ev) => {
          // Phones: the card nearest the strip's centre is the active one.
          const mid = ev.currentTarget.getBoundingClientRect();
          const c = mid.left + mid.width / 2;
          let best = 0;
          cards.current.forEach((el, i) => {
            const r = el?.getBoundingClientRect(), b = cards.current[best]?.getBoundingClientRect();
            if (r && b && Math.abs(r.left + r.width / 2 - c) < Math.abs(b.left + b.width / 2 - c)) best = i;
          });
          target.current = best;
          setActive(best);
        }}
        onPanStart={(ev) => {
          // Phones scroll natively; sliders, radios and links keep their own drag.
          if (phone() || (ev.target as Element).closest("input, button, a, label")) return;
          pos.stop();
          pan.current = pos.get();
          moved.current = true;
        }}
        onPan={(_, info) => {
          if (pan.current !== null) pos.set(pan.current - (info.offset.x * dir()) / unit());
        }}
        onPanEnd={(_, info) => {
          if (pan.current === null) return;
          const start = pan.current, moved = pos.get() - start;
          pan.current = null;
          const fling = (-info.velocity.x * dir()) / unit();
          // A quick short flick moves one card; a longer drag settles on the
          // nearest card. Either way one swipe never skips a card.
          go(Math.abs(moved) < 0.5 && Math.abs(fling) > 0.4 ? Math.round(start) + Math.sign(fling) : Math.round(pos.get()));
        }}
        onKeyDown={(ev) => {
          // Sliders and radios use the arrow keys themselves.
          touched.current = Date.now();
          if ((ev.target as Element).matches("input")) return;
          const by = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
          if (!by) return;
          ev.preventDefault();
          step(by * dir());
        }}
      >
        {CARDS.map(({ href, Card }, i) => (
          <article
            key={href}
            ref={(el) => {
              cards.current[i] = el;
            }}
            className={`hf-card${i === active ? " is-active" : ""}`}
            style={startStyle(wrap(i) * (rtl ? -1 : 1))}
            aria-roledescription="slide"
            aria-label={t.slide
              .replace("{name}", names[href]?.label ?? href)
              .replace("{n}", String(i + 1))
              .replace("{total}", String(N))}
            onClick={(ev) => {
              if (i !== active && !moved.current) {
                ev.preventDefault();
                go(Math.round(target.current) + wrap(i - active));
              }
            }}
          >
            <div className="hf-shine" aria-hidden="true" />
            <div className="hf-body" inert={i !== active}>
              <Card d={data} n={i + 1} />
            </div>
          </article>
        ))}
      </motion.div>
      <div className="hf-controls">
        <span className="hf-hint">{t.hint}</span>
        <div className="hf-dots">
          {CARDS.map(({ href }, i) => (
            <button
              key={href}
              type="button"
              aria-current={i === active}
              aria-label={t.slide.replace("{name}", names[href]?.label ?? href).replace("{n}", String(i + 1)).replace("{total}", String(N))}
              onClick={() => go(Math.round(target.current) + wrap(i - active))}
            />
          ))}
        </div>
        <button type="button" className="hf-btn hf-step" onClick={() => step(-1)} aria-label={t.prev}>
          <span aria-hidden="true" className="inline-block rtl:-scale-x-100">←</span>
        </button>
        <button type="button" className="hf-btn" onClick={() => setPaused(!paused)} aria-label={paused ? t.play : t.pause}>
          <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
        </button>
        <button type="button" className="hf-btn hf-step" onClick={() => step(1)} aria-label={t.next}>
          <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
        </button>
      </div>
    </div>
  );
}

/** The fan at rest on card 1, written by the server so the first paint is the
    fan, not eight cards stacked with the last on top. The layout effect then
    takes over with measured pixels. Cards two or more back on the copy side
    stay hidden until it does: only it can fade them under the copy. */
function startStyle(d: number): CSSProperties {
  const f = fan(d);
  return {
    transform: `translate3d(calc(var(--cw) * ${f.shift}),0,${f.z}px) rotateY(${f.turn}deg) scale(${f.scale})`,
    zIndex: 100 - Math.round(f.ad * 10),
    visibility: f.ad > 3.3 || (f.side < 0 && f.ad >= 2) ? "hidden" : undefined,
    ["--dim" as string]: Math.min(f.ad * 0.16, 0.45),
  };
}

/* ---------- card parts ---------- */

/* Card icons: Phosphor Icons "fill" (MIT), as in the design export. */
const ICONS: Record<string, string> = {
  "/tools/ireland-income-tax": "M216 64H56a8 8 0 0 1 0-16h136a8 8 0 0 0 0-16H56a24 24 0 0 0-24 24v128a24 24 0 0 0 24 24h160a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m-36 80a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  "/tools/ireland-vat": "M216 40H40a16 16 0 0 0-16 16v152a8 8 0 0 0 11.58 7.15L64 200.94l28.42 14.21a8 8 0 0 0 7.16 0L128 200.94l28.42 14.21a8 8 0 0 0 7.16 0L192 200.94l28.42 14.21A8 8 0 0 0 232 208V56a16 16 0 0 0-16-16m-40 104H80a8 8 0 0 1 0-16h96a8 8 0 0 1 0 16m0-32H80a8 8 0 0 1 0-16h96a8 8 0 0 1 0 16",
  "/tools/ireland-corporation-tax": "M239.73 208H224V96a16 16 0 0 0-16-16h-44a4 4 0 0 0-4 4v124h-16V32.41a16.43 16.43 0 0 0-6.16-13a16 16 0 0 0-18.72-.69L39.12 72A16 16 0 0 0 32 85.34V208H16.27A8.18 8.18 0 0 0 8 215.47a8 8 0 0 0 8 8.53h224a8 8 0 0 0 8-8.53a8.18 8.18 0 0 0-8.27-7.47M76 184a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm40 56a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Z",
  "/tools/ireland-rd-tax-credit": "M221.69 199.77L160 96.92V40h8a8 8 0 0 0 0-16H88a8 8 0 0 0 0 16h8v56.92L34.31 199.77A16 16 0 0 0 48 224h160a16 16 0 0 0 13.72-24.23Zm-90.08-42.91c-15.91-8.05-31.05-12.32-45.22-12.81l24.47-40.8a7.93 7.93 0 0 0 1.14-4.11V40h32v59.14a7.93 7.93 0 0 0 1.14 4.11L183.36 167c-11.96 2.34-29.07 1.34-51.75-10.14",
  "/tools/ireland-capital-allowances": "M232 208h-8v-72.98a1 1 0 0 0 0-.15L209 29.74A16.08 16.08 0 0 0 193.06 16h-18.12a16.08 16.08 0 0 0-15.84 13.74l-11.56 80.91L108.8 81.6A8 8 0 0 0 96 88v32L44.8 81.6A8 8 0 0 0 32 88v120h-8a8 8 0 0 0 0 16h208a8 8 0 0 0 0-16m-124-24H80a8 8 0 0 1 0-16h28a8 8 0 0 1 0 16m68 0h-28a8 8 0 0 1 0-16h28a8 8 0 0 1 0 16m-5.33-56l-8.53-6.4l12.8-89.6h18.12l13.72 96Z",
  "/tools/ireland-cgt": "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-16 152H56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v76.69l34.34-34.35a8 8 0 0 1 11.32 0L128 132.69L172.69 88H144a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8v48a8 8 0 0 1-16 0V99.31l-50.34 50.35a8 8 0 0 1-11.32 0L104 131.31l-40 40V176h136a8 8 0 0 1 0 16",
  "/tools/ireland-cat": "M216 72h-35.08c.39-.33.79-.65 1.17-1A29.53 29.53 0 0 0 192 49.57A32.62 32.62 0 0 0 158.44 16A29.53 29.53 0 0 0 137 25.91a55 55 0 0 0-9 14.48a55 55 0 0 0-9-14.48A29.53 29.53 0 0 0 97.56 16A32.62 32.62 0 0 0 64 49.57A29.53 29.53 0 0 0 73.91 71c.38.33.78.65 1.17 1H40a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16v64a16 16 0 0 0 16 16h60a4 4 0 0 0 4-4v-92H40V88h80v32h16V88h80v32h-80v92a4 4 0 0 0 4 4h60a16 16 0 0 0 16-16v-64a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16M84.51 59a13.7 13.7 0 0 1-4.5-10a16.62 16.62 0 0 1 16.58-17h.49a13.7 13.7 0 0 1 10 4.5c8.39 9.48 11.35 25.2 12.39 34.92C109.71 70.39 94 67.43 84.51 59m87 0c-9.49 8.4-25.24 11.36-35 12.4C137.7 60.89 141 45.5 149 36.51a13.7 13.7 0 0 1 10-4.5h.49A16.62 16.62 0 0 1 176 49.08a13.7 13.7 0 0 1-4.51 9.92Z",
  "/personal/mortgage": "M240 208h-16v-72l2.34 2.34A8 8 0 0 0 237.66 127l-98.35-98.32a16 16 0 0 0-22.62 0L18.34 127a8 8 0 0 0 11.32 11.31L32 136v72H16a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16m-88 0h-48v-48a4 4 0 0 1 4-4h40a4 4 0 0 1 4 4Z",
};


/** useFormat plus a short "€60k" for chart labels. */
function useFmt() {
  const f = useFormat();
  const t = useT(heroCardMessages);
  const k = (v: number) =>
    Math.abs(v) >= 1e6
      ? t.millions.replace("{n}", f.num(Math.round(v / 1e5) / 10))
      : Math.abs(v) >= 1e4
        ? t.thousands.replace("{n}", f.num(Math.round(v / 1e3)))
        : f.eur0(v);
  return { ...f, k };
}

function Shell(props: {
  href: string;
  n: number;
  eyebrow: string;
  result: string;
  big: string;
  sub: string;
  viz: ReactNode;
  children: ReactNode;
}) {
  const t = useT(heroCardMessages);
  const name = useT(toolNames)[props.href]?.label ?? props.href;
  return (
    <>
      <header className="hf-top">
        <div className="min-w-0">
          <p className="hf-eyebrow">
            <b>{String(props.n).padStart(2, "0")}</b> {props.eyebrow}
          </p>
          <h3 className="hf-title">
            <svg viewBox="0 0 256 256" aria-hidden="true">
              <path fill="currentColor" d={ICONS[props.href]} />
            </svg>
            {name}
          </h3>
        </div>
        <LocaleLink href={props.href} className="hf-open" aria-label={t.openLabel.replace("{name}", name)}>
          {t.open} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">↗</span>
        </LocaleLink>
      </header>
      <div className="hf-result" aria-live="polite">
        <span>{props.result}</span>
        <output className="hf-big">{props.big}</output>
        <span>{props.sub}</span>
      </div>
      <div className="hf-viz">{props.viz}</div>
      <form className="hf-ctrls" onSubmit={(ev) => ev.preventDefault()}>
        {props.children}
      </form>
    </>
  );
}

function Range(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  show: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="hf-ctrl">
      <div className="hf-row">
        <label htmlFor={id}>{props.label}</label>
        <output htmlFor={id}>{props.show(props.value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(ev) => props.onChange(Number(ev.target.value))}
      />
    </div>
  );
}

function Seg<T extends string>(props: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const name = useId();
  return (
    <fieldset className="hf-ctrl">
      <legend>{props.label}</legend>
      <div className="hf-seg">
        {props.options.map(([v, l]) => (
          <label key={v}>
            <input type="radio" name={name} value={v} checked={props.value === v} onChange={() => props.onChange(v)} />
            <span>{l}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type Bar = { label: string; value: number; text: string; tone?: 1 | 2 | 3; dim?: boolean };

function Bars({ items }: { items: Bar[] }) {
  const max = Math.max(1, ...items.map((b) => b.value));
  return (
    <ul className="hf-bars">
      {items.map((b) => (
        <li key={b.label} data-tone={b.tone ?? 1} className={b.dim ? "is-dim" : undefined}>
          <span>{b.label}</span>
          <span className="hf-track">
            <i style={{ width: `${(Math.max(0, b.value) / max) * 100}%` }} />
          </span>
          <b>{b.text}</b>
        </li>
      ))}
    </ul>
  );
}

/** A ring drawn with conic-gradient; `parts` fill it in order, the rest is track. */
function Donut(props: { parts: { value: number; color: string }[]; total: number; center: string; caption: string; legend: { label: string; text: string; color: string }[] }) {
  const ends = props.parts.reduce<number[]>((acc, p) => [...acc, (acc.at(-1) ?? 0) + (Math.max(0, p.value) / (props.total || 1)) * 100], []);
  const at = ends.at(-1) ?? 0;
  const stops = props.parts.map((p, i) => `${p.color} ${ends[i - 1] ?? 0}% ${ends[i]}%`);
  return (
    <div className="hf-donut-wrap">
      <div className="hf-donut">
        <div className="hf-ring" style={{ background: `conic-gradient(${[...stops, `var(--hf-track) ${at}% 100%`].join(",")})` }} />
        <div className="hf-center">
          <b>{props.center}</b>
          <span>{props.caption}</span>
        </div>
      </div>
      <Legend items={props.legend} />
    </div>
  );
}

type LegendItem = { label: string; text: string; color: string };

function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="hf-legend">
      {items.map((l) => (
        <li key={l.label}>
          <i style={{ background: l.color }} />
          {l.label} <b>{l.text}</b>
        </li>
      ))}
    </ul>
  );
}

/** Labelled columns, the export's bar chart. */
function Columns({ items }: { items: Bar[] }) {
  const max = Math.max(1, ...items.map((b) => b.value));
  const slot = 300 / items.length, bw = Math.min(46, slot * 0.62), base = 146, top = 22;
  return (
    <svg className="hf-svg" viewBox="0 0 300 166" aria-hidden="true">
      <line x1="0" x2="300" y1={base} y2={base} className="hf-axis" />
      {items.map((b, k) => {
        const h = Math.max(2, ((base - top) * Math.max(0, b.value)) / max), x = k * slot + (slot - bw) / 2;
        return (
          <g key={b.label} data-tone={b.tone ?? 1}>
            <rect x={x} y={base - h} width={bw} height={h} rx="4" />
            <text x={x + bw / 2} y={base - h - 6} textAnchor="middle" className="hf-strong">
              {b.text}
            </text>
            <text x={x + bw / 2} y={base + 16} textAnchor="middle">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** 100 squares split between the parts, in order. */
function Waffle({ parts, legend }: { parts: { value: number; tone: 1 | 2 | 3 }[]; legend: LegendItem[] }) {
  const total = parts.reduce((a, p) => a + Math.max(0, p.value), 0) || 1;
  const tones = parts.flatMap((p) => Array<number>(Math.round((Math.max(0, p.value) / total) * 100)).fill(p.tone));
  return (
    <div className="hf-stack">
      <svg className="hf-svg" viewBox="0 0 207 207" aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => (
          <rect key={i} x={(i % 10) * 21} y={Math.floor(i / 10) * 21} width="18" height="18" rx="2" data-tone={tones[i] ?? parts.at(-1)?.tone} />
        ))}
      </svg>
      <Legend items={legend} />
    </div>
  );
}

/** Semicircle gauge: the outer arc fills to `used`, the inner one to `over` (both 0 to 1). */
function Gauge(props: { used: number; over: number; center: string; caption: string; legend: LegendItem[] }) {
  const arc = (r: number) => `M${110 - r} 112 A${r} ${r} 0 0 1 ${110 + r} 112`;
  const fill = (v: number) => (v > 0 ? { strokeDasharray: `${v} 2` } : { opacity: 0 });
  return (
    <div className="hf-stack">
      <svg className="hf-svg" viewBox="0 0 220 124" aria-hidden="true">
        <path d={arc(80)} className="hf-arc-track" strokeWidth="18" />
        <path d={arc(80)} pathLength={1} className="hf-arc" strokeWidth="18" style={fill(props.used)} />
        <path d={arc(58)} className="hf-arc-track" strokeWidth="8" />
        <path d={arc(58)} pathLength={1} className="hf-arc hf-arc-over" strokeWidth="8" style={fill(props.over)} />
        <text x="110" y="96" textAnchor="middle" className="hf-svg-big">
          {props.center}
        </text>
        <text x="110" y="112" textAnchor="middle">
          {props.caption}
        </text>
      </svg>
      <Legend items={props.legend} />
    </div>
  );
}

const C1 = "var(--hf-c1)", C2 = "var(--hf-c2)", C3 = "var(--hf-c3)", C4 = "var(--hf-c4)";

/* ---------- the cards ---------- */

function IncomeCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).income;
  const f = useFmt();
  const [gross, setGross] = useState(60000);
  const [status, setStatus] = useState<"single" | "married">("single");
  // The income tax calculator's own starting answers, with this salary.
  const r = computeIrishTax(
    {
      maritalStatus: status,
      hasChildOnChildBenefit: false,
      isPrincipalCarerOfDependentChild: false,
      age: 0,
      employmentIncome: gross,
      selfEmploymentOrOtherIncome: 0,
      pensionContribution: 0,
    },
    d.year,
    d.rates,
  );
  const tax = r.incomeTax.netTax, usc = r.usc.total, prsi = r.prsi.total;
  return (
    <Shell
      href="/tools/ireland-income-tax"
      n={n}
      eyebrow={t.eyebrow.replace("{year}", String(d.year))}
      result={t.result}
      big={f.eur0(r.netIncome)}
      sub={t.sub.replace("{monthly}", f.eur0(r.monthlyNetIncome)).replace("{rate}", f.pct1(r.effectiveRate))}
      viz={
        <Donut
          total={gross}
          parts={[{ value: r.netIncome, color: C1 }, { value: tax, color: C2 }, { value: usc, color: C3 }, { value: prsi, color: C4 }]}
          center={f.rate(Math.round((r.netIncome / gross) * 100))}
          caption={t.kept}
          legend={[
            { label: t.net, text: f.k(r.netIncome), color: C1 },
            { label: t.tax, text: f.k(tax), color: C2 },
            { label: t.usc, text: f.k(usc), color: C3 },
            { label: t.prsi, text: f.k(prsi), color: C4 },
          ]}
        />
      }
    >
      <Range label={t.gross} value={gross} min={15000} max={250000} step={500} show={f.eur0} onChange={setGross} />
      <Seg label={t.status} value={status} options={[["single", t.single], ["married", t.married]]} onChange={setStatus} />
    </Shell>
  );
}

function VatCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).vat;
  const f = useFmt();
  const [amount, setAmount] = useState(10000);
  const [key, setKey] = useState<VatRateKey>("standard");
  const [mode, setMode] = useState<"add" | "extract">("add");
  const rates = d.vat.rates.filter((r) => r.key !== "livestock");
  const run = (percent: number) => (mode === "add" ? addVat(amount, percent) : removeVat(amount, percent));
  const rate = getVatRate(key, d.vat.rates).percent;
  const cur = run(rate);
  return (
    <Shell
      href="/tools/ireland-vat"
      n={n}
      eyebrow={t.eyebrow}
      result={(mode === "add" ? t.resultAdd : t.resultExtract).replace("{rate}", f.rate(rate))}
      big={f.eur0(cur.vat)}
      sub={t.sub.replace("{net}", f.eur0(cur.net)).replace("{gross}", f.eur0(cur.gross))}
      viz={<Bars items={rates.map((r) => ({ label: f.rate(r.percent), value: run(r.percent).vat, text: f.k(run(r.percent).vat), dim: r.key !== key }))} />}
    >
      <Range label={t.amount} value={amount} min={0} max={100000} step={50} show={f.eur0} onChange={setAmount} />
      <Seg label={t.rate} value={key} options={rates.map((r) => [r.key, f.rate(r.percent)])} onChange={setKey} />
      <Seg label={t.mode} value={mode} options={[["add", t.add], ["extract", t.extract]]} onChange={setMode} />
    </Shell>
  );
}

function CtCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).ct;
  const f = useFmt();
  const [trading, setTrading] = useState(400000);
  const [passive, setPassive] = useState(40000);
  const r = computeCorporationTax({ tradingProfit: trading, passiveIncome: passive }, d.ct);
  const retained = r.totalProfit - r.totalTax;
  return (
    <Shell
      href="/tools/ireland-corporation-tax"
      n={n}
      eyebrow={t.eyebrow.replace("{trading}", f.rate(d.ct.tradingPercent)).replace("{passive}", f.rate(d.ct.passivePercent))}
      result={t.result}
      big={f.eur0(r.totalTax)}
      sub={t.sub.replace("{retained}", f.eur0(retained)).replace("{rate}", f.pct1(r.effectiveRate))}
      viz={
        <Waffle
          parts={[{ value: retained, tone: 1 }, { value: r.tradingTax, tone: 2 }, { value: r.passiveTax, tone: 3 }]}
          legend={[
            { label: t.retained, text: f.pct1(r.totalProfit ? retained / r.totalProfit : 0), color: C1 },
            { label: t.tradingTax, text: f.k(r.tradingTax), color: C2 },
            { label: t.passiveTax, text: f.k(r.passiveTax), color: C3 },
          ]}
        />
      }
    >
      <Range label={t.trading} value={trading} min={0} max={2000000} step={5000} show={f.eur0} onChange={setTrading} />
      <Range label={t.passive} value={passive} min={0} max={500000} step={1000} show={f.eur0} onChange={setPassive} />
    </Shell>
  );
}

function RdCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).rd;
  const f = useFmt();
  const [spend, setSpend] = useState(450000);
  const r = computeRdCredit(spend, 0, d.rd);
  const years = [r.instalments.year1, r.instalments.year2, r.instalments.year3];
  return (
    <Shell
      href="/tools/ireland-rd-tax-credit"
      n={n}
      eyebrow={t.eyebrow.replace("{rate}", f.rate(d.rd.ratePercent))}
      result={t.result}
      big={f.eur0(r.credit)}
      sub={t.sub.replace("{amount}", f.eur0(r.instalments.year1))}
      viz={<Columns items={years.map((v, i) => ({ label: t.year.replace("{n}", f.num(i + 1)), value: v, text: f.k(v), tone: i === 0 ? 1 : 2 }))} />}
    >
      <Range label={t.spend} value={spend} min={0} max={3000000} step={5000} show={f.eur0} onChange={setSpend} />
    </Shell>
  );
}

function CaCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).ca;
  const f = useFmt();
  const [cost, setCost] = useState(120000);
  const [asset, setAsset] = useState<AssetKey>("plant-machinery");
  const r = computeCapitalAllowance({ assetKey: asset, cost }, d.ca);
  return (
    <Shell
      href="/tools/ireland-capital-allowances"
      n={n}
      eyebrow={t.eyebrow}
      result={t.result}
      big={f.eur0(r.firstYearAllowance)}
      // The year-1 allowance's own tax value. r.taxSaving is the whole write-off
      // period's, and under a year-1 figure it read as one year's saving.
      sub={t.sub.replace("{saving}", f.eur0((r.firstYearAllowance * d.ca.tradingCtPercent) / 100)).replace("{rate}", f.rate(d.ca.tradingCtPercent))}
      viz={
        <Columns
          items={[
            { label: t.allowance, value: r.firstYearAllowance, text: f.k(r.firstYearAllowance) },
            { label: t.left, value: r.allowableCost - r.firstYearAllowance, text: f.k(r.allowableCost - r.firstYearAllowance), tone: 3 },
          ]}
        />
      }
    >
      <Range label={t.cost} value={cost} min={0} max={1000000} step={1000} show={f.eur0} onChange={setCost} />
      <Seg
        label={t.asset}
        value={asset}
        options={[["plant-machinery", t.plant], ["energy-efficient", t.aca], ["motor-vehicle", t.car], ["industrial-building", t.building]]}
        onChange={setAsset}
      />
    </Shell>
  );
}

function CgtCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).cgt;
  const f = useFmt();
  const [proceeds, setProceeds] = useState(180000);
  const [cost, setCost] = useState(90000);
  const [mode, setMode] = useState<"standard" | "entrepreneur">("standard");
  const r = computeCgt(
    {
      proceeds,
      disposalCosts: 0,
      acquisitionCost: cost,
      acquisitionMultiplier: 1,
      enhancementCost: 0,
      enhancementMultiplier: 1,
      currentYearLosses: 0,
      broughtForwardLosses: 0,
      applyExemption: true,
      rateMode: mode,
    },
    d.cgt,
  );
  const gain = Math.max(0, r.rawGain);
  return (
    <Shell
      href="/tools/ireland-cgt"
      n={n}
      eyebrow={t.eyebrow.replace("{exemption}", f.eur0(d.cgt.annualExemptionEur))}
      result={t.result}
      big={f.eur0(r.totalTax)}
      sub={t.sub.replace("{gain}", f.eur0(gain)).replace("{rate}", f.pct1(proceeds ? r.totalTax / proceeds : 0))}
      viz={
        <Columns
          items={[
            { label: t.sale, value: proceeds, text: f.k(proceeds), tone: 3 },
            { label: t.costBar, value: cost, text: f.k(cost), tone: 3 },
            { label: t.gain, value: gain, text: f.k(gain) },
            { label: t.tax, value: r.totalTax, text: f.k(r.totalTax), tone: 2 },
            { label: t.kept, value: gain - r.totalTax, text: f.k(gain - r.totalTax) },
          ]}
        />
      }
    >
      <Range label={t.proceeds} value={proceeds} min={0} max={1000000} step={1000} show={f.eur0} onChange={setProceeds} />
      <Range label={t.cost} value={cost} min={0} max={1000000} step={1000} show={f.eur0} onChange={setCost} />
      <Seg
        label={t.rate}
        value={mode}
        options={[
          ["standard", t.standard.replace("{rate}", f.rate(d.cgt.standardRatePercent))],
          ["entrepreneur", t.entrepreneur.replace("{rate}", f.rate(d.cgt.entrepreneurRatePercent))],
        ]}
        onChange={setMode}
      />
    </Shell>
  );
}

function CatCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).cat;
  const f = useFmt();
  const [value, setValue] = useState(500000);
  const [rel, setRel] = useState<Relationship>("child");
  const [kind, setKind] = useState<BenefitType>("inheritance");
  const r = computeCat(
    { benefitType: kind, relationship: rel, marketValue: value, deductibleLiabilities: 0, relief: "none", applySmallGiftExemption: true, priorBenefits: 0 },
    d.cat,
  );
  const used = Math.min(r.currentTaxableValue, r.groupThreshold);
  return (
    <Shell
      href="/tools/ireland-cat"
      n={n}
      eyebrow={t.eyebrow.replace("{rate}", f.rate(d.cat.ratePercent))}
      result={t.result}
      big={f.eur0(r.catDue)}
      sub={t.sub.replace("{taxable}", f.eur0(r.taxableExcess)).replace("{group}", r.group).replace("{threshold}", f.eur0(r.groupThreshold))}
      viz={
        <Gauge
          used={Math.min(1, r.currentTaxableValue / (r.groupThreshold || 1))}
          over={r.currentTaxableValue ? r.taxableExcess / r.currentTaxableValue : 0}
          center={f.rate(Math.min(100, Math.round((r.currentTaxableValue / (r.groupThreshold || 1)) * 100)))}
          caption={t.ofThreshold}
          legend={[
            { label: t.used, text: f.k(used), color: C1 },
            { label: t.taxable, text: f.k(r.taxableExcess), color: C2 },
          ]}
        />
      }
    >
      <Range label={t.value} value={value} min={0} max={2000000} step={5000} show={f.eur0} onChange={setValue} />
      <Seg label={t.relationship} value={rel} options={[["child", t.child], ["sibling", t.sibling], ["other", t.other]]} onChange={setRel} />
      <Seg label={t.type} value={kind} options={[["inheritance", t.inheritance], ["gift", t.gift]]} onChange={setKind} />
    </Shell>
  );
}

function MortgageCard({ d, n }: CardProps) {
  const t = useT(heroCardMessages).mortgage;
  const f = useFmt();
  const locale = useLocale();
  const [loan, setLoan] = useState(300000);
  const [rate, setRate] = useState(d.mortgageRate);
  const [term, setTerm] = useState(30);
  const monthly = monthlyPayment(loan, rate, term);
  const interest = monthly * term * 12 - loan;
  return (
    <Shell
      href="/personal/mortgage"
      n={n}
      eyebrow={t.eyebrow}
      result={t.result}
      big={f.eur0(monthly)}
      sub={t.sub.replace("{interest}", f.eur0(interest))}
      viz={
        <Columns
          items={[
            { label: t.principal, value: loan, text: f.k(loan) },
            { label: t.interest, value: interest, text: f.k(interest), tone: 2 },
          ]}
        />
      }
    >
      <Range label={t.loan} value={loan} min={50000} max={1200000} step={5000} show={f.eur0} onChange={setLoan} />
      <Range label={t.rate} value={rate} min={0.5} max={8} step={0.05} show={(v) => f.rate(v)} onChange={setRate} />
      <Range label={t.term} value={term} min={5} max={35} step={1} show={(v) => plural(locale, v, t.years)} onChange={setTerm} />
    </Shell>
  );
}

const CARDS: { href: string; Card: (p: CardProps) => ReactNode }[] = [
  { href: "/tools/ireland-income-tax", Card: IncomeCard },
  { href: "/tools/ireland-vat", Card: VatCard },
  { href: "/tools/ireland-corporation-tax", Card: CtCard },
  { href: "/tools/ireland-rd-tax-credit", Card: RdCard },
  { href: "/tools/ireland-capital-allowances", Card: CaCard },
  { href: "/tools/ireland-cgt", Card: CgtCard },
  { href: "/tools/ireland-cat", Card: CatCard },
  { href: "/personal/mortgage", Card: MortgageCard },
];
