import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import { asyncHandler } from "../lib/async-handler.js";
import { okWithMeta } from "../lib/http-list-response.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { paginationGuard, type ListQueryRequest } from "../middlewares/pagination.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { auditLogService } from "../modules/audit-logs/audit-log.service.js";

export const auditLogsRouter = Router();

auditLogsRouter.get(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.AUDIT_LOGS_READ),
  paginationGuard({
    allowedSortBy: ["createdAt", "updatedAt", "level", "action", "entityType"],
    defaultSortBy: "createdAt",
    allowedFilters: ["level", "entityType", "action", "actorUserId", "entityId"]
  }),
  asyncHandler(async (req, res) => {
    const result = await auditLogService.list((req as ListQueryRequest).listQuery);

    okWithMeta(res, {
      data: result.rows,
      meta: result.meta
    });
  })
);
