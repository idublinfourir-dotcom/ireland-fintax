// Proof of write+read: node scripts/db-roundtrip.mjs
import { readFileSync } from "node:fs";
import { Pool } from "pg";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  // 1. create a throwaway table
  await pool.query(`
    create table if not exists connection_test (
      id serial primary key,
      note text,
      created_at timestamptz default now()
    )
  `);

  // 2. write a row
  const note = `hello from node @ ${new Date().toISOString()}`;
  await pool.query("insert into connection_test (note) values ($1)", [note]);

  // 3. read it back
  const { rows } = await pool.query(
    "select id, note, created_at from connection_test order by id desc limit 5",
  );

  console.log("Wrote + read back from Supabase. Last 5 rows:");
  console.table(rows);
  console.log("\nNow open Supabase dashboard -> Table Editor -> connection_test");
  console.log("Same rows there = backend truly connected end to end.");
} catch (err) {
  console.error("Failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
