"use client";

/* The block editor: a post is a list of blocks, each edited in place in roughly
   the type it will be read in.

   Writing behaves like a document where it can: Enter in a paragraph starts a
   new paragraph (Shift+Enter is a line break), Backspace at the start of one
   joins it to the one before, and pasting text with blank lines in it makes
   one paragraph per chunk. Blocks are added from the menu between blocks or
   the bar at the end, dragged by their handle or moved with the arrow
   buttons, and removed with the cross. Bold, italic and links are applied
   with the toolbar or Ctrl/Cmd+B, I and K, and stored as the inline markers
   lib/inline-format.ts reads. */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { PostImg } from "../../components/post-body";
import { safeHref } from "../../lib/inline-format";
import {
  BLOCK_LABELS,
  BLOCK_LIMITS,
  BLOCK_TYPES,
  newBlock,
  type Block,
  type BlockType,
} from "../../lib/post-blocks";
import type { PostImage } from "../../lib/post-types";
import { ImagePicker } from "./image-picker";

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
}

type Of<T extends BlockType> = Extract<Block, { type: T }>;

const GLYPHS: Record<BlockType, string> = {
  paragraph: "¶",
  heading: "H",
  image: "▣",
  gallery: "▦",
  quote: "“",
  callout: "★",
  list: "•",
  table: "⊞",
  divider: "⋯",
  pagebreak: "⤓",
};

const HINTS: Record<BlockType, string> = {
  paragraph: "Body text",
  heading: "A section title",
  image: "Upload or pick one",
  gallery: "2 to 6 pictures",
  quote: "A line that stands out",
  callout: "A highlighted box",
  list: "Bullets or numbers",
  table: "Rows and columns",
  divider: "Space between parts",
  pagebreak: "Continue on a new page",
};

const plainInput =
  "w-full border border-line bg-white px-3 text-sm text-ink transition-colors duration-200 placeholder:text-muted/70 focus:border-primary-400 focus:outline-none";
const smallBtn =
  "inline-flex h-7 cursor-pointer items-center border border-line bg-white px-2.5 text-[11px] font-semibold text-ink-body transition-colors duration-200 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";
const segBtn = (on: boolean) =>
  `inline-flex h-7 cursor-pointer items-center px-2.5 text-[11px] font-semibold transition-colors duration-200 ${
    on ? "bg-navy-900 text-white" : "bg-white text-muted hover:text-ink"
  }`;

/* ── text fields ───────────────────────────────────────────────────────── */

/* Formatting cues for a text field: the same characters as the textarea, with
   markers faded and formatted text tinted. Colour, underline and background
   only, never weight or slant, because the textarea's caret sits on top of
   this and every glyph has to keep exactly the width it has there. Cosmetic
   only: what the reader sees comes from lib/inline-format.ts. */
const CUES = /(\*\*[^*\n]+?\*\*)|(\[[^\]\n]+\]\([^)\s]+\))|(`[^`\n]+`)|((?<![\w*])\*[^*\s][^*\n]*?\*(?![\w*]))/g;

function cues(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const dim = (s: string, k: string) => (
    <span key={k} className="text-muted/45">
      {s}
    </span>
  );
  let last = 0;
  for (const m of text.matchAll(CUES)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const [whole, bold, link, code] = m;
    const k = String(at);
    if (bold) {
      out.push(dim("**", `${k}a`), <span key={`${k}b`} className="bg-primary-50 text-ink">{bold.slice(2, -2)}</span>, dim("**", `${k}c`));
    } else if (link) {
      const split = link.indexOf("](");
      out.push(
        dim("[", `${k}a`),
        <span key={`${k}b`} className="text-primary-600 underline decoration-primary-300 underline-offset-2">{link.slice(1, split)}</span>,
        dim(link.slice(split), `${k}c`),
      );
    } else if (code) {
      out.push(<span key={k} className="bg-surface-muted text-ink">{code}</span>);
    } else {
      out.push(dim("*", `${k}a`), <span key={`${k}b`} className="text-primary-600">{whole.slice(1, -1)}</span>, dim("*", `${k}c`));
    }
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  // A trailing newline needs something after it to take up its line.
  out.push("\u200b");
  return out;
}

/** A textarea that grows with its content, with an optional floating toolbar
    for bold, italic and links. */
function TextField({
  value,
  onChange,
  placeholder,
  className,
  label,
  format = false,
  register,
  onKeyDown,
  onPaste,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
  label: string;
  format?: boolean;
  register?: (el: HTMLTextAreaElement | null) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [link, setLink] = useState<{ start: number; end: number; url: string; error: string } | null>(null);

  // Plain fields grow with their text; formatted ones take their height from
  // the cue layer underneath instead.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || format) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, format]);

  function wrap(before: string, after: string, fallback: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const picked = value.slice(s, e) || fallback;
    onChange(value.slice(0, s) + before + picked + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + picked.length);
    });
  }

  function openLink() {
    const el = ref.current;
    if (!el) return;
    setLink({ start: el.selectionStart, end: el.selectionEnd, url: "", error: "" });
  }

  function applyLink() {
    if (!link) return;
    const target = safeHref(link.url);
    if (!target) {
      setLink({
        ...link,
        error: "Use a full address starting https://, or a page on this site like /tools/ireland-cgt.",
      });
      return;
    }
    const text = value.slice(link.start, link.end) || "link text";
    const inserted = `[${text}](${target.href})`;
    onChange(value.slice(0, link.start) + inserted + value.slice(link.end));
    setLink(null);
    const el = ref.current;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(link.start + 1, link.start + 1 + text.length);
    });
  }

  function keyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (format && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === "b" || key === "i" || key === "k") {
        e.preventDefault();
        if (key === "b") wrap("**", "**", "bold text");
        else if (key === "i") wrap("*", "*", "italic text");
        else openLink();
        return;
      }
    }
    onKeyDown?.(e);
  }

  const keep = (e: React.MouseEvent) => e.preventDefault(); // keep the textarea's selection

  return (
    <div className="group/field relative">
      {format && (
        <div className="absolute -top-9 right-0 z-10 hidden items-center border border-line bg-white shadow-sm group-focus-within/field:flex">
          <button type="button" onMouseDown={keep} onClick={() => wrap("**", "**", "bold text")} title="Bold (Ctrl/Cmd+B)" className="h-7 w-8 cursor-pointer text-xs font-bold text-ink hover:bg-surface-muted">
            B
          </button>
          <button type="button" onMouseDown={keep} onClick={() => wrap("*", "*", "italic text")} title="Italic (Ctrl/Cmd+I)" className="h-7 w-8 cursor-pointer border-l border-line text-xs italic text-ink hover:bg-surface-muted">
            I
          </button>
          <button type="button" onMouseDown={keep} onClick={openLink} title="Link (Ctrl/Cmd+K)" className="h-7 cursor-pointer border-l border-line px-2.5 text-[11px] font-semibold text-ink underline decoration-primary-300 underline-offset-2 hover:bg-surface-muted">
            Link
          </button>
        </div>
      )}
      <div className="relative">
        {format && (
          <div aria-hidden="true" className={`pointer-events-none whitespace-pre-wrap break-words ${className}`}>
            {cues(value)}
          </div>
        )}
        <textarea
          ref={(el) => {
            ref.current = el;
            register?.(el);
          }}
          value={value}
          rows={1}
          aria-label={label}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={keyDown}
          onPaste={onPaste}
          className={`block w-full resize-none overflow-hidden border-0 bg-transparent p-0 placeholder:text-muted/50 focus:outline-none focus:ring-0 ${className} ${
            format ? "absolute inset-0 h-full whitespace-pre-wrap break-words text-transparent! caret-ink selection:bg-primary-300/40" : ""
          }`}
        />
      </div>
      {link && (
        <div className="mt-2 border border-line bg-white p-2 shadow-sm">
          <div className="flex gap-2">
            <input
              autoFocus
              value={link.url}
              onChange={(e) => setLink({ ...link, url: e.target.value, error: "" })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") setLink(null);
              }}
              placeholder="https://www.revenue.ie/… or /tools/ireland-cgt"
              aria-label="Link address"
              className={`${plainInput} h-8 font-mono text-xs`}
            />
            <button type="button" onClick={applyLink} className="h-8 shrink-0 cursor-pointer bg-primary-500 px-3 text-xs font-semibold text-white hover:bg-primary-600">
              Add link
            </button>
            <button type="button" onClick={() => setLink(null)} className="h-8 shrink-0 cursor-pointer px-2 text-xs font-semibold text-muted hover:text-ink">
              Cancel
            </button>
          </div>
          {link.error && <p className="mt-1.5 text-xs text-primary-600">{link.error}</p>}
        </div>
      )}
    </div>
  );
}

/* ── per-type editors ──────────────────────────────────────────────────── */

const bodyText = "text-[17px] leading-8 text-ink-body";

function ImageBlockEditor({ block, onChange }: { block: Of<"image">; onChange: (b: Block) => void }) {
  const [picking, setPicking] = useState(false);
  if (!block.image || picking) {
    return (
      <ImagePicker
        onPick={([image]) => {
          onChange({ ...block, image });
          setPicking(false);
        }}
        onCancel={block.image ? () => setPicking(false) : undefined}
      />
    );
  }
  return (
    <div>
      <PostImg image={block.image} width={1200} alt={block.alt} className="h-auto w-full bg-surface-muted" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex border border-line">
          <button type="button" onClick={() => onChange({ ...block, size: "normal" })} className={segBtn(block.size === "normal")}>
            Text width
          </button>
          <button type="button" onClick={() => onChange({ ...block, size: "wide" })} className={segBtn(block.size === "wide")}>
            Wide
          </button>
        </span>
        <button type="button" onClick={() => setPicking(true)} className={smallBtn}>
          Replace picture
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Describe it, for screen readers"
          aria-label="Picture description"
          className={`${plainInput} h-9`}
        />
        <input
          value={block.caption}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          aria-label="Caption"
          className={`${plainInput} h-9`}
        />
      </div>
    </div>
  );
}

function GalleryEditor({ block, onChange }: { block: Of<"gallery">; onChange: (b: Block) => void }) {
  const room = BLOCK_LIMITS.galleryMax - block.items.length;
  const [picking, setPicking] = useState(block.items.length === 0);
  const setItem = (i: number, patch: Partial<Of<"gallery">["items"][number]>) =>
    onChange({ ...block, items: block.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });

  return (
    <div>
      {block.items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {block.items.map((item, i) => (
            <li key={i} className="relative">
              <PostImg image={item.image} width={400} alt={item.alt} className="aspect-[4/3] w-full bg-surface-muted object-cover" />
              <button
                type="button"
                onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                aria-label={`Remove picture ${i + 1}`}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 cursor-pointer place-items-center bg-white/90 text-xs font-bold text-ink shadow-sm hover:bg-white"
              >
                ×
              </button>
              <input
                value={item.alt}
                onChange={(e) => setItem(i, { alt: e.target.value })}
                placeholder="Describe it"
                aria-label={`Description for picture ${i + 1}`}
                className={`${plainInput} mt-1.5 h-8 text-xs`}
              />
            </li>
          ))}
        </ul>
      )}
      {picking && room > 0 ? (
        <div className="mt-3">
          <ImagePicker
            multiple
            onPick={(images) => {
              const added = images.slice(0, room).map((image: PostImage) => ({ image, alt: "" }));
              onChange({ ...block, items: [...block.items, ...added] });
              setPicking(false);
            }}
            onCancel={block.items.length > 0 ? () => setPicking(false) : undefined}
          />
        </div>
      ) : (
        room > 0 && (
          <button type="button" onClick={() => setPicking(true)} className={`${smallBtn} mt-3`}>
            + Add pictures ({room} more)
          </button>
        )
      )}
      <input
        value={block.caption}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Caption for the gallery (optional)"
        aria-label="Gallery caption"
        className={`${plainInput} mt-3 h-9`}
      />
    </div>
  );
}

function ListEditor({ block, onChange }: { block: Of<"list">; onChange: (b: Block) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusItem, setFocusItem] = useState<{ i: number; n: number } | null>(null);
  useEffect(() => {
    if (focusItem) refs.current[focusItem.i]?.focus();
  }, [focusItem]);

  const setItems = (items: string[]) => onChange({ ...block, items });

  return (
    <div>
      <span className="mb-2 inline-flex border border-line">
        <button type="button" onClick={() => onChange({ ...block, style: "bullet" })} className={segBtn(block.style === "bullet")}>
          • Bullets
        </button>
        <button type="button" onClick={() => onChange({ ...block, style: "number" })} className={segBtn(block.style === "number")}>
          1. Numbers
        </button>
      </span>
      <ol className="space-y-1.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-3">
            <span aria-hidden="true" className="w-5 shrink-0 text-right text-sm font-semibold text-primary-500">
              {block.style === "number" ? `${i + 1}.` : "•"}
            </span>
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={item}
              onChange={(e) => setItems(block.items.map((it, j) => (j === i ? e.target.value : it)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (block.items.length >= BLOCK_LIMITS.listItems) return;
                  const next = [...block.items];
                  next.splice(i + 1, 0, "");
                  setItems(next);
                  setFocusItem((prev) => ({ i: i + 1, n: (prev?.n ?? 0) + 1 }));
                }
                if (e.key === "Backspace" && item === "" && block.items.length > 1) {
                  e.preventDefault();
                  setItems(block.items.filter((_, j) => j !== i));
                  setFocusItem((prev) => ({ i: Math.max(0, i - 1), n: (prev?.n ?? 0) + 1 }));
                }
              }}
              placeholder={i === 0 ? "List item (Enter adds another)" : "List item"}
              aria-label={`List item ${i + 1}`}
              className={`w-full border-0 border-b border-transparent bg-transparent py-0.5 ${bodyText} placeholder:text-muted/50 focus:border-line focus:outline-none`}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function TableEditor({ block, onChange }: { block: Of<"table">; onChange: (b: Block) => void }) {
  const rows = block.rows;
  const cols = rows[0]?.length ?? 1;
  const setRows = (next: string[][]) => onChange({ ...block, rows: next });

  return (
    <div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {Array.from({ length: cols }, (_, c) => (
                <th key={c} className="border-b border-line bg-white p-1 text-right">
                  <button
                    type="button"
                    disabled={cols <= 1}
                    onClick={() => setRows(rows.map((r) => r.filter((_, j) => j !== c)))}
                    aria-label={`Remove column ${c + 1}`}
                    className="cursor-pointer px-1 text-[11px] font-semibold text-muted hover:text-ink disabled:invisible"
                  >
                    ×
                  </button>
                </th>
              ))}
              <th className="w-8 border-b border-line bg-white" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={r === 0 ? "bg-surface-muted" : "border-t border-line"}>
                {row.map((cell, c) => (
                  <td key={c} className="min-w-28 border-r border-line p-0 last:border-r-0">
                    <input
                      value={cell}
                      onChange={(e) =>
                        setRows(rows.map((rr, i) => (i === r ? rr.map((cc, j) => (j === c ? e.target.value : cc)) : rr)))
                      }
                      placeholder={r === 0 ? "Heading" : ""}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                      className={`w-full bg-transparent px-3 py-2 focus:bg-white focus:outline-none ${r === 0 ? "font-semibold text-ink" : "text-ink-body"}`}
                    />
                  </td>
                ))}
                <td className="w-8 text-center">
                  <button
                    type="button"
                    disabled={rows.length <= 1}
                    onClick={() => setRows(rows.filter((_, i) => i !== r))}
                    aria-label={`Remove row ${r + 1}`}
                    className="cursor-pointer px-1 text-[11px] font-semibold text-muted hover:text-ink disabled:invisible"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={rows.length >= BLOCK_LIMITS.tableRows}
          onClick={() => setRows([...rows, new Array(cols).fill("")])}
          className={smallBtn}
        >
          + Row
        </button>
        <button
          type="button"
          disabled={cols >= BLOCK_LIMITS.tableCols}
          onClick={() => setRows(rows.map((r) => [...r, ""]))}
          className={smallBtn}
        >
          + Column
        </button>
        <span className="text-[11px] text-muted">The first row is the heading row.</span>
      </div>
    </div>
  );
}

/* ── menu ──────────────────────────────────────────────────────────────── */

function BlockMenu({ onPick, onClose }: { onPick: (type: BlockType) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Add a block"
      className="absolute left-1/2 top-full z-30 mt-1 grid w-[min(30rem,calc(100vw-3rem))] -translate-x-1/2 grid-cols-2 gap-1 border border-line bg-white p-2 shadow-xl shadow-navy-900/10"
    >
      {BLOCK_TYPES.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          role="menuitem"
          onClick={() => onPick(type)}
          className="flex cursor-pointer items-center gap-3 px-2.5 py-2 text-left transition-colors duration-150 hover:bg-surface-muted"
        >
          <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center border border-line text-sm font-semibold text-primary-600">
            {GLYPHS[type]}
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-ink">{label}</span>
            <span className="block text-[11px] text-muted">{HINTS[type]}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── the editor ────────────────────────────────────────────────────────── */

type FocusRequest = { id: string; at: "start" | "end" | number; n: number };

export function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
  const inputs = useRef(new Map<string, HTMLTextAreaElement>());
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [menuAt, setMenuAt] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  /* The block whose handle is held down. Only that row is draggable, and only
     while the handle is held: a row that was always draggable would turn text
     selection inside its fields into a drag, and a draggable <button> handle
     never starts a drag in Firefox. */
  const [armed, setArmed] = useState<string | null>(null);

  // Let go anywhere, not only over the handle, and the row stops being draggable.
  useEffect(() => {
    if (!armed) return;
    const release = () => setArmed(null);
    window.addEventListener("mouseup", release);
    return () => window.removeEventListener("mouseup", release);
  }, [armed]);

  // Move the caret where the last action asked for it (a new block, a join).
  useEffect(() => {
    if (!focus) return;
    const el = inputs.current.get(focus.id);
    if (!el) return;
    el.focus();
    const pos = focus.at === "start" ? 0 : focus.at === "end" ? el.value.length : focus.at;
    el.setSelectionRange(pos, pos);
  }, [focus]);

  // `n` only makes each request a new value, so asking twice still moves.
  const focusOn = (id: string, at: FocusRequest["at"]) =>
    setFocus((prev) => ({ id, at, n: (prev?.n ?? 0) + 1 }));

  const register = (id: string) => (el: HTMLTextAreaElement | null) => {
    if (el) inputs.current.set(id, el);
    else inputs.current.delete(id);
  };

  const replaceAt = (i: number, block: Block) => onChange(blocks.map((b, j) => (j === i ? block : b)));

  function add(index: number, type: BlockType) {
    const block = newBlock(type, newId());
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange(next);
    setMenuAt(null);
    focusOn(block.id, "start");
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
    const prev = blocks.slice(0, index).reverse().find((b) => inputs.current.has(b.id));
    if (prev) focusOn(prev.id, "end");
  }

  function moveTo(from: number, to: number) {
    if (to === from || to === from + 1) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to > from ? to - 1 : to, 0, moved);
    onChange(next);
  }

  function paragraphKeys(i: number, block: Of<"paragraph">, e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      // Split here: the text after the caret becomes the next paragraph.
      e.preventDefault();
      const before = el.value.slice(0, el.selectionStart).replace(/\s+$/, "");
      const after = el.value.slice(el.selectionEnd).replace(/^\s+/, "");
      const fresh: Block = { id: newId(), type: "paragraph", text: after };
      const next = [...blocks];
      next.splice(i, 1, { ...block, text: before }, fresh);
      onChange(next);
      focusOn(fresh.id, "start");
      return;
    }
    if (e.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0) {
      const prev = blocks[i - 1];
      if (block.text === "") {
        if (blocks.length > 1) {
          e.preventDefault();
          remove(i);
        }
      } else if (prev?.type === "paragraph") {
        // Join onto the paragraph above, caret at the seam.
        e.preventDefault();
        const joinAt = prev.text.length;
        const next = blocks.filter((_, j) => j !== i);
        next[i - 1] = { ...prev, text: prev.text + block.text };
        onChange(next);
        focusOn(prev.id, joinAt);
      }
    }
  }

  function paragraphPaste(i: number, block: Of<"paragraph">, e: ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n");
    const parts = text.split(/\n\s*\n/).map((c) => c.trim());
    if (parts.length < 2) return; // no blank line: paste as normal
    e.preventDefault();
    const el = e.currentTarget;
    const head = el.value.slice(0, el.selectionStart);
    const tail = el.value.slice(el.selectionEnd);
    /* Empty chunks in the middle are just extra blank lines. An empty first or
       last chunk is kept: a paste that starts (or ends) with a blank line puts
       its text in a paragraph of its own instead of gluing it to this one. */
    const chunks = [parts[0], ...parts.slice(1, -1).filter(Boolean), parts[parts.length - 1]];
    const made: Of<"paragraph">[] = chunks
      .map((chunk, k) => ({
        id: k === 0 ? block.id : newId(),
        type: "paragraph" as const,
        text:
          k === 0
            ? chunk ? head + chunk : head.replace(/\s+$/, "")
            : k === chunks.length - 1
              ? chunk ? chunk + tail : tail.replace(/^\s+/, "")
              : chunk,
      }))
      .filter((b, k) => k === 0 || b.text !== "");
    const next = [...blocks];
    next.splice(i, 1, ...made);
    onChange(next.slice(0, BLOCK_LIMITS.blocks));
    const last = made[made.length - 1];
    focusOn(last.id, Math.max(0, last.text.length - tail.length));
  }

  function editorFor(block: Block, i: number): ReactNode {
    switch (block.type) {
      case "paragraph":
        return (
          <TextField
            format
            value={block.text}
            onChange={(text) => replaceAt(i, { ...block, text })}
            placeholder={i === 0 ? "Start writing. Enter starts a new paragraph." : "Write…"}
            label="Paragraph"
            className={bodyText}
            register={register(block.id)}
            onKeyDown={(e) => paragraphKeys(i, block, e)}
            onPaste={(e) => paragraphPaste(i, block, e)}
          />
        );
      case "heading":
        return (
          <div>
            <span className="mb-2 inline-flex border border-line">
              <button type="button" onClick={() => replaceAt(i, { ...block, level: 2 })} className={segBtn(block.level === 2)}>
                Heading
              </button>
              <button type="button" onClick={() => replaceAt(i, { ...block, level: 3 })} className={segBtn(block.level === 3)}>
                Subheading
              </button>
            </span>
            <TextField
              value={block.text}
              onChange={(text) => replaceAt(i, { ...block, text: text.replace(/\n/g, " ") })}
              placeholder={block.level === 2 ? "Section heading" : "Subheading"}
              label="Heading"
              className={`font-display font-bold tracking-tight text-ink ${block.level === 2 ? "text-[1.75rem] leading-tight" : "text-xl leading-snug"}`}
              register={register(block.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Enter after a heading starts the paragraph under it.
                  e.preventDefault();
                  add(i + 1, "paragraph");
                }
              }}
            />
          </div>
        );
      case "image":
        return <ImageBlockEditor block={block} onChange={(b) => replaceAt(i, b)} />;
      case "gallery":
        return <GalleryEditor block={block} onChange={(b) => replaceAt(i, b)} />;
      case "quote":
        return (
          <div className="border-l-2 border-primary-500 pl-5">
            <TextField
              format
              value={block.text}
              onChange={(text) => replaceAt(i, { ...block, text })}
              placeholder="A line worth pulling out"
              label="Quote"
              className="font-display text-2xl font-medium leading-snug text-ink"
              register={register(block.id)}
            />
            <input
              value={block.cite}
              onChange={(e) => replaceAt(i, { ...block, cite: e.target.value })}
              placeholder="Who said it (optional)"
              aria-label="Quote source"
              className="mt-2 w-full border-0 bg-transparent p-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:outline-none"
            />
          </div>
        );
      case "callout":
        return (
          <div className="border-l-2 border-primary-500 bg-primary-50/70 px-5 py-4">
            <input
              value={block.title}
              onChange={(e) => replaceAt(i, { ...block, title: e.target.value })}
              placeholder="KEY POINT (or your own label)"
              aria-label="Key point label"
              className="w-full border-0 bg-transparent p-0 text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 placeholder:text-primary-600/50 focus:outline-none"
            />
            <div className="mt-2">
              <TextField
                format
                value={block.text}
                onChange={(text) => replaceAt(i, { ...block, text })}
                placeholder="The thing a reader must not miss"
                label="Key point"
                className="text-[17px] leading-8 text-ink"
                register={register(block.id)}
              />
            </div>
          </div>
        );
      case "list":
        return <ListEditor block={block} onChange={(b) => replaceAt(i, b)} />;
      case "table":
        return <TableEditor block={block} onChange={(b) => replaceAt(i, b)} />;
      case "divider":
        return (
          <div className="flex items-center gap-3 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <span className="h-px flex-1 bg-line" />
            • • • Section break
            <span className="h-px flex-1 bg-line" />
          </div>
        );
      case "pagebreak": {
        const pageNo = blocks.slice(0, i + 1).filter((b) => b.type === "pagebreak").length + 1;
        return (
          <div className="flex items-center gap-3 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-600">
            <span className="h-px flex-1 border-t-2 border-dashed border-primary-300" />
            Page break: page {pageNo} starts here
            <span className="h-px flex-1 border-t-2 border-dashed border-primary-300" />
          </div>
        );
      }
    }
  }

  /* The "+" between two blocks. A render helper, not a component: one defined
     inside this function would remount on every keystroke. */
  function inserter(index: number) {
    const open = menuAt === index;
    return (
      <div className="group/ins relative flex h-5 items-center justify-center">
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 top-1/2 h-px ${open ? "bg-primary-300" : "bg-transparent group-hover/ins:bg-line"}`}
        />
        <button
          type="button"
          onClick={() => setMenuAt(open ? null : index)}
          aria-label="Add a block here"
          aria-expanded={open}
          className={`relative grid h-5 w-5 cursor-pointer place-items-center rounded-full border border-line bg-white text-xs font-semibold text-muted transition-opacity duration-150 hover:border-primary-500 hover:text-primary-600 focus:opacity-100 ${
            open ? "opacity-100" : "opacity-0 group-hover/ins:opacity-100"
          }`}
        >
          +
        </button>
        {open && <BlockMenu onPick={(type) => add(index, type)} onClose={() => setMenuAt(null)} />}
      </div>
    );
  }

  return (
    <div>
      {blocks.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">Your post is empty. Pick a block below to start.</p>
      )}

      <div>
        {blocks.map((block, i) => (
          <div key={block.id}>
            {i > 0 && inserter(i)}
            <div
              data-block
              draggable={armed === block.id}
              onDragStart={(e) => {
                // A drag that began in a field (dragging selected text) is
                // the browser's, not a block move.
                if (armed !== block.id) return;
                setDragFrom(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", block.id);
              }}
              onDragEnd={() => {
                setArmed(null);
                setDragFrom(null);
                setDropAt(null);
              }}
              onDragOver={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                // Safari cancels the drop unless the target says it accepts a
                // move, matching the effectAllowed set on dragstart.
                e.dataTransfer.dropEffect = "move";
                const rect = e.currentTarget.getBoundingClientRect();
                setDropAt(e.clientY < rect.top + rect.height / 2 ? i : i + 1);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom !== null && dropAt !== null) moveTo(dragFrom, dropAt);
                setDragFrom(null);
                setDropAt(null);
              }}
              className={`group relative py-1 ${dragFrom === i ? "opacity-40" : ""}`}
            >
              {dropAt === i && dragFrom !== null && (
                <span aria-hidden="true" className="absolute inset-x-0 -top-1 h-0.5 bg-primary-500" />
              )}
              {dropAt === i + 1 && i === blocks.length - 1 && dragFrom !== null && (
                <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-500" />
              )}

              {/* Left gutter: drag handle and arrows. */}
              <div className="absolute -left-11 top-1 flex flex-col items-center gap-0.5 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                {/* Mouse only; the arrows below are the keyboard way to move. */}
                <span
                  aria-hidden="true"
                  data-drag-handle
                  onMouseDown={() => setArmed(block.id)}
                  title={`Drag to move this ${BLOCK_LABELS[block.type].toLowerCase()}`}
                  className="grid h-6 w-6 cursor-grab select-none place-items-center text-sm text-muted hover:text-ink active:cursor-grabbing"
                >
                  ⠿
                </span>
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveTo(i, i - 1)}
                  aria-label="Move up"
                  className="grid h-5 w-6 cursor-pointer place-items-center text-[11px] text-muted hover:text-ink disabled:invisible"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={i === blocks.length - 1}
                  onClick={() => moveTo(i, i + 2)}
                  aria-label="Move down"
                  className="grid h-5 w-6 cursor-pointer place-items-center text-[11px] text-muted hover:text-ink disabled:invisible"
                >
                  ▼
                </button>
              </div>

              {/* Right gutter: the block's type and delete. */}
              <div className="absolute -right-11 top-1 flex flex-col items-center gap-1 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove this ${BLOCK_LABELS[block.type].toLowerCase()}`}
                  title={`Remove this ${BLOCK_LABELS[block.type].toLowerCase()}`}
                  className="grid h-6 w-6 cursor-pointer place-items-center text-base text-muted hover:text-primary-600"
                >
                  ×
                </button>
                <span aria-hidden="true" className="text-[9px] font-semibold uppercase tracking-wider text-muted/70 [writing-mode:vertical-rl]">
                  {BLOCK_LABELS[block.type]}
                </span>
              </div>

              {editorFor(block, i)}
            </div>
          </div>
        ))}
      </div>

      {/* The add bar: every block type, always in view at the end. */}
      <div className="mt-8 border-t border-dashed border-line pt-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Add a block</p>
        <div className="flex flex-wrap gap-1.5">
          {BLOCK_TYPES.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              disabled={blocks.length >= BLOCK_LIMITS.blocks}
              onClick={() => add(blocks.length, type)}
              className="inline-flex h-8 cursor-pointer items-center gap-2 border border-line bg-white px-3 text-xs font-semibold text-ink-body transition-colors duration-200 hover:border-primary-500 hover:text-primary-600 disabled:opacity-40"
            >
              <span aria-hidden="true" className="text-primary-500">
                {GLYPHS[type]}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
