"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth-slice";
import { notificationsReducer } from "./notifications-slice";

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export const createAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState | undefined
  });

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];
