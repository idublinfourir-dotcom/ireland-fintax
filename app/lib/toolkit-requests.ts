/* Founders Hub resource requests: read + write. SERVER ONLY.

   Nothing is emailed automatically. A visitor fills in the request form, we
   store who they are and what they want, and a team member sends the file by
   hand from /admin/toolkits and marks the request sent. */

import { ObjectId } from "mongodb";
import {
  CASE_INSENSITIVE,
  toObjectId,
  toolkitRequestsCollection,
  type ToolkitRequestDoc,
} from "./collections";

export type RequestStatus = "pending" | "sent";

export interface ToolkitRequest {
  id: string;
  resourceTitle: string;
  name: string;
  phone: string;
  email: string;
  /** Requester's organisation website, stored with its scheme. */
  website: string;
  purpose: string;
  status: RequestStatus;
  sentAt: Date | null;
  createdAt: Date;
}

const fromDoc = (r: ToolkitRequestDoc): ToolkitRequest => ({
  id: r._id.toHexString(),
  resourceTitle: r.resourceTitle,
  name: r.name,
  phone: r.phone,
  email: r.email,
  website: r.website,
  purpose: r.purpose,
  status: r.status,
  sentAt: r.sentAt,
  createdAt: r.createdAt,
});

/** How many requests one address may submit per hour. */
export const REQUEST_RATE_LIMIT = 5;

export async function countRecentRequests(email: string): Promise<number> {
  const requests = await toolkitRequestsCollection();
  return requests.countDocuments(
    {
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
    },
    // Addresses are stored as the requester typed them, so the match has to
    // ignore case. The collation must match the collated index.
    { collation: CASE_INSENSITIVE },
  );
}

export async function createRequest(input: {
  resourceTitle: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  purpose: string;
}): Promise<void> {
  const requests = await toolkitRequestsCollection();
  await requests.insertOne({
    _id: new ObjectId(),
    ...input,
    status: "pending",
    sentAt: null,
    createdAt: new Date(),
  });
}

/** Newest first, pending ahead of sent so outstanding work surfaces at the top. */
export async function getToolkitRequests(limit = 200): Promise<ToolkitRequest[]> {
  const requests = await toolkitRequestsCollection();
  const docs = await requests
    .find()
    // "pending" sorts before "sent" alphabetically, which happens to be the
    // order we want. Stated explicitly so a new status value cannot silently
    // reorder the queue.
    .sort({ status: 1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(fromDoc);
}

export async function countPendingRequests(): Promise<number> {
  const requests = await toolkitRequestsCollection();
  return requests.countDocuments({ status: "pending" });
}

/** Flip a request to sent (or back to pending) after a team member acts on it. */
export async function setRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;

  const requests = await toolkitRequestsCollection();
  await requests.updateOne(
    { _id },
    { $set: { status, sentAt: status === "sent" ? new Date() : null } },
  );
}
