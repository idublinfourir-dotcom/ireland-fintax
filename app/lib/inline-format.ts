/* Inline formatting inside a blog post's text blocks: **bold**, *italic*,
   `code`, [text](url) and bare https:// links. PURE module, unit-tested, shared
   by the public post page and the admin editor's preview.

   The output is a node tree, never an HTML string: components/post-body.tsx
   turns each node into a React element, so React escapes every character and
   nothing typed into a post can become markup or script. Raw HTML therefore
   shows up as literal text. Keep it that way; a formatter that emits HTML
   strings would need dangerouslySetInnerHTML and a sanitiser, and this app
   writes no raw HTML anywhere. */

export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; external: boolean; children: Inline[] }
  | { type: "break" };

/* ── links ─────────────────────────────────────────────────────────────── */

/**
 * A link target that is safe to render, or null.
 *
 * Allowed: http(s) addresses, mailto:, site-relative paths and #anchors.
 * Everything else (javascript:, data:, protocol-relative //host) is refused
 * and the link renders as its text alone.
 */
export function safeHref(
  raw: string,
): { href: string; external: boolean } | null {
  const href = raw.trim();
  if (/^https?:\/\//i.test(href)) {
    try {
      new URL(href);
      return { href, external: true };
    } catch {
      return null;
    }
  }
  if (/^mailto:[^\s]+$/i.test(href)) return { href, external: false };
  if (href.startsWith("/") && !href.startsWith("//")) {
    return { href, external: false };
  }
  if (/^#[\w-]*$/.test(href)) return { href, external: false };
  return null;
}

/* ── inline ────────────────────────────────────────────────────────────── */

const ESCAPABLE = "\\`*_[]()#+-.!|>~";
const LINK = /\[([^\]\n]{1,500})\]\(([^()\s]{1,2000})\)/y;
// Stops before trailing punctuation, so "see https://revenue.ie." keeps its
// full stop outside the link.
const AUTOLINK = /https?:\/\/[^\s<>()[\]]*[^\s<>()[\].,:;!?"']/y;

const isWordChar = (ch: string | undefined) => !!ch && /[\p{L}\p{N}]/u.test(ch);
const isSpace = (ch: string | undefined) => !ch || /\s/.test(ch);

/**
 * Inline nodes for one line of text.
 *
 * A closing delimiter is searched for once per kind: when none exists after
 * one position, none exists after any later one either, so `missing` records
 * it and the rest of the line is scanned in linear time. Without that, a line
 * of unmatched asterisks costs a full rescan per character.
 */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const missing = new Set<string>();
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer) out.push({ type: "text", value: buffer });
    buffer = "";
  };

  /* A closer for `delim` at or after `from`, or -1. Emphasis closers must
     follow a non-space character, and an underscore must not sit inside a
     word, so snake_case and "2 * 3" stay literal. */
  const findCloser = (delim: string, from: number): number => {
    if (missing.has(delim)) return -1;
    let at = text.indexOf(delim, from);
    while (at !== -1) {
      const before = text[at - 1];
      const after = text[at + delim.length];
      const ok =
        delim === "`" ||
        (!isSpace(before) &&
          (delim[0] !== "_" || !isWordChar(after)) &&
          // A single * or _ must not be half of a double one.
          (delim.length === 2 || (after !== delim && before !== delim)));
      if (ok) return at;
      at = text.indexOf(delim, at + 1);
    }
    missing.add(delim);
    return -1;
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === "\\" && i + 1 < text.length && ESCAPABLE.includes(text[i + 1])) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }

    if (ch === "`") {
      const end = findCloser("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ type: "code", value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "[") {
      LINK.lastIndex = i;
      const m = LINK.exec(text);
      if (m) {
        // Read before recursing: the label is parsed with these same sticky
        // regexes, which moves their lastIndex.
        const end = LINK.lastIndex;
        flush();
        // A link inside a link is invalid HTML, so the label keeps only text.
        const children = unlink(parseInline(m[1]));
        const target = safeHref(m[2]);
        if (target) out.push({ type: "link", ...target, children });
        else out.push(...children);
        i = end;
        continue;
      }
    }

    if (ch === "h" && (i === 0 || !isWordChar(text[i - 1]))) {
      AUTOLINK.lastIndex = i;
      const m = AUTOLINK.exec(text);
      const target = m && safeHref(m[0]);
      if (m && target) {
        flush();
        out.push({
          type: "link",
          ...target,
          children: [{ type: "text", value: m[0] }],
        });
        i += m[0].length;
        continue;
      }
    }

    if (ch === "*" || ch === "_") {
      const double = text[i + 1] === ch;
      const delim = double ? ch + ch : ch;
      const next = text[i + delim.length];
      // An opener must be followed by text, and an underscore opener must not
      // sit inside a word.
      const canOpen =
        !isSpace(next) && next !== ch && (ch === "*" || !isWordChar(text[i - 1]));
      if (canOpen) {
        const end = findCloser(delim, i + delim.length + 1);
        if (end !== -1) {
          flush();
          const children = parseInline(text.slice(i + delim.length, end));
          out.push({ type: double ? "strong" : "em", children });
          i = end + delim.length;
          continue;
        }
      }
      // No partner: the whole run is literal.
      buffer += delim;
      i += delim.length;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  flush();
  return out;
}

/** The same nodes with every link replaced by its contents. */
function unlink(nodes: Inline[]): Inline[] {
  return nodes.flatMap((n): Inline[] =>
    n.type === "link"
      ? unlink(n.children)
      : n.type === "strong" || n.type === "em"
        ? [{ ...n, children: unlink(n.children) }]
        : [n],
  );
}

/** The plain text of some inline nodes (heading ids, alt text, tests). */
export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) =>
      n.type === "text" || n.type === "code"
        ? n.value
        : n.type === "break"
          ? " "
          : inlineText(n.children),
    )
    .join("");
}

/** Multi-line text as inline nodes, each newline kept as a line break. */
export function parseLines(text: string): Inline[] {
  const out: Inline[] = [];
  text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .forEach((line, index) => {
      if (index > 0) out.push({ type: "break" });
      out.push(...parseInline(line));
    });
  return out;
}
