import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { SignupForm } from "./signup-form";
import { isGoogleEnabled } from "../lib/auth/config";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a free Ireland Fintax account.",
};

export default function SignupPage() {
  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Create your account."
        lede="Free, and takes under a minute. Keep the questions you ask and our answers in one place."
        image="tower"
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md rounded-none border border-line bg-surface p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <SignupForm googleEnabled={isGoogleEnabled()} />
        </div>
      </Container>
    </>
  );
}
