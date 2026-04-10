"use client";

import { Activity, Shield, Users } from "lucide-react";
import { fetchJson } from "@/lib/api";
import type { ApiSuccessResponse, DashboardSummary } from "@/lib/types";
import { useAsyncData } from "@/lib/query-hooks";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";

const emptyStats: DashboardSummary = {
  userTotal: 0,
  roleTotal: 0,
  recentLogCount: 0,
  multiRoleUserCount: 0,
  permissionsMapped: 0,
  errorCount: 0,
  roleDistribution: [],
  recentLevels: []
};

export const DashboardPageClient = () => {
  const statsQuery = useAsyncData(
    async () =>
      (await fetchJson<ApiSuccessResponse<DashboardSummary>>("/api/dashboard/summary")).data,
    []
  );

  const stats = statsQuery.data ?? emptyStats;

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
            value={stats.userTotal}
            detail="Accounts currently loaded into the admin workspace."
            icon={Users}
            accent={`${stats.multiRoleUserCount} multi-role`}
          />
          <StatCard
            label="Roles"
            value={stats.roleTotal}
            detail="Dynamic access groups controlling endpoint-level permissions."
            icon={Shield}
            accent={`${stats.permissionsMapped} permissions mapped`}
          />
          <StatCard
            label="Recent Logs"
            value={stats.recentLogCount}
            detail="Latest operational events surfaced from the audit stream."
            icon={Activity}
            accent={`${stats.errorCount} errors`}
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
                  series={
                    stats.roleDistribution.length > 0
                      ? stats.roleDistribution
                      : [{ label: "No roles yet", value: 0 }]
                  }
                />
                <BarChartCard
                  title="Recent log severity"
                  description="Severity breakdown from the latest audit entries."
                  series={stats.recentLevels}
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
