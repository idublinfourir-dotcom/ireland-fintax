import type { Metadata } from "next";
import { requireClient } from "../../lib/auth/guards";
import { toObjectId, usersCollection } from "../../lib/collections";
import { PageHeader } from "../../components/dashboard-ui";
import { SettingsForm } from "./settings-form";
import { getT } from "../../lib/messages";
import { accountMessages } from "../../lib/messages/account";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(accountMessages)).settings.meta;
}

export default async function SettingsPage() {
  const user = await requireClient();
  const t = await getT(accountMessages);

  const owner = toObjectId(user.id);
  const users = await usersCollection();
  const account = owner
    ? await users.findOne({ _id: owner }, { projection: { name: 1, passwordHash: 1 } })
    : null;
  const fullName = account?.name ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.settings.title}
        lede={t.settings.lede}
      />
      <SettingsForm
        fullName={fullName}
        email={user.email}
        hasPassword={Boolean(account?.passwordHash)}
        canDelete
      />
    </div>
  );
}
