"use client";

import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth-slice";
import { notificationsReducer } from "./notifications-slice";

export const createAppStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationsReducer
    }
  });

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
