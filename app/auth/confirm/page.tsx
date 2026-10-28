import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, PageHero } from "../../components/ui";
import { confirmEmailAction } from "./actions";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
  // The address carries the token: leaving this page by any link must not
  // pass it on as a referrer (to analytics, or to another site).
  referrer: "no-referrer",
};

/* The signup email links here with a single-use `token`. Opening the link
   spends nothing: the token is redeemed only when the button posts it (see
   ./actions.ts), so a mail scanner that opens links in advance cannot use it
   up. English only, like the email that links here. */

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const { token, next } = await searchParams;
  if (!token) {
    console.error("[auth] confirm: opened with no token");
    redirect("/login?notice=confirm");
  }

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Confirm your email."
        lede="One click and your account is ready."
        image="tower"
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md rounded-none border border-line bg-surface p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <form action={confirmEmailAction} className="flex flex-col gap-4">
            <input type="hidden" name="token" value={token} />
            {next && <input type="hidden" name="next" value={next} />}
            <p className="text-sm text-ink">
              Confirm this address to finish setting up your account. You will be signed in
              straight away.
            </p>
            <button
              type="submit"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-none bg-primary-500 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              Confirm my email
            </button>
          </form>
        </div>
      </Container>
    </>
  );
}
