import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { LoginForm } from "./login-form";
import { isGoogleEnabled } from "../lib/auth/config";

export const metadata: Metadata = {
  title: "Client login",
  description: "Sign in to the Ireland Fintax client area.",
};

const NOTICES: Record<string, string> = {
  confirm: "We couldn't confirm that link. Try signing in, or request a new one.",
  confirmed: "Email confirmed. You can sign in now.",
  oauth: "Couldn't complete Google sign-in. Please try again.",
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
        eyebrow="Client area"
        title="Sign in."
        lede="Access your Ireland Fintax client area. A partner-led practice: your books, in one place."
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
