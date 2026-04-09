import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { APP_ROUTES } from "@/lib/constants";
import { getServerSession } from "@/lib/server-api";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(APP_ROUTES.LOGIN);
  }

  return <DashboardShell>{children}</DashboardShell>;
}
