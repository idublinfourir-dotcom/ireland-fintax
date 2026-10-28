// Minimal .env.local loader shared by the db-* scripts (no dotenv dependency).
// Next loads .env.local itself at runtime; these scripts run outside Next, so
// they need to do it by hand.
//
// A missing file is fine: in GitHub Actions the values arrive as real
// environment variables, and there is no .env.local on the runner. A value
// already in the environment wins over the file, the same precedence Next
// uses, so `MONGODB_DB=scratch node scripts/…` points a script elsewhere.
import { existsSync, readFileSync } from "node:fs";

const envFile = new URL("../.env.local", import.meta.url);

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

/**
 * The same connection string the app builds in app/lib/mongodb.ts: a complete
 * MONGODB_URI when given, otherwise the Atlas parts. Kept in step by hand:
 * the app module is TypeScript and these scripts are plain ESM.
 */
export function mongoUri() {
  const direct = process.env.MONGODB_URI?.trim();
  if (direct) return direct;

  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const cluster = process.env.DB_CLUSTER?.trim();
  if (!user || !password || !cluster) {
    console.error(
      "No MongoDB connection string. Set MONGODB_URI, or DB_USER + DB_PASSWORD + DB_CLUSTER, in .env.local or the environment",
    );
    process.exit(1);
  }

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${cluster}/?retryWrites=true&w=majority`;
}

export const dbName = process.env.MONGODB_DB?.trim() || "irelandfintax";
