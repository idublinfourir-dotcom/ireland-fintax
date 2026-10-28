// Seed the reference data the app cannot fall back to in code:
//   node scripts/db-seed.mjs
//
// Only the mortgage comparison needs this. Every other calculator ships a
// versioned code default (`*_CONFIG_DEFAULT`) and reads the database purely as
// an override, so an empty database renders today's correct numbers. The
// mortgage tool has a static snapshot too, but the admin editor can only edit
// rows that exist: hence the seed.
//
// Re-runnable: each collection is seeded only when it is empty, so an admin's
// later edits are never overwritten. Run scripts/db-indexes.mjs first.
import { MongoClient } from "mongodb";
import { mongoUri, dbName } from "./load-env.mjs";

const OWNER = ["first-time", "trading-up", "switch"];
const INVESTMENT = ["investment"];

// The October 2026 snapshot, re-checked on the lenders' own sites on 28 Oct
// 2026 (docs/site-improvement-plan.md, P1.3). Products the lenders have
// withdrawn are seeded hidden (active false) with their July 2026 rate.
// revertRatePercent = the variable rate a fixed product rolls to;
// cashbackPercent   = cashback as a percentage of the loan at drawdown.
const PRODUCTS = [
  ["Haven (AIB Group)", "4 Year Fixed",             "fixed-4",    3.2,  3.9,  0.9, true,  null,          4.15, null, OWNER,      true],
  ["AIB",               "5 Year Fixed",             "fixed-5",    3.4,  3.97, 0.9, true,  null,          4.15, null, OWNER,      true],
  ["Bank of Ireland",   "2 Year Fixed",             "fixed-2",    4.1,  4.2,  0.9, false, "2% cashback", 4.15, 2,    OWNER,      true],
  ["Bank of Ireland",   "5 Year Fixed",             "fixed-5",    4.2,  4.3,  0.9, false, "2% cashback", 4.15, 2,    OWNER,      true],
  ["Bank of Ireland",   "Standard Variable",        "variable",   4.15, 4.3,  0.9, false, null,          null, null, OWNER,      true],
  ["AIB",               "LTV Variable",             "variable",   4.15, 4.24, 0.9, false, null,          null, null, OWNER,      true],
  ["Haven (AIB Group)", "Variable",                 "variable",   4.15, 4.3,  0.9, false, null,          null, null, OWNER,      true],
  ["Avant Money",       "Flex Mortgage (variable)", "variable",   4.34, 4.45, 0.9, false, null,          null, null, OWNER,      true],
  ["Bank of Ireland",   "Buy-to-Let 2 Year Fixed",  "fixed-2",    5.95, 6.3,  0.7, false, null,          4.85, null, INVESTMENT, true],
  ["Avant Money",       "3 Year Fixed",             "fixed-3",    3.7,  3.97, 0.9, false, "2% cashback", 3.95, 2,    OWNER,      true],
  ["Avant Money",       "4 Year Fixed",             "fixed-4",    3.7,  3.94, 0.9, false, "2% cashback", 3.95, 2,    OWNER,      true],
  ["Avant Money",       "5 Year Fixed",             "fixed-5",    3.7,  3.92, 0.9, false, "2% cashback", 3.95, 2,    OWNER,      true],
  ["Avant Money",       "7 Year Fixed",             "fixed-7",    3.95, 4.05, 0.9, false, "2% cashback", 3.95, 2,    OWNER,      true],
  ["Avant Money",       "10 Year Fixed",            "fixed-10",   3.95, 4.05, 0.9, false, "2% cashback", 3.95, 2,    OWNER,      true],
  ["Avant Money",       "Full-term Fixed",          "fixed-full", 3.8,  3.88, 0.9, false, "1% cashback", null, 1,    OWNER,      true],
  ["PTSB",              "3 Year Fixed",             "fixed-3",    4.25, 4.7,  0.9, false, "2% cashback", 4.7,  2,    OWNER,      true],
  ["PTSB",              "5 Year Fixed",             "fixed-5",    4.1,  4.55, 0.9, false, "2% cashback", 4.7,  2,    OWNER,      true],
  ["ICS Mortgages",     "3 Year Fixed",             "fixed-3",    5.95, 5.49, 0.9, false, null,          4.85, null, OWNER,      true],
  ["ICS Mortgages",     "Buy-to-Let Variable",      "variable",   5.8,  6.15, 0.7, false, null,          null, null, INVESTMENT, true],
  // Hidden: withdrawn by the lender.
  ["Bank of Ireland",   "4 Year Fixed",             "fixed-4",    3.45, 3.9,  0.9, false, "2% cashback", 4.15, 2,    OWNER,      false],
  ["ICS Mortgages",     "Buy-to-Let 5 Year Fixed",  "fixed-5",    4.55, 4.8,  0.7, false, null,          5.0,  null, INVESTMENT, false],
  ["Avant Money",       "Buy-to-Let Variable",      "variable",   4.75, 4.9,  0.7, false, null,          null, null, INVESTMENT, false],
];

// No _id here: it comes from the upsert filter, and naming it in $setOnInsert
// as well is a needless way to hit "the _id field cannot be modified".
const SETTINGS = {
  ratesAsOf: "October 2026",
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
        active,
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
        active,
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
