"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle2,
  Users
} from "lucide-react";
import { APP_ROUTES, PERMISSIONS } from "@/lib/constants";
import type { RoleSummary } from "@/lib/types";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
};

const navItems: NavItem[] = [
  { href: APP_ROUTES.DASHBOARD, label: "Overview", icon: LayoutDashboard },
  { href: APP_ROUTES.USERS, label: "Users", icon: Users, permission: PERMISSIONS.USERS_READ },
  { href: APP_ROUTES.ROLES, label: "Roles", icon: Shield, permission: PERMISSIONS.ROLES_READ },
  { href: APP_ROUTES.AUDIT_LOGS, label: "Audit Logs", icon: Activity, permission: PERMISSIONS.AUDIT_LOGS_READ },
  { href: APP_ROUTES.PROFILE, label: "Profile", icon: UserCircle2 }
];

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.permissions ?? [];

  const visibleItems = navItems.filter((item) =>
    !item.permission || permissions.includes(item.permission)
  );

  return (
    <div className="container py-6">
      <div className="dashboard-grid">
        <aside className="glass-panel h-fit p-5">
          <div className="rounded-[24px] bg-slate-950 px-5 py-6 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Signed in as</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">
              {user?.name ?? "Loading"}
            </h2>
            <p className="mt-2 text-sm text-white/70">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user?.roles ?? []).map((role: RoleSummary) => (
                <Badge key={role.id} className="bg-white/15 text-white">
                  {role.slug}
                </Badge>
              ))}
            </div>
          </div>
          <nav className="mt-6 space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    pathname === item.href
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            className="mt-6 w-full justify-start"
            onClick={async () => {
              const result = await dispatch(logout());

              if (result.meta.requestStatus === "fulfilled") {
                appToast.success("Logged out successfully.");
                router.replace(APP_ROUTES.LOGIN);
                return;
              }

              appToast.error("Logout failed.");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
};
