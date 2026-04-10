import type { Transaction } from "sequelize";
import { auditLogRepository } from "./audit-log.repository.js";
import { buildListResult } from "../../lib/list-result.js";
import type { ListQuery } from "../../lib/list-query.js";
import type { CreateAuditLogInput } from "./audit-log.types.js";

export class AuditLogService {
  record(input: CreateAuditLogInput, transaction?: Transaction) {
    return auditLogRepository.create(input, transaction);
  }

  async list(listQuery?: ListQuery) {
    const result = await auditLogRepository.findAll(listQuery);

    return buildListResult({
      rows: result.rows,
      count: result.count,
      listQuery
    });
  }

  recordCrud(input: {
    actorUserId?: string | null;
    entityType: string;
    entityId: string;
    action: "create" | "update" | "delete";
    message: string;
    metadata?: Record<string, unknown>;
  }, transaction?: Transaction) {
    return this.record({
      actorUserId: input.actorUserId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: `${input.entityType}.${input.action}`,
      message: input.message,
      metadata: input.metadata ?? null
    }, transaction);
  }
}

export const auditLogService = new AuditLogService();
