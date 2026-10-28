/* House style: no em or en dashes anywhere in the repo (copy, code, comments,
   docs). Fails with file:line for each one. Machine-written drafts are
   cleaned by lib/dashes.ts before they reach the database, which this cannot
   see. The dashes appear here only as \u2013 / \u2014 escapes.
   Run: node --test app/lib/no-dashes.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BINARY = /\.(mp4|webm|jpe?g|png|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|7z|fig)$/i;
const DASH = /[\u2013\u2014]/;

test("no em or en dashes in tracked files", () => {
  const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter((f) => f && !BINARY.test(f));
  const hits: string[] = [];
  for (const file of files) {
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue; // listed but deleted in the working tree
    }
    if (!DASH.test(text)) continue;
    text.split("\n").forEach((line, i) => {
      if (DASH.test(line)) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(hits, [], `Use a comma, colon, brackets or "to" instead:\n${hits.join("\n")}`);
});
