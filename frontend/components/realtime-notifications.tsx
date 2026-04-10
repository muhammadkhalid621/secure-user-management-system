"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, History, Trash2 } from "lucide-react";
import { io } from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearNotifications, pushNotification } from "@/store/notifications-slice";
import type { NotificationPayload } from "@/lib/types";

const socketUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8000";

export const RealtimeNotifications = () => {
  const dispatch = useAppDispatch();
  const socketToken = useAppSelector((state) => state.auth.socketToken);
  const notifications = useAppSelector((state) => state.notifications.items);
  const [view, setView] = useState<"live" | "history">("live");

  const liveNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);
  const historyNotifications = useMemo(() => notifications.slice(0, 12), [notifications]);

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
          <p className="mt-1 text-sm text-slate-500">Realtime events and retained notification history</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-2">
            <BellRing className="h-3.5 w-3.5" />
            Socket
          </Badge>
          <Badge variant="muted">{notifications.length} saved</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${view === "live" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
              onClick={() => setView("live")}
            >
              Live now
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${view === "history" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
              onClick={() => setView("history")}
            >
              History
            </button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearNotifications())}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
        {(view === "live" ? liveNotifications : historyNotifications).length === 0 ? (
          <p className="rounded-3xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No notifications received yet.
          </p>
        ) : (
          (view === "live" ? liveNotifications : historyNotifications).map((item: NotificationPayload) => (
            <div key={`${item.event}-${item.createdAt}`} className="rounded-3xl border border-slate-200/70 bg-white/85 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{item.message}</p>
                  <p className="text-xs text-slate-500">{item.entityType} · {item.entityId ?? "n/a"}</p>
                </div>
                <Badge variant="muted" className="gap-1">
                  {view === "history" ? <History className="h-3 w-3" /> : null}
                  {item.event}
                </Badge>
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
