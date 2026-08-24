"use client";

/* One collapsible enquiry conversation on the client portal. Owns its own
   open/closed state so it:
     - stays OPEN after the client sends a reply (state survives the server
       revalidation, unlike the old <details open={…}> which snapped shut), and
     - only auto-opens on load when there's a genuinely new reply from the team
       (defaultOpen = unread), not for every thread. */

import { useState } from "react";
import { Icon } from "./dashboard-icons";
import { ChatPanel } from "./chat-panel";
import type { EnquiryMessage } from "../lib/enquiry-messages";

export function PortalConversation({
  enquiryId,
  service,
  refLabel,
  dateLabel,
  openingMessage,
  openingAt,
  messages,
  unread,
  action,
  defaultOpen,
}: {
  enquiryId: string;
  service: string;
  refLabel: string;
  dateLabel: string;
  openingMessage: string;
  openingAt: Date;
  messages: EnquiryMessage[];
  unread: boolean;
  action: (formData: FormData) => Promise<void>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`relative rounded-none border bg-white transition-colors duration-200 ${
        open ? "border-primary-400/60" : "border-line hover:border-primary-400/60"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-0.5 ${
          open || unread ? "bg-primary-400" : "bg-transparent"
        }`}
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              {unread && (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-primary-500"
                />
              )}
              <span
                className={`font-display text-sm text-ink ${
                  unread ? "font-bold" : "font-semibold"
                }`}
              >
                {service}
              </span>
              {unread && (
                <span className="rounded-none bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-600">
                  New reply
                </span>
              )}
            </span>
            <span className="flex items-center gap-3 text-xs text-muted">
              <span className="tabular-nums">{refLabel}</span>
              {dateLabel}
            </span>
          </div>
          {!open && (
            <p
              className={`mt-2 line-clamp-2 text-sm leading-6 ${
                unread ? "font-medium text-ink" : "text-ink-body"
              }`}
            >
              {openingMessage}
            </p>
          )}
        </div>
        <Icon
          name="chevronDown"
          className={`mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-5 pt-4">
          <ChatPanel
            viewer="client"
            openingMessage={openingMessage}
            openingAt={openingAt}
            messages={messages}
            enquiryId={enquiryId}
            action={action}
            placeholder="Reply to the team…"
            submitLabel="Send"
          />
        </div>
      )}
    </div>
  );
}
