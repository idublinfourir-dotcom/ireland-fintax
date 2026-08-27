// One-off connectivity check: node scripts/db-check.mjs
import { MongoClient } from "mongodb";
import { mongoUri, dbName } from "./load-env.mjs";

const client = new MongoClient(mongoUri(), { serverSelectionTimeoutMS: 10_000 });

try {
  await client.connect();
  const db = client.db(dbName);

  const { version } = await db.admin().serverInfo();
  const collections = await db.listCollections().toArray();

  console.log(`Connected to MongoDB "${dbName}" (server ${version})`);

  if (collections.length === 0) {
    console.log(
      "\nNo collections yet. Run `node scripts/db-indexes.mjs` then `node scripts/db-seed.mjs`.",
    );
  } else {
    const counts = [];
    for (const { name } of collections.sort((a, b) => a.name.localeCompare(b.name))) {
      counts.push({
        collection: name,
        documents: await db.collection(name).estimatedDocumentCount(),
      });
    }
    console.table(counts);
  }
} catch (err) {
  console.error("Connection failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
