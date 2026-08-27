import type { Metadata } from "next";
import { requireAdmin } from "../../lib/auth/guards";
import {
  countPendingRequests,
  getToolkitRequests,
  type ToolkitRequest,
} from "../../lib/toolkit-requests";
import { RequestStatusButton } from "./request-status-button";

export const metadata: Metadata = {
  title: "Toolkits",
  robots: { index: false, follow: false },
};

const requestedAt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminToolkitsPage() {
  await requireAdmin();

  let requests: ToolkitRequest[] = [];
  let pending = 0;
  let loadError = false;
  try {
    [requests, pending] = await Promise.all([
      getToolkitRequests(100),
      countPendingRequests(),
    ]);
  } catch (err) {
    console.error("[toolkits] request log load failed:", err);
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Founders Hub
        </h2>
        <p className="mt-1 text-sm text-muted">
          Requests for the memos, templates, tax and VAT forms and setup guides
          listed on the{" "}
          <a
            href="/toolkits"
            className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-500"
          >
            public Founders Hub page
          </a>
          . Nothing is uploaded or emailed by the site: attach the file in your
          own mailbox, send it to the address below, then mark the request sent.
          {loadError && (
            <>
              {" "}
              Could not read the toolkit_requests table. Run{" "}
              <code className="rounded-none bg-surface-muted px-1.5 py-0.5 text-xs">
                node scripts/db-migrate.mjs
              </code>{" "}
              to create it.
            </>
          )}
        </p>
      </header>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <h3 className="font-display text-base font-semibold text-ink">
            Resource requests ({requests.length})
          </h3>
          {pending > 0 && (
            <span className="rounded-none bg-navy-900 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {pending} to send
            </span>
          )}
        </div>
        {requests.length === 0 ? (
          <p className="rounded-none border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
            No one has requested a resource yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => (
              <li
                key={r.id}
                className={`rounded-none border bg-white p-4 ${
                  r.status === "pending" ? "border-l-2 border-l-primary-500 border-line" : "border-line"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-ink">
                      {r.resourceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Requested {requestedAt.format(new Date(r.createdAt))}
                      {r.sentAt && ` · sent ${requestedAt.format(new Date(r.sentAt))}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-none px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        r.status === "sent"
                          ? "bg-secondary-50 text-secondary-600"
                          : "bg-primary-50 text-primary-600"
                      }`}
                    >
                      {r.status}
                    </span>
                    <RequestStatusButton id={r.id} status={r.status} />
                  </div>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-line pt-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Name
                    </dt>
                    <dd className="mt-0.5 text-ink">{r.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Email
                    </dt>
                    <dd className="mt-0.5 break-all">
                      <a
                        href={`mailto:${r.email}?subject=${encodeURIComponent(r.resourceTitle)}`}
                        className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-500"
                      >
                        {r.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Phone
                    </dt>
                    <dd className="mt-0.5 text-ink">{r.phone}</dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Website
                    </dt>
                    <dd className="mt-0.5 break-all">
                      {/* New rows are normalised to http(s) by the request
                          action; rows captured before this field existed hold
                          a placeholder, so only link what is actually a URL. */}
                      {/^https?:\/\//.test(r.website) ? (
                        <a
                          href={r.website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-500"
                        >
                          {r.website}
                        </a>
                      ) : (
                        <span className="text-muted">{r.website}</span>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Purpose
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line leading-6 text-ink-body">
                      {r.purpose}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
