import type { Metadata } from "next";
import { requireClient } from "../../lib/supabase/guards";
import { query } from "../../lib/db";
import { PageHeader } from "../../components/dashboard-ui";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireClient();

  const { rows } = await query<{ full_name: string | null }>(
    "select full_name from public.profiles where id = $1",
    [user.id],
  );
  const fullName = rows[0]?.full_name ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        lede="Update your name and password."
      />
      <SettingsForm fullName={fullName} email={user.email ?? ""} />
    </div>
  );
}
