"use client";

import { useState } from "react";

/** Copies a post's address, and says so for two seconds. The labels come
    from the server, in the page's language. */
export function CopyLinkButton({
  url,
  className,
  labels,
}: {
  url: string;
  className: string;
  labels: { copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (an insecure origin, or the browser said no): the
      // address bar still has it, so there is nothing useful to show.
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
    </button>
  );
}
