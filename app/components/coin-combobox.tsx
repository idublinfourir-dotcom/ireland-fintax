"use client";

/* A searchable coin picker: type a ticker or a name, pick from the matches.
   A ticker that is not in the list can be used as typed. Keyboard: arrows
   move, Enter picks, Escape closes. ARIA combobox pattern (input + listbox). */

import { useId, useMemo, useState } from "react";
import { SYMBOL, type Coin } from "../lib/crypto-prices";

const MAX_SHOWN = 50;

export function CoinCombobox({
  label,
  value,
  coins,
  onChange,
  placeholder,
  useTicker,
  noMatch,
  className,
}: {
  label: string;
  /** The chosen ticker, or "" for none. */
  value: string;
  coins: Coin[];
  onChange: (ticker: string) => void;
  placeholder: string;
  /** "Use “{ticker}” as the ticker". */
  useTicker: string;
  noMatch: string;
  className: string;
}) {
  const id = useId();
  const named = coins.find((c) => c.ticker === value);
  const shown = value ? (named ? `${named.ticker} · ${named.name}` : value) : "";
  const [query, setQuery] = useState<string | null>(null); // null: not searching
  const [active, setActive] = useState(0);
  /* Whether anything was typed since the list opened. Tabbing through the box
     opens and closes it without typing, and must leave the coin as it was. */
  const [edited, setEdited] = useState(false);
  const openList = () => {
    setQuery("");
    setActive(0);
    setEdited(false);
  };

  const q = (query ?? "").trim();
  const matches = useMemo(() => {
    const lq = q.toLowerCase();
    if (!lq) return coins.slice(0, MAX_SHOWN);
    // Ticker starting with the text first, then anything containing it.
    const score = (c: Coin) =>
      c.ticker.toLowerCase() === lq ? 0 : c.ticker.toLowerCase().startsWith(lq) ? 1 : c.name.toLowerCase().startsWith(lq) ? 2 : 3;
    return coins
      .filter((c) => c.ticker.toLowerCase().includes(lq) || c.name.toLowerCase().includes(lq))
      .sort((a, b) => score(a) - score(b))
      .slice(0, MAX_SHOWN);
  }, [coins, q]);
  const typed = q.toUpperCase();
  // A ticker the exchanges do not list, offered only when nothing in the list matches.
  const offerTyped = SYMBOL.test(typed) && matches.length === 0;
  const options = [...matches.map((c) => ({ ticker: c.ticker, text: `${c.ticker} · ${c.name}` })), ...(offerTyped ? [{ ticker: typed, text: useTicker.replace("{ticker}", typed) }] : [])];
  const open = query !== null;

  const pick = (ticker: string) => {
    onChange(ticker);
    setQuery(null);
  };
  /* Leaving the box: nothing typed, nothing changes. Typed an exact ticker:
     it counts as picked. Typed and emptied: the coin is cleared. Anything
     else is dropped. */
  const leave = () => {
    if (query === null) return;
    const exact = coins.find((c) => c.ticker === typed);
    if (edited && exact) onChange(exact.ticker);
    else if (edited && q === "") onChange("");
    setQuery(null);
  };

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${id}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={open ? (query ?? "") : shown}
        onFocus={(e) => {
          openList();
          e.currentTarget.select();
        }}
        // A click when the box already has the cursor (after a pick) reopens the list.
        onClick={() => {
          if (query === null) openList();
        }}
        onChange={(e) => {
          setQuery(e.target.value.slice(0, 40));
          setActive(0);
          setEdited(true);
        }}
        onBlur={leave}
        onKeyDown={(e) => {
          const move = (to: number) => {
            e.preventDefault();
            setQuery((v) => v ?? "");
            setActive(to);
            document.getElementById(`${id}-${to}`)?.scrollIntoView({ block: "nearest" });
          };
          if (e.key === "ArrowDown") move(Math.min(active + 1, options.length - 1));
          else if (e.key === "ArrowUp") move(Math.max(active - 1, 0)); else if (e.key === "Enter" && open && options[active]) {
            e.preventDefault();
            pick(options[active].ticker);
          } else if (e.key === "Escape") {
            setQuery(null);
          }
        }}
        className={className}
      />
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto border border-line bg-surface py-1 text-sm shadow-lg"
        >
          {options.length === 0 && <li className="px-3 py-2 text-muted">{noMatch}</li>}
          {options.map((o, i) => (
            <li
              key={`${o.ticker}-${i}`}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: it fires before the input's blur.
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o.ticker);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 ${i === active ? "bg-primary-500 text-white" : "text-ink"}`}
            >
              {o.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
