// Seed the reference data the app cannot fall back to in code:
//   node scripts/db-seed.mjs
//
// Only the mortgage comparison needs this. Every other calculator ships a
// versioned code default (`*_CONFIG_DEFAULT`) and reads the database purely as
// an override, so an empty database renders today's correct numbers. The
// mortgage tool has a static snapshot too, but the admin editor can only edit
// rows that exist — hence the seed.
//
// Re-runnable: each collection is seeded only when it is empty, so an admin's
// later edits are never overwritten. Run scripts/db-indexes.mjs first.
import { MongoClient } from "mongodb";
import { mongoUri, dbName } from "./load-env.mjs";

const OWNER = ["first-time", "trading-up", "switch"];
const INVESTMENT = ["investment"];

// The July 2026 snapshot, transcribed from the retired db/schema.sql seed.
// revertRatePercent = the variable rate a fixed product rolls to;
// cashbackPercent   = cashback as a percentage of the loan at drawdown.
const PRODUCTS = [
  ["Haven (AIB Group)", "4 Year Fixed",            "fixed-4",    3.2,  3.9,  0.9, true,  null,           3.95, null, OWNER],
  ["AIB",               "5 Year Fixed",            "fixed-5",    3.25, 3.86, 0.9, true,  null,           3.75, null, OWNER],
  ["Avant Money",       "Full-term Fixed",         "fixed-full", 3.4,  3.48, 0.9, false, "1% cashback",  null, 1,    OWNER],
  ["Avant Money",       "4 Year Fixed",            "fixed-4",    3.4,  3.7,  0.9, false, "2% cashback",  3.85, 2,    OWNER],
  ["Avant Money",       "3 Year Fixed",            "fixed-3",    3.6,  3.8,  0.9, false, null,           3.85, null, OWNER],
  ["Avant Money",       "7 Year Fixed",            "fixed-7",    3.45, 3.6,  0.8, false, null,           3.85, null, OWNER],
  ["Avant Money",       "10 Year Fixed",           "fixed-10",   3.5,  3.6,  0.8, false, null,           3.85, null, OWNER],
  ["Bank of Ireland",   "2 Year Fixed",            "fixed-2",    3.65, 4.0,  0.9, false, "2% cashback",  4.15, 2,    OWNER],
  ["Bank of Ireland",   "4 Year Fixed",            "fixed-4",    3.45, 3.9,  0.9, false, "2% cashback",  4.15, 2,    OWNER],
  ["Bank of Ireland",   "Standard Variable",       "variable",   4.15, 4.3,  0.9, false, null,           null, null, OWNER],
  ["PTSB",              "3 Year Fixed",            "fixed-3",    3.7,  4.1,  0.9, false, "2% cashback",  4.7,  2,    OWNER],
  ["PTSB",              "5 Year Fixed",            "fixed-5",    3.6,  4.0,  0.9, false, "2% cashback",  4.7,  2,    OWNER],
  ["AIB",               "Standard Variable",       "variable",   3.75, 3.9,  0.9, false, null,           null, null, OWNER],
  ["Haven (AIB Group)", "Variable",                "variable",   3.95, 4.1,  0.9, false, null,           null, null, OWNER],
  ["ICS Mortgages",     "3 Year Fixed",            "fixed-3",    3.95, 4.2,  0.9, false, null,           4.3,  null, OWNER],
  ["ICS Mortgages",     "Buy-to-Let 5 Year Fixed", "fixed-5",    4.55, 4.8,  0.7, false, null,           5.0,  null, INVESTMENT],
  ["Avant Money",       "Buy-to-Let Variable",     "variable",   4.75, 4.9,  0.7, false, null,           null, null, INVESTMENT],
  ["Bank of Ireland",   "Buy-to-Let 2 Year Fixed", "fixed-2",    4.65, 4.9,  0.7, false, null,           4.95, null, INVESTMENT],
];

// No _id here: it comes from the upsert filter, and naming it in $setOnInsert
// as well is a needless way to hit "the _id field cannot be modified".
const SETTINGS = {
  ratesAsOf: "July 2026",
  ltiFirstTime: 4.0,
  ltiTradingUp: 3.5,
  maxLtvOwner: 0.9,
  maxLtvInvestment: 0.7,
  maxAgeAtEnd: 70,
  maxTermOwner: 35,
  maxTermInvestment: 25,
};

const client = new MongoClient(mongoUri(), { serverSelectionTimeoutMS: 10_000 });

try {
  await client.connect();
  const db = client.db(dbName);
  const now = new Date();
  const report = [];

  const products = db.collection("mortgage_products");
  if ((await products.estimatedDocumentCount()) > 0) {
    report.push({ collection: "mortgage_products", action: "skipped (not empty)" });
  } else {
    const docs = PRODUCTS.map(
      ([
        lender,
        name,
        rateType,
        ratePercent,
        aprcPercent,
        maxLtv,
        green,
        cashback,
        revertRatePercent,
        cashbackPercent,
        audience,
      ]) => ({
        lender,
        name,
        rateType,
        ratePercent,
        aprcPercent,
        maxLtv,
        green,
        cashback,
        revertRatePercent,
        cashbackPercent,
        cashbackFlat: null,
        details: null,
        audience,
        active: true,
        updatedAt: now,
      }),
    );
    const { insertedCount } = await products.insertMany(docs);
    report.push({ collection: "mortgage_products", action: `inserted ${insertedCount}` });
  }

  const settings = db.collection("mortgage_settings");
  const { upsertedCount } = await settings.updateOne(
    { _id: 1 },
    { $setOnInsert: { ...SETTINGS, updatedAt: now } },
    { upsert: true },
  );
  report.push({
    collection: "mortgage_settings",
    action: upsertedCount ? "inserted 1" : "skipped (already present)",
  });

  console.log(`Seeded "${dbName}":`);
  console.table(report);
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
