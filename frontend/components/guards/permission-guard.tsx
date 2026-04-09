"use client";

import { ShieldAlert } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { Card, CardContent } from "@/components/ui/card";

export const PermissionGuard = ({
  permission,
  children
}: {
  permission: string;
  children: React.ReactNode;
}) => {
  const isAllowed = usePermission(permission);

  if (!isAllowed) {
    return (
      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
          <ShieldAlert className="h-10 w-10 text-amber-600" />
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            Access restricted
          </h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">
            Your current role does not include the permission required to view this section.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
