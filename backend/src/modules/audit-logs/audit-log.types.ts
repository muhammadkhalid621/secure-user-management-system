export type AuditLog = {
  id: string;
  actorUserId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAuditLogInput = {
  actorUserId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  level?: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown> | null;
};

