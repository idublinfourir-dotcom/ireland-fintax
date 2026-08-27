import type { Metadata } from "next";
import { requireClient } from "../lib/auth/guards";
import { DashboardShell } from "../components/dashboard-ui";
import type { DashNavItem } from "../components/dashboard-nav";

export const metadata: Metadata = {
  title: "Client portal",
  description: "Your AIBN Chartered Accountants Ltd client area.",
};

const navItems: DashNavItem[] = [
  { href: "/portal", label: "Dashboard", icon: "home" },
  { href: "/portal/settings", label: "Settings", icon: "settings" },
];

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireClient();

  return (
    <DashboardShell
      title="Client portal"
      areaLabel="Client portal"
      badge="client"
      navItems={navItems}
      user={{ email: user.email, name: user.name }}
    >
      {children}
    </DashboardShell>
  );
}
