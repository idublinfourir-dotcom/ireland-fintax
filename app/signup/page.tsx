import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { SignupForm } from "./signup-form";
import { isGoogleEnabled } from "../lib/auth/config";
import { getT } from "../lib/messages";
import { accountMessages } from "../lib/messages/account";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(accountMessages)).signup.meta;
}

export default async function SignupPage() {
  const t = await getT(accountMessages);
  return (
    <>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.signup.title}
        lede={t.signup.lede}
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
