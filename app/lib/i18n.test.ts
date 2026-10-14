/* Unit tests for the locale URL rules and the translation files.
   Run: node --test app/lib/i18n.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { LOCALES, localDate, localeHref, numberFormat, plural, splitLocale } from "./i18n.ts";
import { en } from "./messages/en.ts";
import { es } from "./messages/es.ts";
import { ga } from "./messages/ga.ts";
import { pt } from "./messages/pt.ts";

test("splitLocale reads the prefix", () => {
  assert.deepEqual(splitLocale("/"), { locale: "en", path: "/" });
  assert.deepEqual(splitLocale("/tools/ireland-vat"), { locale: "en", path: "/tools/ireland-vat" });
  assert.deepEqual(splitLocale("/ga"), { locale: "ga", path: "/" });
  assert.deepEqual(splitLocale("/es/"), { locale: "es", path: "/" });
  assert.deepEqual(splitLocale("/pt/about"), { locale: "pt", path: "/about" });
  assert.deepEqual(splitLocale("/en/blog"), { locale: "en", path: "/blog" });
  // A segment that merely starts like a locale is a path, not a prefix.
  assert.deepEqual(splitLocale("/gallery"), { locale: "en", path: "/gallery" });
});

test("localeHref prefixes translated pages only", () => {
  assert.equal(localeHref("en", "/"), "/");
  assert.equal(localeHref("ga", "/"), "/ga");
  assert.equal(localeHref("es", "/#faq"), "/es#faq");
  assert.equal(localeHref("pt", "/?x=1"), "/pt?x=1");
  assert.equal(localeHref("ga", "/tools/ireland-vat"), "/ga/tools/ireland-vat");
  assert.equal(localeHref("es", "/contact"), "/es/contact");
  // Chrome-only: an English body under the reader's header and footer.
  assert.equal(localeHref("es", "/blog"), "/es/blog");
  assert.equal(localeHref("pt", "/blog/some-post?page=2"), "/pt/blog/some-post?page=2");
  assert.equal(localeHref("en", "/blog"), "/blog");
  // English only: admin, and a bare section with no page of its own.
  assert.equal(localeHref("ga", "/admin"), "/admin");
  assert.equal(localeHref("es", "/budget"), "/budget");
});

test("plural picks the language's own category", () => {
  const years = { one: "{n} year", other: "{n} years" };
  assert.equal(plural("en", 1, years), "1 year");
  assert.equal(plural("en", 5, years), "5 years");
  // Irish has five categories: 1 one, 2 two, 3-6 few, 7-10 many, else other.
  const ga = { one: "o{n}", two: "t{n}", few: "f{n}", many: "m{n}", other: "x{n}" };
  assert.deepEqual([1, 2, 3, 7, 11].map((n) => plural("ga", n, ga)), ["o1", "t2", "f3", "m7", "x11"]);
  // A category a language does not list falls back to `other`.
  assert.equal(plural("es", 1000000, { one: "{n} año", other: "{n} años" }), "1.000.000 años");
});

test("numberFormat follows each language's conventions", () => {
  const eur = { style: "currency", currency: "EUR" } as const;
  assert.equal(numberFormat("en", eur).format(85000.5), "€85,000.50");
  assert.equal(numberFormat("ga", eur).format(85000.5), "€85,000.50");
  assert.equal(numberFormat("es", eur).format(85000.5), "85.000,50\u00a0€");
  assert.equal(numberFormat("pt", eur).format(85000.5), "€\u00a085.000,50");
});

const PLURAL_CATEGORIES = ["zero", "one", "two", "few", "many", "other"];
function isPluralForms(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.includes("other") && keys.every((k) => PLURAL_CATEGORIES.includes(k));
}

test("localDate rewrites only the dates it can read", () => {
  assert.equal(localDate("en", "July 2026"), "July 2026");
  assert.equal(localDate("es", "July 2026"), "julio de 2026");
  assert.equal(localDate("pt", "1 January 2025"), "1 de janeiro de 2025");
  assert.equal(localDate("ga", "October 2026"), "Deireadh Fómhair 2026");
  // Free text an admin typed is left alone rather than guessed at.
  assert.equal(localDate("es", "from Budget day"), "from Budget day");
});

/** Every key path, with array lengths, so a missing string fails here.
    A list of plain strings (paragraphs, search keywords) may differ in
    length; a list of objects pairs by index with hrefs, so it may not. */
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) return [`${path}[]`];
  // Plural forms: each language lists its own categories (Irish has five).
  if (isPluralForms(value)) return [`${path}{plural}`];
  if (Array.isArray(value)) {
    return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => shape(v, `${path}.${k}`));
  }
  return [path];
}

for (const [name, messages] of Object.entries({ es, ga, pt })) {
  test(`${name} has exactly the English keys`, () => {
    assert.deepEqual(shape(messages).sort(), shape(en).sort());
  });
}

/* Every Translations export in messages/: each language carries exactly the
   English keys, so a string added in English and forgotten elsewhere fails. */
const dir = new URL("./messages/", import.meta.url);
for (const file of readdirSync(dir).filter((f) => !/^(index|en|es|ga|pt)\.ts$/.test(f))) {
  const mod: Record<string, unknown> = await import(new URL(file, dir).href);
  for (const [exportName, value] of Object.entries(mod)) {
    if (!value || typeof value !== "object" || !LOCALES.every((l) => l in value)) continue;
    const all = value as Record<string, unknown>;
    for (const locale of LOCALES.filter((l) => l !== "en")) {
      test(`${file} ${exportName}.${locale} has exactly the English keys`, () => {
        assert.deepEqual(shape(all[locale]).sort(), shape(all.en).sort());
      });
    }
  }
}

/* Budget 2027: the English templates in messages/budget.ts, filled by
   budgetWords, must say exactly what lib/budget-2027.ts says, for every
   measure and every variant. A translation is only as right as the English
   it was made from. */
test("Budget 2027 English templates match the module's own sentences", async () => {
  const { personalise, allMeasures, EMPTY_PROFILE } = await import("./budget-2027.ts");
  const { budgetWords } = await import("./budget-2027-words.ts");
  const { budgetMessages } = await import("./messages/budget.ts");
  const en = budgetMessages.en;
  const f = {
    eur: (n: number) => numberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n)),
    eur2: (n: number) => numberFormat("en", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
    num: (n: number) => numberFormat("en").format(n),
    pct: (n: number) => `${n}%`,
  };
  const everything = Object.fromEntries(
    Object.entries(EMPTY_PROFILE).map(([k, v]) => [k, typeof v === "boolean" ? true : v]),
  ) as typeof EMPTY_PROFILE;
  const profiles = [
    { ...everything, singleParent: false, employmentIncome: 52_000, spouseIncome: 21_000, minimumWageHours: 30, selfEmploymentIncome: 8_000, rentMonthly: 1_400, homePrice: 420_000, taxPaidFourYears: 31_000, childrenUnder12: 2, children12Plus: 1, childcareHours: 25, studentsInCollege: 1, petrolLitresPerWeek: 40, dieselLitresPerWeek: 35, heatingOilLitresPerYear: 1_500, gasKwhPerYear: 11_000, packsPerWeek: 5 },
    { ...everything, married: false, homeCarer: false, employmentIncome: 38_000, rentMonthly: 1_100, homePrice: 610_000, taxPaidFourYears: 0, petrolLitresPerWeek: 0, dieselLitresPerWeek: 0, heatingOilLitresPerYear: 0, gasKwhPerYear: 0, packsPerWeek: 0, childcareHours: 0, minimumWageHours: 20 },
    { ...EMPTY_PROFILE, employee: true, employmentIncome: 45_000, buyingFirstHome: true, homePrice: 300_000, taxPaidFourYears: 0 },
  ];
  for (const profile of profiles) {
    const r = personalise(profile);
    for (const line of [...r.exact, ...r.perUnit, ...r.info]) {
      const words = budgetWords(line, en, f);
      const own = line.impact.kind === "exact" ? line.impact.detail : line.impact.text;
      assert.equal(words.body, own, line.id);
      if (line.impact.kind === "perUnit") {
        assert.equal(words.change, line.impact.change, `${line.id} change`);
        assert.equal(words.estimate, line.impact.estimate, `${line.id} estimate`);
      }
    }
  }
  for (const m of allMeasures()) {
    const t = en.measures[m.id];
    assert.ok(t, m.id);
    assert.equal(t.title, m.title, m.id);
    assert.equal(t.summary, m.summary, m.id);
    assert.equal(t.starts, m.starts.label, m.id);
    assert.equal(en.statuses[m.status], m.statusLabel, m.id);
    assert.equal(en.groups[m.group], m.group, m.id);
  }
});
