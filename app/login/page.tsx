import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { LoginForm } from "./login-form";
import { isGoogleEnabled } from "../lib/auth/config";
import { getT } from "../lib/messages";
import { accountMessages } from "../lib/messages/account";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(accountMessages)).login.meta;
}

/* Notices are accountMessages.login.notices. `reset`: the forgot-password flow
   signs the user in itself, so that one is only the fallback for when that
   last step fails after the password has already changed. The new password is
   live either way. */

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;
  const t = await getT(accountMessages);

  return (
    <>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.login.title}
        lede={t.login.lede}
        image="tower"
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md rounded-none border border-line bg-surface p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <LoginForm
            next={next}
            notice={notice ? t.login.notices[notice] : undefined}
            googleEnabled={isGoogleEnabled()}
          />
        </div>
      </Container>
    </>
  );
}
