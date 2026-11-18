/* Rows pasted from a spreadsheet or a CSV file into the crypto calculator.
   Columns in the calculator's order: date, type, coin, quantity, value in
   euro, fees in euro (fees optional). Tabs (a spreadsheet copy) or commas or
   semicolons (CSV); a header line is skipped. Pure, so it is unit-tested.
   What cannot be read is passed through as typed, and the calculator flags
   that row, so nothing is dropped silently. */

export interface PastedRow {
  date: string;
  kind: "buy" | "sell";
  coin: string;
  quantity: string;
  amount: string;
  fees: string;
}

/** Longest paste read, about 1,000 rows of spreadsheet text with room over. */
export const MAX_PASTE_CHARS = 200_000;

const SELL = /^(sell|sold|sale|swap|spend|spent|s)$/i;
const BUY = /^(buy|bought|purchase|b)$/i;

/** One CSV line into cells; a quoted cell may hold the separator. */
function cells(line: string, sep: string): string[] {
  if (sep === "\t" || !line.includes('"')) return line.split(sep);
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && quoted && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') quoted = !quoted;
    else if (ch === sep && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** "2026-03-20", "20/03/2026", "20-3-2026" or "20.03.2026" (Irish day first)
    to YYYY-MM-DD; anything else comes back as typed. */
export function pastedDate(s: string): string {
  const v = s.trim().split(/[ T]/)[0];
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(v);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return v;
}

const strip = (s: string) => s.replace(/[€\s\u00a0]/g, "");
/* Signs of which mark is the decimal one: it is followed by one, two or more
   than three digits, follows a lone 0, or comes after a group of thousands
   written with the other mark. "1,500" alone shows neither. */
const commaIsDecimal = (v: string) => /,\d{1,2}$|,\d{4,}$|^0,\d+$|\.\d{3},\d+$/.test(v);
const dotIsDecimal = (v: string) => /\.\d{1,2}$|\.\d{4,}$|^0\.\d+$|,\d{3}\.\d+$/.test(v);

/**
 * "€1,234.50", "1.234,50", "0,5" or "1 234" to "1234.50" style; empty stays
 * empty. `decimalComma`: the paste as a whole writes decimals with a comma
 * (continental Europe), so "1,500" is one and a half, not fifteen hundred.
 */
export function pastedNumber(s: string, decimalComma = false): string {
  let v = strip(s);
  if (decimalComma) return v.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (v.includes(",") && v.includes(".")) {
    // The later mark is the decimal point.
    v = v.lastIndexOf(",") > v.lastIndexOf(".") ? v.replace(/\./g, "").replace(",", ".") : v.replace(/,/g, "");
  } else if (/^[1-9]\d{0,2}(,\d{3})+$/.test(v)) v = v.replace(/,/g, "");
  else v = v.replace(",", ".");
  return v;
}

/**
 * Rows to add, plus the 1-based pasted lines whose type is neither a buy nor a
 * sale word. The calculator refuses the paste when that list is not empty:
 * guessing "buy" for a sale would get the tax wrong without a warning.
 * `words` adds the page's own labels ("Compra", "شراء") to the English ones.
 */
export function parsePastedTrades(
  text: string,
  words: { buy: string[]; sell: string[] } = { buy: [], sell: [] },
): { rows: PastedRow[]; badType: number[] } {
  const lines = text.slice(0, MAX_PASTE_CHARS).split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows: [], badType: [] };
  const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
  const low = (ws: string[]) => new Set(ws.map((w) => w.trim().toLowerCase()));
  const [buys, sells] = [low(words.buy), low(words.sell)];
  const kinds: ("buy" | "sell" | null)[] = [];
  const table = lines.map((line) => cells(line, sep).map((c) => c.trim()));
  // One reading of the comma for the whole paste, from the numbers that show it.
  const numbers = table.flatMap((c) => c.slice(3, 6).map(strip));
  const decimalComma = numbers.some(commaIsDecimal) && !numbers.some(dotIsDecimal);
  const rows = table.map(([date = "", kind = "", coin = "", quantity = "", amount = "", fees = ""]) => {
    const k = kind.toLowerCase();
    kinds.push(SELL.test(k) || sells.has(k) ? "sell" : BUY.test(k) || buys.has(k) ? "buy" : null);
    return {
      date: pastedDate(date),
      kind: kinds[kinds.length - 1] ?? ("buy" as const),
      coin: coin.slice(0, 40),
      quantity: pastedNumber(quantity, decimalComma),
      amount: pastedNumber(amount, decimalComma),
      fees: pastedNumber(fees, decimalComma),
    };
  });
  // A header line: the first line, with neither a date nor a buy or sale word.
  const skip = !/^\d{4}-\d{2}-\d{2}$/.test(rows[0].date) && kinds[0] === null ? 1 : 0;
  const badType = kinds.flatMap((k, i) => (i >= skip && k === null ? [i + 1] : []));
  return { rows: rows.slice(skip), badType };
}
