import type { Metadata } from "next";
import { requireAdmin } from "../../lib/auth/guards";
import { toObjectId, usersCollection } from "../../lib/collections";
import { PageHeader } from "../../components/dashboard-ui";
import { SettingsForm } from "../../portal/settings/settings-form";

/* The admin side of the same account settings the portal has.
 *
 * Deliberately the SAME form and the same two server actions rather than a
 * copy: both write only to the caller's own account, so there is nothing
 * role-specific to duplicate, and a second copy would be the one that drifts
 * out of step on the password rules. Only the surrounding chrome differs. */

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  const owner = toObjectId(user.id);
  const users = await usersCollection();
  const account = owner
    ? await users.findOne({ _id: owner }, { projection: { name: 1 } })
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        lede="Update your name and password."
      />
      <SettingsForm fullName={account?.name ?? ""} email={user.email} />
    </div>
  );
}
