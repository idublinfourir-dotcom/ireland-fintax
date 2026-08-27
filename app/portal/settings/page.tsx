import type { Metadata } from "next";
import { requireClient } from "../../lib/auth/guards";
import { toObjectId, usersCollection } from "../../lib/collections";
import { PageHeader } from "../../components/dashboard-ui";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireClient();

  const owner = toObjectId(user.id);
  const users = await usersCollection();
  const account = owner
    ? await users.findOne({ _id: owner }, { projection: { name: 1 } })
    : null;
  const fullName = account?.name ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        lede="Update your name and password."
      />
      <SettingsForm fullName={fullName} email={user.email} />
    </div>
  );
}
