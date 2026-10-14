import type { Metadata } from "next";
import { requireClient } from "../lib/auth/guards";
import { DashboardShell } from "../components/dashboard-ui";
import type { DashNavItem } from "../components/dashboard-nav";
import { getT } from "../lib/messages";
import { portalMessages } from "../lib/messages/portal";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(portalMessages)).meta;
}

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireClient();
  const t = (await getT(portalMessages)).shell;
  const navItems: DashNavItem[] = [
    { href: "/portal", label: t.nav.dashboard, icon: "home" },
    { href: "/portal/settings", label: t.nav.settings, icon: "settings" },
  ];

  return (
    <DashboardShell
      title={t.title}
      areaLabel={t.title}
      badge="client"
      navItems={navItems}
      user={{ email: user.email, name: user.name }}
      labels={t}
    >
      {children}
    </DashboardShell>
  );
}
