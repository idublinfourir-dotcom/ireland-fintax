"use client";

import { useState } from "react";

const base =
  "w-full rounded-none border border-line bg-canvas px-4 py-3 pr-11 text-[15px] text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500";

/** Password field with a show/hide eye toggle. */
export function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder = "••••••••",
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        className={base}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-none text-muted transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500"
      >
        {show ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M1.5 10S4.7 4.5 10 4.5 18.5 10 18.5 10 15.3 15.5 10 15.5 1.5 10 1.5 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M8.2 4.7A7.3 7.3 0 0 1 10 4.5c5.3 0 8.5 5.5 8.5 5.5a13.4 13.4 0 0 1-2.4 3M4.7 5.9A12.9 12.9 0 0 0 1.5 10S4.7 15.5 10 15.5c1 0 1.9-.2 2.8-.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
