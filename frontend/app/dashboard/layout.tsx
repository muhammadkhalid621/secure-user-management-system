import { DashboardShell } from "@/components/dashboard-shell";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
