import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Set a new password for your Ireland Fintax client account.",
  /* A utility page, not a destination: nothing links to it but the login form,
     there is nothing on it to find in a search, and a reset form in an index is
     only useful to someone phishing for one. Deliberately also left out of
     sitemap.ts for the same reason. */
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        eyebrow="Client area"
        title="Reset your password."
        lede="Enter the email address on your account and we'll send you a code to set a new password."
        image="tower"
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md rounded-none border border-line bg-surface p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <ForgotPasswordForm />
        </div>
      </Container>
    </>
  );
}
