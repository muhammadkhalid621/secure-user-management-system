"use client";

import { useAppSelector } from "@/store/hooks";

export const usePermission = (permission: string) => {
  const permissions = useAppSelector((state) => state.auth.user?.permissions ?? []);
  return permissions.includes(permission);
};

export const usePermissions = () =>
  useAppSelector((state) => state.auth.user?.permissions ?? []);
