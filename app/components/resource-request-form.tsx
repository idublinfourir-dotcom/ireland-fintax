"use client";

/* The Founders Hub "Request a copy" form.

   Collects who is asking and why, then records the request. Nothing is emailed
   automatically: on success we show a confirmation dialog telling the visitor a
   team member will send the file, which is what actually happens. */

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { submitResourceRequestAction, type RequestState } from "../toolkits/actions";

const IDLE: RequestState = { status: "idle" };

const inputClass =
  "h-11 w-full rounded-none border border-line bg-white px-3 text-sm text-ink outline-none transition-colors duration-200 focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-400/40 disabled:opacity-60";

function Field({
  label,
  name,
  error,
  children,
  hint,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-secondary-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none bg-primary-500 px-7 text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Submitting…
        </>
      ) : (
        "Submit request"
      )}
    </button>
  );
}

/* Confirmation shown once the request is recorded. Wording matches what the
   team actually does next: a person emails the file over. */
function ThankYouDialog() {
  const closeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    // The page behind is no longer actionable, so stop it scrolling.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-thanks-title"
      className="fixed inset-0 z-50 grid place-items-center bg-navy-900/60 px-5 py-10"
    >
      <div className="w-full max-w-md rounded-none border border-line bg-white p-8 text-center shadow-2xl shadow-navy-900/25">
        <span
          aria-hidden="true"
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-2xl text-primary-600"
        >
          ✓
        </span>
        <h2
          id="request-thanks-title"
          className="mt-4 font-display text-xl font-semibold tracking-tight text-ink"
        >
          Thank you for submitting the form
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          We will send you the file shortly via your email.
        </p>
        <Link
          ref={closeRef}
          href="/toolkits"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-none bg-primary-500 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Back to Founders Hub
        </Link>
      </div>
    </div>
  );
}

export function ResourceRequestForm({ slug }: { slug: string }) {
  const [state, action] = useActionState(submitResourceRequestAction, IDLE);
  const errors = state.errors ?? {};

  if (state.status === "sent") return <ThankYouDialog />;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={slug} />

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-none border border-secondary-400/40 bg-secondary-50 px-4 py-3 text-sm text-secondary-600"
        >
          {state.message}
        </p>
      )}

      <Field label="Your name" name="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={120}
          className={inputClass}
        />
      </Field>

      <Field label="Phone number" name="phone" error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          maxLength={40}
          placeholder="+353 …"
          className={inputClass}
        />
      </Field>

      <Field
        label="Organisation email address"
        name="email"
        error={errors.email}
        hint="We send the file to this address, so please use one you can access."
      >
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="you@company.ie"
          className={inputClass}
        />
      </Field>

      <Field
        label="Organisation website"
        name="website"
        error={errors.website}
        hint="The site for your company or practice. Typing acme.ie is fine."
      >
        <input
          id="website"
          name="website"
          type="text"
          required
          inputMode="url"
          autoComplete="url"
          maxLength={200}
          placeholder="acme.ie"
          className={inputClass}
        />
      </Field>

      <Field
        label="What do you need it for?"
        name="purpose"
        error={errors.purpose}
        hint="A sentence is plenty. It helps us send the most useful version."
      >
        <textarea
          id="purpose"
          name="purpose"
          required
          rows={4}
          maxLength={1000}
          className={`${inputClass} h-auto resize-none py-2.5 leading-6`}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton />
        <Link
          href="/toolkits"
          className="text-sm font-semibold text-muted transition-colors duration-200 hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
