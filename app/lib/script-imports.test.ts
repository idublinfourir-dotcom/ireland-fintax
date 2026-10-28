/* The scripts in scripts/ run under plain Node (the news agent and the
   retention job in GitHub Actions), not through Next's bundler. Node needs the
   file extension on every relative import, and an extensionless one in any
   module they load fails only at run time: that is how the news agent's run on
   16 Oct 2026 died. This walks each script's import graph and checks every
   runtime import names a file that exists. Type-only imports are erased before
   Node sees them, so they are skipped.
   Run: node --test app/lib/script-imports.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ENTRIES = readdirSync("scripts")
  .filter((f) => /\.(ts|mjs)$/.test(f))
  .map((f) => join("scripts", f));

/** Relative specifiers this module loads at run time. */
function runtimeImports(source: string): string[] {
  const code = source
    .replace(/^\s*\/\*[\s\S]*?\*\//gm, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const found: string[] = [];
  const fromClause = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?[^;]*?\sfrom\s+["'](\.{1,2}\/[^"']+)["']/g;
  for (const m of code.matchAll(fromClause)) if (!m[1]) found.push(m[2]);
  for (const m of code.matchAll(/(?:^|\n)\s*import\s+["'](\.{1,2}\/[^"']+)["']/g)) found.push(m[1]);
  for (const m of code.matchAll(/\bimport\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) found.push(m[1]);
  return found;
}

test("every module a Node script loads imports files that exist, with extensions", () => {
  assert.ok(ENTRIES.length >= 5, `found only ${ENTRIES.length} scripts`);
  const problems: string[] = [];
  const seen = new Set<string>();
  const queue = [...ENTRIES];
  while (queue.length) {
    const file = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of runtimeImports(readFileSync(file, "utf8"))) {
      const target = join(dirname(file), spec);
      if (!/\.(ts|tsx|mjs|js|json)$/.test(spec)) {
        problems.push(`${file}: "${spec}" has no file extension`);
      } else if (!existsSync(target)) {
        problems.push(`${file}: "${spec}" does not exist`);
      } else if (!spec.endsWith(".json")) {
        queue.push(relative(".", target));
      }
    }
  }
  assert.ok(seen.size > ENTRIES.length, "walked no further than the scripts themselves");
  assert.deepEqual(problems, []);
});
