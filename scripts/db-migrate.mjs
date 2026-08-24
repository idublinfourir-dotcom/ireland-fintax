// Apply db/schema.sql (default) or one migration file to Supabase:
// node scripts/db-migrate.mjs [db/migrations/<file>.sql]
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const sqlPath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : new URL("../db/schema.sql", import.meta.url);
const sql = readFileSync(sqlPath, "utf8");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  const { rows } = await pool.query(`
    select column_name, data_type
    from information_schema.columns
    where table_name = 'enquiries'
    order by ordinal_position
  `);
  console.log(`Migration applied: ${process.argv[2] ?? "db/schema.sql"}`);
  console.log("enquiries columns:");
  console.table(rows);
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
