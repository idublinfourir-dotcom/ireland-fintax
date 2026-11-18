"use client";

/* Crypto CGT: one row per buy or disposal, as an exchange statement shows it
   (date, type, coin, quantity, price per coin, fee), a total per row, and a
   summary under the rows that updates as you type. The price per coin is
   filled in from Coinbase or Bitstamp for the row's date and can be changed.
   Matching and tax live in ../lib/ireland-crypto-cgt; prices come through
   /api/crypto-prices (../lib/crypto-prices). */

import { useEffect, useMemo, useRef, useState } from "react";
import { round2, type CgtConfig } from "../lib/ireland-cgt";
import { DATE, MAX_ITEMS, MIN_DATE, SYMBOL, type Coin, type DayPrice, type PriceMap } from "../lib/crypto-prices";
import {
  computeCryptoCgt,
  CRYPTO_LAST_REVIEWED,
  CRYPTO_SOURCE_URL,
  LAST_TAX_YEAR,
  MAX_TRADES,
  type CryptoTrade,
} from "../lib/ireland-crypto-cgt";
import { numberFormat } from "../lib/i18n";
import { btnOutline, CurrencyField, ResultDisclaimer, useFormat } from "./calculator-fields";
import { useT } from "./locale-link";
import { CoinCombobox } from "./coin-combobox";
import { parsePastedTrades } from "../lib/crypto-paste";
import { cryptoMessages } from "../lib/messages/crypto";

/* Shared by the header row and each row so the columns line up (wide screens). */
const grid = "gap-2 xl:grid-cols-[9rem_7.5rem_10.5rem_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,1fr)_2.75rem]";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.16em] text-muted";
const input =
  "h-11 w-full min-w-0 rounded-none border border-line bg-surface px-3 text-sm text-ink tabular-nums transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40";
/* Number boxes without the spinner arrows: they took room the figures need. */
const numberInput = `${input} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

/* `done`: the row has been left once, so its mistakes are worth showing.
   `priced`: the price came from the exchange, not typed. */
type Row = { id: number; date: string; kind: CryptoTrade["kind"]; coin: string; quantity: string; price: string; fees: string; done: boolean; priced?: boolean };

let nextId = 1;
const blank = (date: string, from?: Row): Row => ({
  id: nextId++, date: from?.date ?? date, kind: "buy", coin: from?.coin ?? "", quantity: "", price: "", fees: "0", done: false,
});
// Worked by hand in e2e/crypto.spec.ts: CGT for 2026 €132.66.
const EXAMPLE: Omit<Row, "id" | "done">[] = [
  { date: "2025-02-10", kind: "buy", coin: "BTC", quantity: "0.5", price: "80000", fees: "20" },
  { date: "2026-03-03", kind: "buy", coin: "BTC", quantity: "0.1", price: "85000", fees: "5" },
  { date: "2026-03-20", kind: "sell", coin: "BTC", quantity: "0.3", price: "90000", fees: "15" },
  { date: "2026-05-01", kind: "buy", coin: "ETH", quantity: "4", price: "3000", fees: "0" },
  { date: "2026-11-15", kind: "sell", coin: "ETH", quantity: "2", price: "2600", fees: "0" },
];
// A row with only its starting date, type and zero fee is still empty.
const isBlank = (r: Row) => !r.coin.trim() && !r.quantity && !r.price && (r.fees === "" || Number(r.fees) === 0);
/** "BTC:2026-03-19" when the row names a coin and a date a price can be looked up for. */
const priceKey = (r: Row) => {
  const coin = r.coin.trim().toUpperCase();
  return SYMBOL.test(coin) && DATE.test(r.date) && r.date >= MIN_DATE ? `${coin}:${r.date}` : null;
};
/** Looked-up prices; null once asked and none was found. */
type Prices = Record<string, DayPrice | null>;
/** The price follows the exchange: empty, or filled in before and not typed over. */
const follows = (r: Row) => r.price === "" || r.priced === true;
/** Keep every following price at the exchange's price for its coin and date.
    `editing` is the row whose price box has the cursor: it is left alone, or
    clearing the box to retype it would fill it straight back in. */
const fill = (rs: Row[], prices: Prices, editing: number | null = null): Row[] => {
  let changed = false;
  const next = rs.map((r) => {
    if (!follows(r) || r.id === editing) return r;
    const k = priceKey(r);
    const p = k ? prices[k] : null;
    const price = p ? String(p.eur) : "";
    if (price === r.price && r.priced === Boolean(p)) return r;
    changed = true;
    return { ...r, price, priced: Boolean(p) };
  });
  return changed ? next : rs;
};
// "" is NaN for quantity and price (the lib reports it), 0 for fees.
const num = (s: string, empty: number) => (s.trim() === "" ? empty : Number(s));
/** Quantity × price, or NaN until both are there. */
const value = (r: Row) => {
  const q = num(r.quantity, Number.NaN);
  const p = num(r.price, Number.NaN);
  return q > 0 && p >= 0 ? round2(q * p) : Number.NaN;
};
/** What the row cost (buy) or brought in (sale), after its fee. */
const total = (r: Row) => {
  const v = value(r);
  const f = num(r.fees, 0);
  return Number.isFinite(v) && f >= 0 ? round2(r.kind === "buy" ? v + f : v - f) : Number.NaN;
};
// A row still being typed, or waiting for its price, is left out until it is ready.
const isReady = (r: Row, prices: Prices) =>
  !isBlank(r) &&
  !(follows(r) && priceKey(r) && prices[priceKey(r)!] === undefined) &&
  (r.done || Boolean(r.date && r.coin.trim() && r.quantity && r.price));

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 px-5 py-3 sm:px-6 ${strong ? "bg-surface-muted" : ""}`}>
      <dt className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-body"}`}>{label}</dt>
      <dd className={`text-sm tabular-nums ${strong ? "font-display font-semibold text-ink" : "font-medium text-ink"}`}>{value}</dd>
    </div>
  );
}

/* Phones: label and figure on one line, full width, so a large figure has
   room. From sm up: a tile, figure under its label. */
function Stat({ label, value, tone }: { label: string; value: string; tone?: "loss" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border border-line bg-surface px-4 py-3 sm:block">
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-display text-lg font-semibold whitespace-nowrap tabular-nums sm:mt-1 sm:text-xl ${tone === "loss" ? "text-red-600" : "text-ink"}`}>{value}</p>
    </div>
  );
}

/** `today` is the server's UTC date (the exchanges' day), so server and browser
    start the same. Later dates are allowed, for a sale being planned: no price
    is looked up for them, so the expected price is typed. */
export function IrelandCryptoCgtCalculator({ config, coins, today }: { config: CgtConfig; coins: Coin[]; today: string }) {
  const t = useT(cryptoMessages);
  const { money, rate, locale } = useFormat();
  const qty = (n: number) => numberFormat(locale, { maximumFractionDigits: 8 }).format(n);

  const [rows, setRows] = useState<Row[]>(() => [blank(today), blank(today)]);
  const [broughtForward, setBroughtForward] = useState(0);
  const [pasted, setPasted] = useState("");
  const [pasteNote, setPasteNote] = useState("");
  const [prices, setPrices] = useState<Prices>({});
  const [looking, setLooking] = useState(false);
  /* A refused or failed request is not "no price": nothing is marked, and the
     same prices are asked for again a few seconds later. */
  const [trouble, setTrouble] = useState(false);
  const [retry, setRetry] = useState(0);
  /* Requests overlap while someone types, so answers are merged into the
     latest known prices (a ref, not this render's copy), and a key already
     being fetched is not asked for twice. */
  const known = useRef<Prices>({});
  const inFlight = useRef(new Set<string>());
  /** The row whose price box has the cursor (see `fill`). */
  const editingPrice = useRef<number | null>(null);

  // Look up the price of every row whose price follows the exchange.
  useEffect(() => {
    const need = [...new Set(rows.filter(follows).map(priceKey).filter((k): k is string => k !== null))]
      .filter((k) => !(k in prices) && !inFlight.current.has(k))
      .slice(0, MAX_ITEMS);
    if (!need.length) return;
    const timer = setTimeout(async () => {
      for (const k of need) inFlight.current.add(k);
      setLooking(true);
      let got: PriceMap | null = null;
      let complete = true;
      try {
        const res = await fetch("/api/crypto-prices", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: need.map((k) => ({ coin: k.split(":")[0], date: k.split(":")[1] })) }),
        });
        if (res.ok) {
          const body = (await res.json()) as { prices?: PriceMap; complete?: boolean };
          got = body.prices ?? {};
          complete = body.complete !== false;
        }
      } catch {
        // offline: handled below like a refusal
      }
      for (const k of need) inFlight.current.delete(k);
      setLooking(inFlight.current.size > 0);
      setTrouble(got === null);
      if (got === null) {
        setTimeout(() => setRetry((n) => n + 1), 8000);
        return;
      }
      /* An incomplete answer: the server left some look-ups for the next
         request, so a key it did not return is not "no price". Those stay
         unknown and are asked for again straight away. */
      const answer = got;
      const settled = need.filter((k) => complete || answer[k]);
      known.current = { ...known.current, ...Object.fromEntries(settled.map((k) => [k, answer[k] ?? null])) };
      const merged = known.current;
      setPrices(merged);
      setRows((rs) => fill(rs, merged, editingPrice.current));
      if (!complete && settled.length === 0) setTimeout(() => setRetry((n) => n + 1), 1000);
    }, 300);
    return () => clearTimeout(timer);
  }, [rows, prices, retry]);

  /* Pasted rows carry a total value; the row keeps a price per coin, so the
     price is that value over the quantity (at full precision, so quantity ×
     price gives the pasted value back to the cent). */
  const addPasted = () => {
    const { rows: got, badType } = parsePastedTrades(pasted, { buy: [t.buy], sell: [t.sell] });
    const keep = rows.filter((r) => !isBlank(r));
    if (badType.length) return setPasteNote(t.paste.badType.replace("{lines}", badType.slice(0, 10).join(", ")));
    if (!got.length) return setPasteNote(t.paste.none);
    if (keep.length + got.length > MAX_TRADES) return setPasteNote(t.issues.tooMany.replace("{max}", String(MAX_TRADES)));
    const added = got.map(({ amount, ...r }) => {
      const q = Number(r.quantity);
      const price = amount.trim() !== "" && q > 0 ? String(Number(amount) / q) : "";
      return { ...r, price, fees: r.fees || "0", id: nextId++, done: true };
    });
    setRows(fill([...keep, ...added], prices, editingPrice.current));
    setPasted("");
    setPasteNote(t.paste.added.replace("{n}", String(got.length)));
  };

  /* Typing a price makes it yours. A price that follows the exchange moves
     with the coin and date; one cleared and left empty goes back to following
     once the cursor leaves the box. */
  const set = (id: number, patch: Partial<Row>) =>
    setRows((rs) =>
      fill(
        rs.map((r) => (r.id !== id ? r : "price" in patch ? { ...r, ...patch, priced: false } : { ...r, ...patch })),
        prices,
        editingPrice.current,
      ),
    );

  // `shown` maps a trade back to its row number.
  const { result, shown, ready } = useMemo(() => {
    const filled = rows.map((r, i) => ({ r, n: i + 1 })).filter(({ r }) => isReady(r, prices));
    const trades: CryptoTrade[] = filled.map(({ r }) => ({
      date: r.date,
      kind: r.kind,
      coin: r.coin,
      quantity: num(r.quantity, Number.NaN),
      amountEur: value(r),
      feesEur: num(r.fees, 0),
    }));
    return { result: computeCryptoCgt(trades, config, broughtForward), shown: filled.map((f) => f.n), ready: filled.map((f) => f.r) };
  }, [rows, broughtForward, config, prices]);

  /* Problems, by row number, shown under that row. A sale of more than was
     bought also offers to add the missing buy. */
  const issuesByRow = new Map<number, string[]>();
  const shortBy = new Map<number, number>();
  for (const i of result.issues) {
    if (i.code === "tooMany") continue;
    const n = shown[i.row];
    const text = t.issues[i.code].replace("{n}", String(n)).replace("{short}", i.code === "oversold" ? qty(i.short) : "");
    issuesByRow.set(n, [...(issuesByRow.get(n) ?? []), text]);
    if (i.code === "oversold") shortBy.set(n, i.short);
  }
  /* The buy goes just above the sale, same coin, the missing quantity, no
     date yet: it has to be on or before the sale, and only you know when. */
  const addMissingBuy = (sale: Row, short: number) =>
    setRows((rs) => {
      const at = rs.findIndex((r) => r.id === sale.id);
      const buyRow: Row = { ...blank(""), coin: sale.coin, quantity: String(+short.toFixed(8)) };
      return [...rs.slice(0, at), buyRow, ...rs.slice(at)];
    });
  const tooMany = result.issues.some((i) => i.code === "tooMany");

  /* Summary sums from the rows themselves, so they show even before any sale.
     A row with a problem stays out of every figure, as it does from the tax. */
  const clean = ready.filter((r, i) => !issuesByRow.has(shown[i]));
  const sum = (rs: Row[], f: (r: Row) => number) => round2(rs.reduce((s, r) => s + (Number.isFinite(f(r)) ? f(r) : 0), 0));
  const bought = sum(clean.filter((r) => r.kind === "buy"), total);
  const sold = sum(clean.filter((r) => r.kind === "sell"), total);
  const fees = sum(clean, (r) => num(r.fees, 0));
  const ok = result.issues.length === 0;
  const gain = round2(result.disposals.reduce((s, d) => s + d.gain, 0));
  const hasSales = ok && result.disposals.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
        <span className="font-semibold text-ink">{t.introTitle}</span> {t.introBody}
      </div>

      {/* rows */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-base font-medium tracking-tight text-ink">{t.tradesHeading}</h2>
          <p className="mt-1 text-xs leading-5 text-muted">{t.amountHint}</p>
          <p role="status" className="mt-1 min-h-5 text-xs leading-5 text-primary-600">{looking ? t.price.looking : trouble ? t.price.trouble : ""}</p>
        </div>

        {/* Column names: a header row on wide screens, a label over each box below that. */}
        <div aria-hidden="true" className={`${grid} hidden text-xs font-medium text-muted xl:grid`}>
          {[t.cols.date, t.cols.kind, t.cols.coin, t.cols.quantity, t.cols.price, t.cols.fees, t.cols.total].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <ol className="flex flex-col gap-3 xl:-mt-2">
          {rows.map((r, i) => {
            const n = i + 1;
            const name = (col: string) => `${col}, ${t.row.replace("{n}", String(n))}`;
            const field = (col: string, el: React.ReactNode, wide = false) => (
              <div className={`flex min-w-0 flex-col gap-1 ${wide ? "col-span-2 xl:col-span-1" : ""}`}>
                <span aria-hidden="true" className="text-xs font-medium text-muted xl:hidden">{col}</span>
                {el}
              </div>
            );
            const k = priceKey(r);
            const p = k ? prices[k] : undefined;
            const note = r.priced && p
              ? (r.date === today ? t.price.today : t.price.from).replace("{source}", p.source).replace("{date}", r.date)
              : follows(r) && p === null
                ? (r.date > today ? t.price.future : t.price.none).replace("{coin}", k!.split(":")[0]).replace("{date}", r.date)
                : "";
            const problems = issuesByRow.get(n) ?? [];
            const rowTotal = total(r);
            return (
              <li
                key={r.id}
                onBlur={(e) => {
                  if (!r.done && !e.currentTarget.contains(e.relatedTarget as Node | null)) set(r.id, { done: true });
                }}
                className={`${grid} grid grid-cols-2 border p-3 xl:items-start xl:border-0 xl:p-0 ${
                  problems.length ? "border-red-500 bg-red-50 xl:-mx-2 xl:bg-red-50 xl:px-2 xl:py-2 xl:outline xl:outline-1 xl:outline-red-500" : "border-line bg-surface xl:bg-transparent"
                }`}
              >
                {field(t.cols.date, <input type="date" aria-label={name(t.cols.date)} max={`${LAST_TAX_YEAR}-12-31`} value={r.date} onChange={(e) => set(r.id, { date: e.target.value })} className={input} />, true)}
                {field(t.cols.kind, (
                  <select aria-label={name(t.cols.kind)} value={r.kind} onChange={(e) => set(r.id, { kind: e.target.value as Row["kind"] })} className={`${input} cursor-pointer`}>
                    <option value="buy">{t.buy}</option>
                    <option value="sell">{t.sell}</option>
                  </select>
                ), true)}
                {field(t.cols.coin, (
                  <CoinCombobox
                    label={name(t.cols.coin)}
                    value={r.coin.trim().toUpperCase()}
                    coins={coins}
                    onChange={(coin) => set(r.id, { coin })}
                    placeholder={t.searchCoin}
                    useTicker={t.useTicker}
                    noMatch={t.noMatch}
                    className={input}
                  />
                ), true)}
                {field(t.cols.quantity, <input type="number" inputMode="decimal" min={0} step="any" aria-label={name(t.cols.quantity)} value={r.quantity} onChange={(e) => set(r.id, { quantity: e.target.value })} className={numberInput} />)}
                {field(t.cols.price, (
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      aria-label={name(t.cols.price)}
                      placeholder={k && p === undefined ? "…" : k && p === null ? t.price.noneShort : ""}
                      value={r.price}
                      onChange={(e) => set(r.id, { price: e.target.value })}
                      onFocus={() => (editingPrice.current = r.id)}
                      onBlur={() => {
                        editingPrice.current = null;
                        setRows((rs) => fill(rs, prices));
                      }}
                      className={`${numberInput} ps-7 ${r.priced ? "bg-surface-muted" : ""}`}
                    />
                  </div>
                ))}
                {field(t.cols.fees, (
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
                    <input type="number" inputMode="decimal" min={0} step="any" aria-label={name(t.cols.fees)} value={r.fees} onChange={(e) => set(r.id, { fees: e.target.value })} className={`${numberInput} ps-7`} />
                  </div>
                ))}
                {field(t.cols.total, (
                  <output aria-label={name(t.cols.total)} className="flex h-11 items-center justify-end border border-line bg-surface-muted px-3 text-sm font-semibold text-ink tabular-nums">
                    {Number.isFinite(rowTotal) ? money(rowTotal) : ""}
                  </output>
                ), true)}
                <button
                  type="button"
                  aria-label={t.removeRow.replace("{n}", String(n))}
                  onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== r.id) : [blank(today)]))}
                  className="col-span-2 h-11 cursor-pointer border border-line px-3 text-sm text-muted transition-colors duration-200 hover:text-ink xl:col-span-1"
                >
                  <span aria-hidden="true">×</span>
                </button>
                {(note || problems.length > 0) && (
                  <div className="col-span-2 xl:col-span-full">
                    {problems.map((m) => (
                      <p key={m} className="text-xs leading-5 text-red-700">{m}</p>
                    ))}
                    {shortBy.has(n) && (
                      <button
                        type="button"
                        onClick={() => addMissingBuy(r, shortBy.get(n)!)}
                        className="mt-1 cursor-pointer border border-red-500 bg-surface px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors duration-200 hover:bg-red-100"
                      >
                        {t.addMissingBuy.replace("{qty}", qty(shortBy.get(n)!)).replace("{coin}", r.coin.trim().toUpperCase())}
                      </button>
                    )}
                    {note && <p className="text-xs leading-5 text-muted">{note}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnOutline} disabled={rows.length >= MAX_TRADES} onClick={() => setRows((rs) => [...rs, blank(today, rs[rs.length - 1])])}>
            {t.addRow}
          </button>
          <button type="button" className={btnOutline} onClick={() => setRows(EXAMPLE.map((r) => ({ ...r, id: nextId++, done: true })))}>
            {t.example}
          </button>
          <button type="button" className={btnOutline} onClick={() => setRows([blank(today), blank(today)])}>
            {t.clear}
          </button>
        </div>
        {tooMany && <p className="text-sm text-red-700">{t.issues.tooMany.replace("{max}", String(MAX_TRADES))}</p>}
      </div>

      {/* summary */}
      <section aria-live="polite" className="border border-line bg-canvas p-5 sm:p-6">
        <h2 className={eyebrow}>{t.summary.title}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t.summary.bought} value={money(bought)} />
          <Stat label={t.summary.sold} value={money(sold)} />
          <Stat label={t.summary.fees} value={money(fees)} />
          <Stat label={t.summary.gain} value={hasSales ? money(gain) : money(0)} tone={hasSales && gain < 0 ? "loss" : undefined} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">{t.summary.held}</h3>
            {ok && result.holdings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-ink-body">
                {result.holdings.map((h) => (
                  <li key={h.coin} className="tabular-nums">
                    {t.summary.heldLine.replace("{qty}", qty(h.quantity)).replace("{coin}", h.coin.toUpperCase()).replace("{cost}", money(h.cost))}
                  </li>
                ))}
              </ul>
            ) : (
              // With a row still to fix, what is held is not known: say nothing.
              <p className="mt-2 text-sm text-muted">{ok ? t.summary.nothingHeld : "…"}</p>
            )}
          </div>
          <div>
            {!ok ? (
              <p className="text-sm text-red-700">{t.summary.fixFirst}</p>
            ) : !hasSales ? (
              <p className="text-sm text-muted">{t.summary.noSales}</p>
            ) : (
              <ul className="space-y-3">
                {result.years.map((y) => (
                  <li key={y.year}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-semibold text-ink">{t.summary.cgt.replace("{year}", String(y.year))}</span>
                      <span className="font-display text-2xl font-semibold text-ink tabular-nums">{money(y.tax)}</span>
                    </div>
                    {(y.tax > 0 || y.dueDecember > 0) && (
                      <p className="text-xs leading-5 text-muted">
                        {t.summary.due
                          .replace("{dec}", money(y.dueDecember))
                          .replace("{year}", String(y.year))
                          .replace("{jan}", money(y.dueJanuary))
                          .replace("{next}", String(y.year + 1))}
                        {/* A December loss after the 15 December payment. */}
                        {y.dueDecember > y.tax && ` ${t.summary.refund.replace("{amount}", money(round2(y.dueDecember - y.tax)))}`}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* details */}
      {hasSales && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {result.years.map((y) => (
              <div key={y.year} className="border border-line bg-surface">
                <p className={`${eyebrow} border-b border-line px-5 py-3 sm:px-6`}>{t.yearHeading.replace("{year}", String(y.year))}</p>
                <dl className="divide-y divide-line">
                  <Line label={t.rows.gains} value={money(y.gains)} />
                  <Line label={t.rows.losses} value={money(y.losses)} />
                  <Line label={t.rows.lossesUsed} value={money(y.lossesUsed)} />
                  <Line label={t.rows.exemption} value={money(y.exemption)} />
                  <Line label={t.rows.taxable} value={money(y.taxable)} />
                  <Line label={t.rows.tax} value={money(y.tax)} strong />
                  <Line label={t.rows.dueDecember.replace("{year}", String(y.year))} value={money(y.dueDecember)} />
                  <Line label={t.rows.dueJanuary.replace("{next}", String(y.year + 1))} value={money(y.dueJanuary)} />
                  {y.lossCarried > 0 && <Line label={t.rows.lossCarried} value={money(y.lossCarried)} />}
                </dl>
              </div>
            ))}
          </div>

          <div className="border border-line bg-surface">
            <p className={`${eyebrow} border-b border-line px-5 py-3 sm:px-6`}>{t.disposalsHeading}</p>
            <ul className="divide-y divide-line">
              {result.disposals.map((d) => (
                <li key={d.row} className="px-5 py-3 text-sm sm:px-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-medium text-ink">
                      {d.date} · <span className="uppercase">{d.coin}</span> · {qty(d.quantity)}
                    </span>
                    <span className={`font-display font-semibold tabular-nums ${d.gain < 0 ? "text-red-600" : "text-ink"}`}>{money(d.gain)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {t.dcols.proceeds} {money(d.proceeds)} · {t.dcols.cost} {money(d.cost)}
                    {!d.outOfRange && ` · ${t.dcols.rate} ${rate(d.ratePercent)}`}
                  </p>
                  {d.fourWeekQty > 0 && <p className="text-xs leading-5 text-muted">{t.fourWeek.replace("{qty}", qty(d.fourWeekQty))}</p>}
                  {d.restrictedLoss > 0 && <p className="text-xs leading-5 text-muted">{t.restricted.replace("{amount}", money(d.restrictedLoss))}</p>}
                  {d.restrictedUsed > 0 && <p className="text-xs leading-5 text-muted">{t.restrictedUsed.replace("{amount}", money(d.restrictedUsed))}</p>}
                  {d.outOfRange && <p className="text-xs leading-5 text-muted">{t.outOfRange}</p>}
                </li>
              ))}
            </ul>
          </div>

          {result.restrictedLeft > 0 && (
            <p className="text-sm leading-6 text-muted">{t.restrictedLeft.replace("{amount}", money(result.restrictedLeft))}</p>
          )}
        </div>
      )}

      {/* more ways in */}
      <div className="flex flex-col gap-5">
        <details className="border border-line bg-surface p-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink">{t.paste.title}</summary>
          <p className="mt-2 text-xs leading-5 text-muted">{t.paste.hint}</p>
          <textarea
            aria-label={t.paste.title}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={5}
            spellCheck={false}
            placeholder={"2026-03-20\tSell\tBTC\t0.3\t27000\t15"}
            className="mt-3 w-full rounded-none border border-line bg-surface p-3 font-mono text-xs text-ink focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" className={btnOutline} disabled={!pasted.trim()} onClick={addPasted}>
              {t.paste.button}
            </button>
            <p role="status" className="text-sm text-ink-body">{pasteNote}</p>
          </div>
        </details>

        <div className="max-w-md">
          <CurrencyField label={t.broughtForward} value={broughtForward} onChange={setBroughtForward} hint={t.broughtForwardHint} />
        </div>

        <div className="border border-line bg-surface p-5">
          <h2 className={eyebrow}>{t.notIncluded}</h2>
          <p className="mt-2 text-xs leading-5 text-muted">{t.notIncludedBody}</p>
        </div>
        <p className="text-xs leading-5 text-muted">{t.footnote}</p>
        <ResultDisclaimer asOf={CRYPTO_LAST_REVIEWED} sourceUrl={CRYPTO_SOURCE_URL} />
      </div>
    </div>
  );
}
