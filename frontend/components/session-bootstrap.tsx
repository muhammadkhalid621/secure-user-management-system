"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { APP_ROUTES, PROTECTED_ROUTES, PUBLIC_ONLY_ROUTES } from "@/lib/constants";
import { bootstrapSession } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const SessionBootstrap = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!auth.initialized && auth.status === "idle") {
      void dispatch(bootstrapSession());
    }
  }, [auth.initialized, auth.status, dispatch]);

  useEffect(() => {
    if (!auth.initialized) {
      return;
    }

    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isPublicOnly = PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtected && auth.status === "unauthenticated") {
      router.replace(APP_ROUTES.LOGIN);
    }

    if (isPublicOnly && auth.status === "authenticated") {
      router.replace(APP_ROUTES.DASHBOARD);
    }
  }, [auth.initialized, auth.status, pathname, router]);

  return null;
};
