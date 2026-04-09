"use client";

import { useEffect } from "react";
import { BellRing } from "lucide-react";
import { io } from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pushNotification } from "@/store/notifications-slice";
import type { NotificationPayload } from "@/lib/types";

const socketUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

export const RealtimeNotifications = () => {
  const dispatch = useAppDispatch();
  const socketToken = useAppSelector((state) => state.auth.socketToken);
  const notifications = useAppSelector((state) => state.notifications.items.slice(0, 5));

  useEffect(() => {
    if (!socketToken) {
      return;
    }

    const socket = io(socketUrl, {
      transports: ["websocket"],
      auth: {
        token: socketToken
      }
    });

    socket.on("notification", (payload: NotificationPayload) => {
      dispatch(pushNotification(payload));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, socketToken]);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Live Activity</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Latest realtime backend events</p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <BellRing className="h-3.5 w-3.5" />
          Socket
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="rounded-3xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No notifications received yet.
          </p>
        ) : (
          notifications.map((item) => (
            <div key={`${item.event}-${item.createdAt}`} className="rounded-3xl border border-slate-200/70 bg-white/85 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{item.message}</p>
                <Badge variant="muted">{item.event}</Badge>
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
