// Names the hero files in public/ after their content and points
// app/components/sections.tsx at them: node scripts/hash-hero.mjs
// Runs before every `npm run dev` and `npm run build` (predev / prebuild).
//
// next.config.ts caches hero-N.<8 hex>.jpg|mp4 for a year as immutable, so a
// changed file has to change its name. To replace a clip or poster, drop the
// new one in public/ as plain hero-N.mp4 (or .jpg): this renames it, removes
// the old hashed file in that slot, and updates the reference. A file swapped
// in under its old hashed name is renamed too.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUBLIC = "public";
const SOURCE = "app/components/sections.tsx";
const NAME = /^hero-(\d+)(?:\.([0-9a-f]{8}))?\.(jpg|mp4)$/;

const hash = (file) => createHash("sha256").update(readFileSync(join(PUBLIC, file))).digest("hex").slice(0, 8);

/** "1.mp4" → every file in that slot, plain (new) ones first. */
const slots = new Map();
for (const file of readdirSync(PUBLIC)) {
  const m = NAME.exec(file);
  if (!m) continue;
  const key = `${m[1]}.${m[3]}`;
  const list = slots.get(key) ?? [];
  if (m[2]) list.push(file);
  else list.unshift(file);
  slots.set(key, list);
}

const changes = [];
const current = new Map();
for (const [key, files] of slots) {
  const [n, ext] = key.split(".");
  const plain = files.filter((f) => !NAME.exec(f)[2]);
  if (plain.length === 0 && files.length > 1) {
    console.error(`hash-hero: ${files.join(", ")} are all hero-${n}.${ext}; delete the old one(s).`);
    process.exit(1);
  }
  const keep = files[0];
  const name = `hero-${n}.${hash(keep)}.${ext}`;
  for (const old of files.slice(1)) {
    rmSync(join(PUBLIC, old));
    changes.push(`removed ${old}`);
  }
  if (keep !== name) {
    renameSync(join(PUBLIC, keep), join(PUBLIC, name));
    changes.push(`${keep} → ${name}`);
  }
  current.set(key, name);
}

const source = readFileSync(SOURCE, "utf8");
const updated = source.replace(/"\/hero-(\d+)(?:\.[0-9a-f]{8})?\.(jpg|mp4)"/g, (ref, n, ext) => {
  const name = current.get(`${n}.${ext}`);
  return name ? `"/${name}"` : ref;
});
if (updated !== source) {
  writeFileSync(SOURCE, updated);
  changes.push(`updated ${SOURCE}`);
}

if (changes.length) console.log(`hash-hero:\n  ${changes.join("\n  ")}`);
