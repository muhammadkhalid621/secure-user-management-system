import { randomUUID } from "node:crypto";
import { Op, type Transaction } from "sequelize";
import { AuditLogModel } from "../../database/models/audit-log.model.js";
import type { ListQuery } from "../../lib/list-query.js";
import type { AuditLog, CreateAuditLogInput } from "./audit-log.types.js";

class AuditLogRepository {
  async create(input: CreateAuditLogInput, transaction?: Transaction): Promise<AuditLog> {
    const record = await AuditLogModel.create({
      id: randomUUID(),
      actorUserId: input.actorUserId ?? null,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      action: input.action,
      level: input.level ?? "info",
      message: input.message,
      metadata: input.metadata ?? null
    }, { transaction });

    return record.toJSON() as AuditLog;
  }

  async findAll(
    listQuery?: ListQuery
  ): Promise<{ rows: AuditLog[]; count: number }> {
    const where = {
      ...(listQuery?.search
        ? {
            [Op.or]: [
              { message: { [Op.like]: `%${listQuery.search}%` } },
              { action: { [Op.like]: `%${listQuery.search}%` } },
              { entityType: { [Op.like]: `%${listQuery.search}%` } }
            ]
          }
        : {}),
      ...(listQuery?.filters.level
        ? { level: listQuery.filters.level }
        : {}),
      ...(listQuery?.filters.entityType
        ? { entityType: listQuery.filters.entityType }
        : {}),
      ...(listQuery?.filters.action
        ? { action: listQuery.filters.action }
        : {}),
      ...(listQuery?.filters.actorUserId
        ? { actorUserId: listQuery.filters.actorUserId }
        : {}),
      ...(listQuery?.filters.entityId
        ? { entityId: listQuery.filters.entityId }
        : {})
    };

    const { count, rows } = await AuditLogModel.findAndCountAll({
      where,
      limit: listQuery?.limit,
      offset: listQuery?.offset,
      order: [[listQuery?.sortBy ?? "createdAt", listQuery?.sortOrder ?? "desc"]]
    });

    return {
      rows: rows.map((record) => record.toJSON() as AuditLog),
      count
    };
  }
}

export const auditLogRepository = new AuditLogRepository();
