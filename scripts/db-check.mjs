// One-off connectivity check: node scripts/db-check.mjs
import { readFileSync } from "node:fs";
import { Pool } from "pg";

// Minimal .env.local loader (no dependency on dotenv).
for (const line of readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8",
).split("\n")) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const { rows } = await pool.query(
    "select current_database() as db, current_user as usr, version() as version, now() as now",
  );
  console.log("Connected to Supabase Postgres====>");
  console.table(rows);
} catch (err) {
  console.error("Connection failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
