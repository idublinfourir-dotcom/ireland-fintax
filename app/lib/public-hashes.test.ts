/* next.config.ts caches the hero files in public/ for a year, marked
   immutable, on the promise that a changed file gets a new name: the 8 hex
   after the number are the start of its sha256. A file replaced under its old
   name would keep reaching visitors who already have the old one. This checks
   every name still matches its content, and that every one sections.tsx
   points at exists.
   Run: node --test app/lib/public-hashes.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const HASHED = /^hero-\d+\.([0-9a-f]{8})\.(?:jpg|mp4)$/;

test("every hero file in public/ is named after its content hash", () => {
  const files = readdirSync("public").filter((f) => f.startsWith("hero-"));
  assert.ok(files.length >= 2, `found only ${files.length} hero files`);
  const problems: string[] = [];
  for (const f of files) {
    const m = HASHED.exec(f);
    const actual = createHash("sha256").update(readFileSync(join("public", f))).digest("hex").slice(0, 8);
    if (!m) problems.push(`${f}: name has no hash, run node scripts/hash-hero.mjs`);
    else if (m[1] !== actual) problems.push(`${f}: content hash is ${actual}, run node scripts/hash-hero.mjs`);
  }
  assert.deepEqual(problems, []);
});

test("every hero file sections.tsx uses exists in public/", () => {
  const source = readFileSync("app/components/sections.tsx", "utf8");
  const used = [...source.matchAll(/"\/(hero-[^"]+)"/g)].map((m) => m[1]);
  assert.ok(used.length >= 2, `found only ${used.length} hero references`);
  const present = new Set(readdirSync("public"));
  assert.deepEqual(used.filter((f) => !present.has(f)), []);
});
