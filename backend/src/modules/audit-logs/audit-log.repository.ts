import { randomUUID } from "node:crypto";
import { AuditLogModel } from "../../database/models/audit-log.model.js";
import type { AuditLog, CreateAuditLogInput } from "./audit-log.types.js";

class AuditLogRepository {
  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const record = await AuditLogModel.create({
      id: randomUUID(),
      actorUserId: input.actorUserId ?? null,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      action: input.action,
      level: input.level ?? "info",
      message: input.message,
      metadata: input.metadata ?? null
    });

    return record.toJSON() as AuditLog;
  }
}

export const auditLogRepository = new AuditLogRepository();

