"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { SessionBootstrap } from "@/components/session-bootstrap";
import { ToastProvider } from "@/components/providers/toast-provider";
import { createAppStore, type AppStore } from "@/store";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createAppStore();
  }

  return (
    <Provider store={storeRef.current}>
      <SessionBootstrap />
      {children}
      <ToastProvider />
    </Provider>
  );
};
