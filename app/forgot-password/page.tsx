import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { ForgotPasswordForm } from "./forgot-password-form";
import { getT } from "../lib/messages";
import { accountMessages } from "../lib/messages/account";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await getT(accountMessages)).forgot.meta,
    robots: { index: false, follow: false },
  };
}
/* robots: a utility page, not a destination: nothing links to it but the login form,
     there is nothing on it to find in a search, and a reset form in an index is
     only useful to someone phishing for one. Deliberately also left out of
     sitemap.ts for the same reason. */

export default async function ForgotPasswordPage() {
  const t = await getT(accountMessages);
  return (
    <>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.forgot.title}
        lede={t.forgot.lede}
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
