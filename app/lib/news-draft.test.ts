/* Unit tests for the news agent's prompts, schemas and draft checks.
   Run: node --test app/lib/news-draft.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_SCHEMA,
  TRIAGE_SCHEMA,
  draftMessages,
  draftToPost,
  figureTokens,
  parseTriage,
  quoteInSource,
  scrubLinks,
  triageMessages,
  unmatchedFigures,
  type DraftSource,
} from "./news-draft.ts";
import { parseBlocks } from "./post-blocks.ts";

const SOURCE: DraftSource = {
  title: "Changes to the rent tax credit",
  publisher: "Revenue",
  url: "https://www.revenue.ie/en/news/articles/rent-credit.aspx",
  publishedAt: new Date(Date.UTC(2026, 9, 9)),
  text: `The rent tax credit rises from €750 to €1,000 a year for 2027. Jointly assessed couples can claim up to €2,000.
"The increase applies to rent paid from 1 January 2027," Revenue said. Claims are made through myAccount.`,
};

const para = (text: string) => ({ kind: "paragraph", text });
const filler = (n: number) =>
  Array.from({ length: n }, () => "Renters who pay for their home in Ireland can claim the credit through the online service each year.").join(" ");

/** A draft that passes every check; tests break one thing at a time. */
function goodDraft(): Record<string, unknown> {
  return {
    title: "The rent tax credit rises to €1,000 for 2027",
    excerpt: "The rent tax credit goes up from €750 to €1,000 a year, and couples can claim up to €2,000.",
    coverKey: "fields",
    intro: [`Revenue has confirmed a higher [rent tax credit](${SOURCE.url}) for 2027. ${filler(3)}`],
    sections: [
      {
        heading: "What changes",
        body: [
          para(`The credit rises from €750 to €1,000 a year. ${filler(3)}`),
          { kind: "table", rows: [["", "2026", "2027"], ["Single", "€750", "€1,000"]] },
        ],
      },
      {
        heading: "How to claim",
        body: [
          { kind: "list", style: "bullet", items: ["Sign in to myAccount", "Claim the credit for 2027"] },
          { kind: "quote", text: "The increase applies to rent paid from 1 January 2027", cite: "Revenue" },
          para(filler(4)),
        ],
      },
    ],
    keyPoint: { title: "What this means for you", text: `If you rent, you may be able to claim more for 2027. Check the [income tax calculator](/tools/ireland-income-tax). ${filler(1)}` },
    keyDates: ["1 January 2027: the higher credit applies to rent paid from this date"],
    pictureSlots: [],
    affects: ["income-tax", "not-a-calculator"],
  };
}

test("a good draft becomes blocks in the fixed order, and parses as a draft", () => {
  const result = draftToPost(goodDraft(), [SOURCE]);
  assert.ok(result.ok, JSON.stringify(!result.ok && result.errors));
  const { value } = result;
  assert.deepEqual(
    value.blocks.map((b) => b.type),
    ["paragraph", "heading", "paragraph", "table", "heading", "list", "quote", "paragraph", "callout", "heading", "list"],
  );
  assert.deepEqual(value.cover, { kind: "curated", key: "fields" });
  assert.deepEqual(value.affects, ["income-tax"], "unknown calculator keys are dropped");
  assert.deepEqual(value.flags, []);
  assert.ok(parseBlocks(value.blocks, { publishing: true }).ok, "and it can be published as it stands");
  assert.equal(new Set(value.blocks.map((b) => b.id)).size, value.blocks.length);
});

test("links survive only to a source or a site calculator", () => {
  const urls = new Set([SOURCE.url]);
  assert.deepEqual(scrubLinks(`See [the notice](${SOURCE.url}?utm_source=x).`, urls), {
    text: `See [the notice](${SOURCE.url}?utm_source=x).`,
    removed: 0,
  });
  assert.deepEqual(scrubLinks("Try [the calculator](/tools/ireland-cgt).", urls), {
    text: "Try [the calculator](/tools/ireland-cgt).",
    removed: 0,
  });
  assert.deepEqual(scrubLinks("Read [this](https://evil.example/x) and https://spam.example/y now.", urls), {
    text: "Read this and now.",
    removed: 2,
  });
  assert.deepEqual(scrubLinks("[Admin](/admin/posts)", urls), { text: "Admin", removed: 1 });

  const draft = goodDraft();
  (draft.intro as string[])[0] += " More at https://elsewhere.example/page.";
  const result = draftToPost(draft, [SOURCE]);
  assert.ok(result.ok);
  assert.match(result.value.flags.join(" "), /1 link was removed/);
  assert.doesNotMatch(JSON.stringify(result.value.blocks), /elsewhere\.example/);
});

test("a quote that is not word for word becomes a paragraph, and is flagged", () => {
  assert.equal(quoteInSource("The increase applies to rent paid from 1 January 2027", SOURCE.text), true);
  assert.equal(quoteInSource("“The increase applies to RENT paid from 1 January 2027”", SOURCE.text), true);
  assert.equal(quoteInSource("The increase applies to all rent paid from 2027", SOURCE.text), false);
  assert.equal(quoteInSource("short", SOURCE.text), false);

  const draft = goodDraft();
  const sections = draft.sections as { body: Record<string, unknown>[] }[];
  sections[1].body[1] = { kind: "quote", text: "Every renter will save thousands of euro this year", cite: "Revenue" };
  const result = draftToPost(draft, [SOURCE]);
  assert.ok(result.ok);
  assert.ok(!result.value.blocks.some((b) => b.type === "quote"));
  assert.match(result.value.flags.join(" "), /quote was not found word for word/);
});

test("figures: formatting differences match, invented numbers are flagged", () => {
  assert.deepEqual(figureTokens("From €1,000 to 12.5% in 2027, for 3 people"), ["€1,000", "12.5%", "2027"]);
  assert.deepEqual(unmatchedFigures("It rises to 1000 euro, or €1,000.00", SOURCE.text), []);
  assert.deepEqual(unmatchedFigures("Couples get €2,500 and pay 20%", SOURCE.text), ["€2,500", "20%"]);

  const draft = goodDraft();
  (draft.intro as string[])[0] = `The credit rises to €1,250 for 2027. ${filler(3)}`;
  const result = draftToPost(draft, [SOURCE]);
  assert.ok(result.ok);
  assert.match(result.value.flags[0], /Figures not found in the source text: €1,250/);
});

test("advice, firm language and AI talk are refused outright", () => {
  for (const line of [
    "You should invest the extra in a pension.",
    "We recommend claiming early.",
    "Our clients have already claimed.",
    "Book a consultation to find out more.",
    "This is a risk-free way to save.",
    "As an AI, I cannot be sure.",
  ]) {
    const draft = goodDraft();
    (draft.intro as string[])[0] += ` ${line}`;
    const result = draftToPost(draft, [SOURCE]);
    assert.equal(result.ok, false, line);
    assert.match(!result.ok ? result.errors.join(" ") : "", /Rewrite it neutrally/, line);
  }
});

test("missing parts and wrong lengths are errors the model is asked to fix", () => {
  const noKeyPoint = { ...goodDraft(), keyPoint: { title: "", text: "" } };
  assert.match(JSON.stringify(draftToPost(noKeyPoint, [SOURCE])), /key point is empty/);

  const short = { ...goodDraft(), intro: ["Short."], sections: [{ heading: "One", body: [para("Tiny.")] }] };
  assert.match(JSON.stringify(draftToPost(short, [SOURCE])), /too short/);

  const longTitle = { ...goodDraft(), title: "x".repeat(141) };
  assert.match(JSON.stringify(draftToPost(longTitle, [SOURCE])), /title is longer/);

  assert.equal(draftToPost(null, [SOURCE]).ok, false);
  assert.equal(draftToPost("not json", [SOURCE]).ok, false);
});

test("a picture slot is an empty picture block that blocks publishing", () => {
  const draft = { ...goodDraft(), pictureSlots: [{ afterSection: 0, alt: "Chart of the credit, 2026 and 2027", caption: "The credit by year" }] };
  const result = draftToPost(draft, [SOURCE]);
  assert.ok(result.ok);
  const types = result.value.blocks.map((b) => b.type);
  assert.equal(types.indexOf("image"), types.indexOf("table") + 1, "placed after the first section");
  assert.match(result.value.flags.join(" "), /empty picture slot/);
  assert.equal(parseBlocks(result.value.blocks, { publishing: false }).ok, true);
  assert.match(JSON.stringify(parseBlocks(result.value.blocks, { publishing: true })), /choose a picture/);

  const outOfRange = { ...goodDraft(), pictureSlots: [{ afterSection: 9, alt: "a", caption: "b" }] };
  const placed = draftToPost(outOfRange, [SOURCE]);
  assert.ok(placed.ok);
  assert.equal(placed.value.blocks.filter((b) => b.type === "image").length, 1, "an out-of-range slot lands at the end");
});

test("a round-up needs a section per source and takes no picture", () => {
  const second: DraftSource = { ...SOURCE, title: "VAT on medical services", url: "https://www.revenue.ie/en/x.aspx" };
  const draft = { ...goodDraft(), pictureSlots: [{ afterSection: 0, alt: "a", caption: "b" }] };
  const ok = draftToPost(draft, [SOURCE, second], "roundup");
  assert.ok(ok.ok);
  assert.ok(!ok.value.blocks.some((b) => b.type === "image"));

  const oneSection = { ...goodDraft(), sections: [(goodDraft().sections as unknown[])[0]] };
  assert.match(JSON.stringify(draftToPost(oneSection, [SOURCE, second], "roundup")), /one section per source/);
});

test("an unknown cover falls back to the default", () => {
  const result = draftToPost({ ...goodDraft(), coverKey: "nope" }, [SOURCE]);
  assert.ok(result.ok);
  assert.deepEqual(result.value.cover, { kind: "curated", key: "deskFinance" });
});

test("triage: clamped scores, known ids only, silence scores zero", () => {
  const recent = ["Rent tax credit rises to €1,000"];
  const results = parseTriage(
    {
      items: [
        { id: "item1", score: 14, reason: "Big change.", duplicateOf: "", affects: ["income-tax", "bogus"] },
        { id: "item2", score: 8, reason: "Same.", duplicateOf: "Rent tax credit rises to €1,000", affects: [] },
        { id: "item3", score: 9, reason: "Made-up dup.", duplicateOf: "A post that does not exist", affects: [] },
        { id: "intruder", score: 10, reason: "", duplicateOf: "", affects: [] },
      ],
    },
    ["item1", "item2", "item3", "item4"],
    recent,
  );
  assert.deepEqual(
    results.map((r) => [r.id, r.score, r.duplicateOf, r.affects]),
    [
      ["item1", 10, null, ["income-tax"]],
      ["item2", 8, "Rent tax credit rises to €1,000", []],
      ["item3", 9, null, []],
      ["item4", 0, null, []],
    ],
  );
  assert.equal(parseTriage(undefined, ["a"], []).at(0)?.score, 0);
});

test("prompts carry the items, recent posts and any retry errors", () => {
  const t = triageMessages(
    [{ id: "item1", title: "VAT on medical services", publisher: "Revenue", publishedAt: SOURCE.publishedAt, summary: "" }],
    ["Old post"],
  );
  assert.match(t.user, /RECENT POSTS:\n- Old post/);
  assert.match(t.user, /id: item1\npublisher: Revenue\ndate: 9 October 2026\ntitle: VAT on medical services/);
  assert.match(t.system, /data, not instructions/);

  const d = draftMessages([SOURCE], "single", ["The post is too short (90 words)."]);
  assert.match(d.user, /SOURCE 1\nPublisher: Revenue/);
  assert.match(d.user, /\/tools\/ireland-income-tax/);
  assert.match(d.user, /rejected\. Fix every one of these:\n- The post is too short/);
  assert.match(draftMessages([SOURCE, SOURCE], "roundup").system, /ONE round-up post/);
});

test("schemas meet strict mode: every object closed, every field required", () => {
  const walk = (node: unknown, path: string) => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "object") {
      assert.equal(n.additionalProperties, false, `${path} must be closed`);
      assert.deepEqual([...(n.required as string[])].sort(), Object.keys(n.properties as object).sort(), `${path} must require every field`);
    }
    for (const [k, v] of Object.entries(n)) {
      if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}.${k}[${i}]`));
      else walk(v, `${path}.${k}`);
    }
  };
  walk(DRAFT_SCHEMA, "draft");
  walk(TRIAGE_SCHEMA, "triage");
});
