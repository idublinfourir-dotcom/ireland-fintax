/* Change-audit log, shared by every editable calculator (Project B reuses it).
   recordAudit never throws — an audit failure must not block the actual change. */

import { ObjectId } from "mongodb";
import { rateAuditCollection } from "./collections";

export interface RateAuditEntry {
  /** e.g. "cgt-settings", "cgt-multipliers". */
  area: string;
  /** e.g. "update", "add", "delete", "import", "reset", "reviewed". */
  action: string;
  summary: string;
  /** Field-level old→new (or the affected row). Stored as a subdocument. */
  details?: unknown;
  /** Admin email. */
  changedBy: string;
}

export interface RateAuditRow {
  id: string;
  area: string;
  action: string;
  summary: string | null;
  changedBy: string | null;
  changedAt: string;
}

export async function recordAudit(e: RateAuditEntry): Promise<void> {
  try {
    const audit = await rateAuditCollection();
    await audit.insertOne({
      _id: new ObjectId(),
      area: e.area,
      action: e.action,
      summary: e.summary,
      // Stored as a nested document rather than a JSON string, so the history
      // stays queryable.
      details: e.details === undefined ? null : e.details,
      changedBy: e.changedBy,
      changedAt: new Date(),
    });
  } catch (err) {
    console.error("[audit] record failed:", err);
  }
}

/**
 * Recent changes for an area, newest first.
 *
 * `areaLike` keeps the SQL LIKE patterns the six rate editors already pass
 * ("cgt-%", "vat%", …). Every one of them is a prefix match, so a trailing `%`
 * becomes an anchored regex and the prefix itself is escaped — an area name is
 * a literal, never a pattern.
 */
export async function getRecentAudit(
  areaLike: string,
  limit = 20,
): Promise<RateAuditRow[]> {
  try {
    const prefix = areaLike.endsWith("%") ? areaLike.slice(0, -1) : areaLike;
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const audit = await rateAuditCollection();
    const rows = await audit
      .find({ area: { $regex: `^${escaped}` } })
      .sort({ changedAt: -1 })
      .limit(limit)
      .toArray();

    return rows.map((r) => ({
      id: r._id.toHexString(),
      area: r.area,
      action: r.action,
      summary: r.summary,
      changedBy: r.changedBy,
      changedAt: r.changedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[audit] read failed:", err);
    return [];
  }
}
