"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationPayload } from "@/lib/types";

type NotificationsState = {
  items: NotificationPayload[];
};

const initialState: NotificationsState = {
  items: []
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification(state, action: PayloadAction<NotificationPayload>) {
      state.items = [action.payload, ...state.items].slice(0, 50);
    },
    clearNotifications(state) {
      state.items = [];
    }
  }
});

export const { pushNotification, clearNotifications } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
