// Delete personal data past its retention period (app/lib/retention.ts), as
// /privacy promises: questions with their replies, and resource requests.
//   node scripts/retention-cleanup.ts            delete
//   node scripts/retention-cleanup.ts --dry-run  count only
// Run monthly by .github/workflows/retention.yml. Logs counts, never people.
import { MongoClient } from "mongodb";
import { dbName, mongoUri } from "./load-env.mjs";
import {
  RETENTION_YEARS,
  retentionCutoff,
  staleEnquiryFilter,
  staleToolkitRequestFilter,
} from "../app/lib/retention.ts";

const dryRun = process.argv.includes("--dry-run");
const cutoff = retentionCutoff(new Date());
const client = new MongoClient(mongoUri(), { serverSelectionTimeoutMS: 15_000 });

try {
  await client.connect();
  const db = client.db(dbName);
  const enquiries = db.collection("enquiries");
  const messages = db.collection("enquiry_messages");
  const requests = db.collection("toolkit_requests");

  const refs = (await enquiries.find(staleEnquiryFilter(cutoff), { projection: { ref: 1 } }).toArray())
    .map((e) => e.ref);
  const staleRequests = await requests.countDocuments(staleToolkitRequestFilter(cutoff));

  let deletedMessages = 0;
  let deletedQuestions = 0;
  let deletedRequests = 0;
  if (!dryRun) {
    // Replies first: a stop half way leaves questions behind for next month's
    // run, never replies without their question.
    if (refs.length) {
      deletedMessages = (await messages.deleteMany({ enquiryRef: { $in: refs } })).deletedCount;
      deletedQuestions = (await enquiries.deleteMany({ ref: { $in: refs } })).deletedCount;
    }
    deletedRequests = (await requests.deleteMany(staleToolkitRequestFilter(cutoff))).deletedCount;
  }

  console.log(
    `[retention] ${dryRun ? "dry run, " : ""}${RETENTION_YEARS}-year cutoff ${cutoff.toISOString()}: ` +
      `${refs.length} question(s) due (${deletedQuestions} deleted, ${deletedMessages} replies), ` +
      `${staleRequests} resource request(s) due (${deletedRequests} deleted)`,
  );
} finally {
  await client.close();
}
