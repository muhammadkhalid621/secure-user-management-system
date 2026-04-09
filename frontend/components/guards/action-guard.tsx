"use client";

import { usePermission } from "@/hooks/use-permission";

export const ActionGuard = ({
  permission,
  children
}: {
  permission: string;
  children: React.ReactNode;
}) => {
  const isAllowed = usePermission(permission);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};
