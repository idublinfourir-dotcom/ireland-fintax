"use server";

/* News agent admin actions: start a run on GitHub Actions now, and clear a
   calculator's rate check. Both re-check requireAdmin and are audited. */

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../lib/auth/guards";
import {
  dismissRateCheck,
  dispatchNewsAgent,
  isRunInProgress,
  latestNewsRun,
  type LatestRun,
} from "../../lib/news-admin";
import { allowPublicAction } from "../../lib/rate-limit";
import { recordAudit } from "../../lib/rate-audit";

export interface RunNowState {
  status: "idle" | "started" | "error";
  message?: string;
}

export async function runNewsAgentAction(): Promise<RunNowState> {
  const user = await requireAdmin();

  // Each run spends free model quota and fetches from public sites; a few an
  // hour is plenty for a person, and a stuck button cannot hammer either.
  const allowed = await allowPublicAction({
    action: "news-agent-run",
    identity: user.email,
    ip: { max: 10, windowSeconds: 3600 },
    identityLimit: { max: 4, windowSeconds: 3600 },
  });
  if (!allowed) return { status: "error", message: "That is enough runs for this hour. Try again later." };

  try {
    if (await isRunInProgress()) {
      return { status: "error", message: "A run is already in progress. Its result will appear below when it finishes." };
    }
  } catch (err) {
    console.error("[news] run check failed:", err);
  }

  const result = await dispatchNewsAgent();
  if (!result.ok) return { status: "error", message: result.message };

  await recordAudit({
    area: "news-agent",
    action: "run",
    summary: "Started the news agent from the admin",
    changedBy: user.email,
  });
  return { status: "started" };
}

/** Polled by the Run now button while a run is on its way, so the page can
    refresh itself when the run finishes. */
export async function latestNewsRunAction(): Promise<LatestRun | null> {
  await requireAdmin();
  try {
    return await latestNewsRun();
  } catch (err) {
    console.error("[news] latest run read failed:", err);
    return null;
  }
}

export async function dismissRateCheckAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const key = String(formData.get("key") ?? "");
  try {
    await dismissRateCheck(key, user.email);
  } catch (err) {
    console.error("[news] rate check dismiss failed:", err);
    return;
  }
  revalidatePath("/admin/news");
  revalidatePath("/admin");
}
