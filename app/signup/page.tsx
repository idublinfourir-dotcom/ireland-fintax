import type { Metadata } from "next";
import { Container, PageHero } from "../components/ui";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your AIBN Chartered Accountants Ltd client account.",
};

export default function SignupPage() {
  return (
    <>
      <PageHero
        eyebrow="Client area"
        title="Create your account."
        lede="Set up access to your AIBN Chartered Accountants Ltd client area in under a minute."
        image="tower"
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md rounded-none border border-line bg-surface p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <SignupForm />
        </div>
      </Container>
    </>
  );
}
