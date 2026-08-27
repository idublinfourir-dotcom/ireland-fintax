import { MongoClient, type Db } from "mongodb";
import { MONGODB_DB, mongoUri } from "./db-config";

/* MongoDB connection. SERVER ONLY (Node runtime — never the edge).
 *
 * Importing this module must never throw or open a connection — `next build`
 * collects page data for static routes (e.g. /_not-found) that touch no
 * database, and a throw at import time crashes that pass. So the client is
 * built lazily on first use, exactly like the pg pool it replaces.
 *
 * The connect promise (not the client) is cached, so concurrent first calls
 * share one handshake instead of racing to open several. Caching on
 * globalThis survives hot reloads in dev and repeated serverless invocations
 * in prod.
 *
 * The env reads live in ./db-config so that the edge middleware can check
 * whether a backend exists without bundling the driver.
 */

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

export { MONGODB_DB, mongoUri, isDbConfigured } from "./db-config";

/** Shared, lazily-opened client. Throws when no backend is configured. */
export function getMongoClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClientPromise) return globalForMongo.mongoClientPromise;

  const uri = mongoUri();
  if (!uri) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI, or DB_USER + DB_PASSWORD + DB_CLUSTER, in .env.local (see .env.example).",
    );
  }

  const promise = new MongoClient(uri, {
    // Keeps a warm pool without holding open more sockets than a serverless
    // deployment can afford across concurrent instances.
    maxPoolSize: 10,
  })
    .connect()
    .catch((err) => {
      // A failed handshake must not poison every later call with the same
      // rejected promise — drop it so the next request retries.
      globalForMongo.mongoClientPromise = undefined;
      throw err;
    });

  globalForMongo.mongoClientPromise = promise;
  return promise;
}

/** The application database handle. */
export async function getDb(): Promise<Db> {
  return (await getMongoClient()).db(MONGODB_DB);
}
