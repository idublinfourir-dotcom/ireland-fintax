/* Unit tests for the locale URL rules and the translation files.
   Run: node --test app/lib/i18n.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { INTL_LOCALE, LOCALES, hasLocaleRoute, isEnglishOnly, isTranslated, localDate, localeHref, numberFormat, plural, shortDateTime, splitLocale, switchHref } from "./i18n.ts";
import { ar } from "./messages/ar.ts";
import { bn } from "./messages/bn.ts";
import { en } from "./messages/en.ts";
import { es } from "./messages/es.ts";
import { ga } from "./messages/ga.ts";
import { hi } from "./messages/hi.ts";
import { pt } from "./messages/pt.ts";

test("splitLocale reads the prefix", () => {
  assert.deepEqual(splitLocale("/"), { locale: "en", path: "/" });
  assert.deepEqual(splitLocale("/tools/ireland-vat"), { locale: "en", path: "/tools/ireland-vat" });
  assert.deepEqual(splitLocale("/ga"), { locale: "ga", path: "/" });
  assert.deepEqual(splitLocale("/es/"), { locale: "es", path: "/" });
  assert.deepEqual(splitLocale("/pt/about"), { locale: "pt", path: "/about" });
  assert.deepEqual(splitLocale("/ar/contact"), { locale: "ar", path: "/contact" });
  assert.deepEqual(splitLocale("/bn/about"), { locale: "bn", path: "/about" });
  assert.deepEqual(splitLocale("/hi"), { locale: "hi", path: "/" });
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

test("switchHref keeps the page, or falls back to that language's home", () => {
  assert.equal(switchHref("ar", "/tools/ireland-vat"), "/ar/tools/ireland-vat");
  assert.equal(switchHref("ar", "/blog/some-post"), "/ar/blog/some-post");
  assert.equal(switchHref("en", "/tools/ireland-vat"), "/tools/ireland-vat");
  // An English-only page has no Arabic version: go to the Arabic home page.
  assert.equal(switchHref("ar", "/investment-account"), "/ar");
  assert.equal(switchHref("en", "/investment-account"), "/investment-account");
});

test("plural picks the language's own category", () => {
  const years = { one: "{n} year", other: "{n} years" };
  assert.equal(plural("en", 1, years), "1 year");
  assert.equal(plural("en", 5, years), "5 years");
  // Irish has five categories: 1 one, 2 two, 3-6 few, 7-10 many, else other.
  const ga = { one: "o{n}", two: "t{n}", few: "f{n}", many: "m{n}", other: "x{n}" };
  assert.deepEqual([1, 2, 3, 7, 11].map((n) => plural("ga", n, ga)), ["o1", "t2", "f3", "m7", "x11"]);
  // A category a language does not list falls back to `other`.
  // Arabic has six: 0 zero, 1 one, 2 two, 3-10 few, 11-99 many, 100 other.
  const arForms = { zero: "z{n}", one: "o{n}", two: "t{n}", few: "f{n}", many: "m{n}", other: "x{n}" };
  assert.deepEqual([0, 1, 2, 3, 11, 100].map((n) => plural("ar", n, arForms)), ["z0", "o1", "t2", "f3", "m11", "x100"]);
  // Bangla and Hindi have two, and Bangla's "one" takes 0 as well as 1.
  const bnForms = { one: "o{n}", other: "x{n}" };
  assert.deepEqual([0, 1, 2].map((n) => plural("bn", n, bnForms)), ["o0", "o1", "x2"]);
  assert.deepEqual([0, 1, 2].map((n) => plural("hi", n, bnForms)), ["o0", "o1", "x2"]);
  assert.equal(plural("es", 1000000, { one: "{n} año", other: "{n} años" }), "1.000.000 años");
});

test("numberFormat follows each language's conventions", () => {
  const eur = { style: "currency", currency: "EUR" } as const;
  assert.equal(numberFormat("en", eur).format(85000.5), "€85,000.50");
  assert.equal(numberFormat("ga", eur).format(85000.5), "€85,000.50");
  assert.equal(numberFormat("es", eur).format(85000.5), "85.000,50\u00a0€");
  assert.equal(numberFormat("pt", eur).format(85000.5), "€\u00a085.000,50");
  // Arabic keeps Western digits, as euro amounts are written in Ireland.
  assert.match(numberFormat("ar", eur).format(85000.5), /85,000\.50/);
  // Bangla and Hindi: Irish grouping, not lakhs (85,00,000), and Western digits.
  assert.equal(numberFormat("bn", eur).format(8500000.5), "€8,500,000.50");
  assert.equal(numberFormat("hi", eur).format(8500000.5), "€8,500,000.50");
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
  assert.equal(localDate("hi", "1 January 2025"), "1 जनवरी 2025");
  assert.equal(localDate("bn", "1 January 2025"), "1 জানুয়ারি, 2025");
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

for (const [name, messages] of Object.entries({ es, ga, pt, ar, bn, hi })) {
  test(`${name} has exactly the English keys`, () => {
    assert.deepEqual(shape(messages).sort(), shape(en).sort());
  });
}

/* Every Translations export in messages/: each language carries exactly the
   English keys, so a string added in English and forgotten elsewhere fails. */
const dir = new URL("./messages/", import.meta.url);
/* Every set of copy, by name: the per-area exports plus the common files. */
const translationSets: [string, Record<string, unknown>][] = [["common", { en, ga, es, pt, ar, bn, hi }]];
for (const file of readdirSync(dir).filter((f) => !/^(index|en|es|ga|pt|ar|bn|hi)\.ts$/.test(f))) {
  const mod: Record<string, unknown> = await import(new URL(file, dir).href);
  for (const [exportName, value] of Object.entries(mod)) {
    if (!value || typeof value !== "object" || !LOCALES.every((l) => l in value)) continue;
    const all = value as Record<string, unknown>;
    translationSets.push([`${file} ${exportName}`, all]);
    for (const locale of LOCALES.filter((l) => l !== "en")) {
      test(`${file} ${exportName}.${locale} has exactly the English keys`, () => {
        assert.deepEqual(shape(all[locale]).sort(), shape(all.en).sort());
      });
    }
  }
}

/** Every string in `value` with its path. Plural forms are skipped: a
    language may write "one" as a word (Arabic "سنة واحدة") without {n}. */
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (isPluralForms(value)) return [];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}.${k}`));
  return [];
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

/* A translation that drops, renames or invents a {placeholder} renders the
   raw braces, or loses the visitor's figure, at runtime. Emphasis markers
   (*…*) must survive too, or the heading shows literal asterisks. */
for (const [name, all] of translationSets) {
  const english = new Map(strings(all.en));
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    test(`${name}.${locale} keeps every placeholder and emphasis marker`, () => {
      for (const [path, text] of strings(all[locale])) {
        const source = english.get(path);
        if (source === undefined) continue;
        assert.equal(placeholders(text), placeholders(source), `${path}: ${text}`);
        assert.equal((text.match(/\*/g) ?? []).length, (source.match(/\*/g) ?? []).length, `${path}: ${text}`);
      }
    });
  }
}

/* Bangla and Hindi write figures in Western digits (€8,500,000, 2027), as
   numberFormat does for them, not ৮,৫০০ or ८,५००. */
test("Bangla and Hindi copy uses Western digits only", () => {
  for (const [name, all] of translationSets) {
    for (const [path, text] of strings(all.bn)) assert.doesNotMatch(text, /[০-৯]/, `${name}${path}`);
    for (const [path, text] of strings(all.hi)) assert.doesNotMatch(text, /[०-९]/, `${name}${path}`);
  }
});

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

/* The site is a free learning platform, not a firm: no offer to do the work
   for the reader. The R&D page said "let us build the claim" until 26 Oct 2026. */
test("R&D copy makes no firm offer, in any language", async () => {
  const { rdMessages } = await import("./messages/rd.ts");
  const firm = /let us build|build the claim|con nosotros|com a gente|lig dúinn|دعنا/i;
  for (const locale of LOCALES) assert.doesNotMatch(JSON.stringify(rdMessages[locale]), firm, locale);
});

/* Every language's Budget templates, filled with real figures: no {name}
   left unreplaced, and no undefined or NaN where a figure should be. The
   profile ticks every situation, so every measure and variant renders. */
test("Budget 2027 templates fill completely in every language", async () => {
  const { personalise, EMPTY_PROFILE } = await import("./budget-2027.ts");
  const { budgetWords } = await import("./budget-2027-words.ts");
  const { budgetMessages } = await import("./messages/budget.ts");
  const all = Object.fromEntries(
    Object.entries(EMPTY_PROFILE).map(([k, v]) => [k, typeof v === "boolean" ? true : v]),
  ) as typeof EMPTY_PROFILE;
  const profiles = [
    { ...all, employmentIncome: 52_000, spouseIncome: 21_000, minimumWageHours: 30, rentMonthly: 1_400, homePrice: 420_000, taxPaidFourYears: 31_000, childrenUnder12: 2, children12Plus: 1, childcareHours: 25, studentsInCollege: 1, petrolLitresPerWeek: 40, dieselLitresPerWeek: 35, heatingOilLitresPerYear: 1_500, gasKwhPerYear: 11_000, packsPerWeek: 5 },
    { ...all, married: false, homeCarer: false, employmentIncome: 38_000, homePrice: 610_000, taxPaidFourYears: 0 },
    { ...EMPTY_PROFILE, employee: true, employmentIncome: 45_000, buyingFirstHome: true, homePrice: 300_000, taxPaidFourYears: 0 },
  ];
  for (const locale of LOCALES) {
    const f = {
      eur: (n: number) => numberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n)),
      eur2: (n: number) => numberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
      num: (n: number) => numberFormat(locale).format(n),
      pct: (n: number) => `${n}%`,
    };
    let rendered = 0;
    for (const profile of profiles) {
      const r = personalise(profile);
      for (const line of [...r.exact, ...r.perUnit, ...r.info]) {
        for (const [part, text] of Object.entries(budgetWords(line, budgetMessages[locale], f))) {
          if (text === undefined) continue;
          rendered++;
          assert.doesNotMatch(text, /\{\w+\}|undefined|NaN/, `${locale} ${line.id} ${part}: ${text}`);
        }
      }
    }
    assert.ok(rendered > 50, `${locale}: only ${rendered} strings rendered`);
  }
});

/* localDate writes month names from fixed tables, not the runtime's Intl
   data, so every browser matches the server. The tables must say exactly
   what Node's full ICU says, for every month and both shapes. */
test("localDate's tables match Node's Intl output for every month", () => {
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    names.forEach((name, m) => {
      const d = new Date(Date.UTC(2026, m, 13));
      const intl = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...o, timeZone: "UTC" }).format(d);
      assert.equal(localDate(locale, `13 ${name} 2026`), intl({ day: "numeric", month: "long", year: "numeric" }), `${locale} ${name}`);
      assert.equal(localDate(locale, `${name} 2026`), intl({ month: "long", year: "numeric" }), `${locale} ${name}`);
    });
  }
  assert.equal(shortDateTime("en", new Date(2026, 9, 3, 14, 5)), "03 Oct, 14:05");
  assert.equal(shortDateTime("ga", new Date(2026, 9, 3, 14, 5)), "03 DFómh, 14:05");
  assert.equal(shortDateTime("pt", new Date(2026, 9, 3, 9, 30)), "03 de out., 09:30");
});

test("every route is translated, chrome-only or English-only, exactly one", () => {
  // The proxy sends /ga/<English-only page> to English and keeps the prefix on
  // anything else, so a page missing from all three lists would 404 under a
  // language prefix instead of redirecting.
  const routes = (readdirSync("app", { recursive: true }) as string[])
    .map((f) => f.split("\\").join("/"))
    .filter((f) => /(^|\/)(page\.tsx|route\.ts)$/.test(f) && !/(^|\/)_/.test(f))
    .map((f) => "/" + f.replace(/\/?(page\.tsx|route\.ts)$/, "").replace(/\[[^\]]+\]/g, "x"));
  assert.ok(routes.length > 30, `found only ${routes.length} routes`);
  const wrong = routes.filter((r) => {
    const kinds = [isTranslated(r), hasLocaleRoute(r) && !isTranslated(r), isEnglishOnly(r)];
    return kinds.filter(Boolean).length !== 1;
  });
  assert.deepEqual(wrong, []);
});
