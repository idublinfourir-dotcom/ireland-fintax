"use client";

import { useState } from "react";
import { deleteUnusedPicturesAction } from "./actions";

/* The "unused pictures" sweep on /admin/posts. Shown only when there is
   something to delete; the first click arms the button, the second submits. */
export function UnusedPictures({
  count,
  bytes,
  graceDays,
}: {
  count: number;
  bytes: number;
  graceDays: number;
}) {
  const [armed, setArmed] = useState(false);
  const size = bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
  const button =
    "inline-flex h-9 cursor-pointer items-center rounded-none px-4 text-xs font-semibold transition-colors duration-200";

  return (
    <form
      action={deleteUnusedPicturesAction}
      className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-none border border-line bg-white px-5 py-4"
    >
      <p className="min-w-0 flex-1 text-sm text-ink">
        <span className="font-semibold">
          {count} unused picture{count === 1 ? "" : "s"}
        </span>{" "}
        ({size}): uploaded over {graceDays} days ago and not used in any post or draft.
      </p>
      {armed ? (
        <span className="flex items-center gap-2">
          <button type="submit" className={`${button} bg-red-700 text-white hover:bg-red-800`}>
            Delete {count} for good
          </button>
          <button
            type="button"
            onClick={() => setArmed(false)}
            className={`${button} border border-line bg-white text-ink hover:border-primary-300`}
          >
            Keep them
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className={`${button} border border-line bg-white text-ink hover:border-primary-300`}
        >
          Delete them
        </button>
      )}
    </form>
  );
}
