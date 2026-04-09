import { auditLogRepository } from "./audit-log.repository.js";
import type { CreateAuditLogInput } from "./audit-log.types.js";

export class AuditLogService {
  record(input: CreateAuditLogInput) {
    return auditLogRepository.create(input);
  }

  recordCrud(input: {
    actorUserId?: string | null;
    entityType: string;
    entityId: string;
    action: "create" | "update" | "delete";
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.record({
      actorUserId: input.actorUserId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: `${input.entityType}.${input.action}`,
      message: input.message,
      metadata: input.metadata ?? null
    });
  }
}

export const auditLogService = new AuditLogService();

