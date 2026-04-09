"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";

export const ProfilePageClient = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="bg-slate-950 text-white">
        <CardContent className="p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Profile</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {user?.name}
          </h1>
          <p className="mt-2 text-sm text-white/70">{user?.email}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">Roles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(user?.roles ?? []).map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Permissions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(user?.permissions ?? []).map((permission) => (
                <Badge key={permission} variant="muted">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
