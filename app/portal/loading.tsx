import { Spinner } from "../components/spinner";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-surface-muted"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-muted">
        <Spinner className="h-5 w-5 text-primary-500" />
        Loading your portal…
      </span>
    </div>
  );
}
