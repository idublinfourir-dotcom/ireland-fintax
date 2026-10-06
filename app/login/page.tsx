import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { LoginForm } from "./login-form";
import { isGoogleEnabled } from "../lib/auth/config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your free Ireland Fintax account.",
};

const NOTICES: Record<string, string> = {
  confirm: "We couldn't confirm that link. Try signing in, or request a new one.",
  confirmed: "Email confirmed. You can sign in now.",
  oauth: "Couldn't complete Google sign-in. Please try again.",
  /* The forgot-password flow signs the user in itself, so this is only the
     fallback for when that last step fails after the password has already
     changed. The new password is live either way. */
  reset: "Password updated. You can sign in now.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Sign in."
        lede="See the questions you have asked and our answers, all in one place."
        image="tower"
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md rounded-none border border-line bg-surface p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <LoginForm
            next={next}
            notice={notice ? NOTICES[notice] : undefined}
            googleEnabled={isGoogleEnabled()}
          />
        </div>
      </Container>
    </>
  );
}
