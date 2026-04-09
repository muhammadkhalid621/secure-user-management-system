"use client";

import { Activity, Shield, Users } from "lucide-react";
import { loadCollection } from "@/lib/client-crud";
import type { AuditLog, Role, SafeUser } from "@/lib/types";
import { useAsyncData } from "@/lib/query-hooks";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";

const emptyStats = {
  users: [] as SafeUser[],
  roles: [] as Role[],
  auditLogs: [] as AuditLog[]
};

export const DashboardPageClient = () => {
  const statsQuery = useAsyncData(
    async () => {
      const [users, roles, auditLogs] = await Promise.all([
        loadCollection<SafeUser>("/api/users", { limit: 100 }),
        loadCollection<Role>("/api/roles", { limit: 100 }),
        loadCollection<AuditLog>("/api/audit-logs", { limit: 5 })
      ]);

      return {
        users: users.rows,
        roles: roles.rows,
        auditLogs: auditLogs.rows
      };
    },
    []
  );

  const stats = statsQuery.data ?? emptyStats;
  const roleDistribution = stats.roles.map((role) => ({
    label: role.name,
    value: stats.users.filter((user) => user.roles.some((userRole) => userRole.id === role.id)).length,
    toneClassName: "bg-slate-900"
  }));
  const recentLevels = [
    {
      label: "Info",
      value: stats.auditLogs.filter((item) => item.level === "info").length,
      toneClassName: "bg-emerald-500"
    },
    {
      label: "Warn",
      value: stats.auditLogs.filter((item) => item.level === "warn").length,
      toneClassName: "bg-amber-500"
    },
    {
      label: "Error",
      value: stats.auditLogs.filter((item) => item.level === "error").length,
      toneClassName: "bg-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Command Center</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">
              Secure operations with a cleaner admin workflow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              This dashboard is connected to the protected API layer, role-aware UI,
              and realtime notifications pipeline.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-white/80">System posture</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">JWT access + refresh tokens</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">Redis-backed rate limiting and cache</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">Bull queue and WebSocket notifications</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {statsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Users"
            value={stats.users.length}
            detail="Accounts currently loaded into the admin workspace."
            icon={Users}
            accent={`${stats.users.filter((user) => user.roles.length > 1).length} multi-role`}
          />
          <StatCard
            label="Roles"
            value={stats.roles.length}
            detail="Dynamic access groups controlling endpoint-level permissions."
            icon={Shield}
            accent={`${stats.roles.reduce((sum, role) => sum + role.permissions.length, 0)} permissions mapped`}
          />
          <StatCard
            label="Recent Logs"
            value={stats.auditLogs.length}
            detail="Latest operational events surfaced from the audit stream."
            icon={Activity}
            accent={`${stats.auditLogs.filter((item) => item.level === "error").length} errors`}
          />
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {statsQuery.isLoading ? (
              <>
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </>
            ) : (
              <>
                <BarChartCard
                  title="Role distribution"
                  description="Users mapped to each role in the current dataset."
                  series={roleDistribution.length > 0 ? roleDistribution : [{ label: "No roles yet", value: 0 }]}
                />
                <BarChartCard
                  title="Recent log severity"
                  description="Severity breakdown from the latest audit entries."
                  series={recentLevels}
                />
              </>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-900">Access Control</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Permissions are enforced end-to-end, from UI visibility to backend authorization.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-900">User Lifecycle</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Manage account creation, profile edits, and removals from one place.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-900">Operational Trace</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Audit records and live events make auth and admin activity easy to follow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <RealtimeNotifications />
      </div>
    </div>
  );
};
