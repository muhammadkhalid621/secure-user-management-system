export type NotificationJobData = {
  event: string;
  message: string;
  entityType: string;
  entityId?: string;
  actorUserId?: string | null;
  payload?: Record<string, unknown>;
};

export type AuthLogJobData = {
  action: string;
  message: string;
  actorUserId?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  level?: "info" | "warn" | "error";
};

