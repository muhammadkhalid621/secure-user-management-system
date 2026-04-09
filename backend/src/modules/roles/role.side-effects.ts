import { auditLogService } from "../audit-logs/audit-log.service.js";
import { notificationService } from "../notifications/notification.service.js";
import type { Role } from "./role.types.js";

export class RoleSideEffectsService {
  async onMutation(input: {
    action: "create" | "update" | "delete";
    actorUserId?: string | null;
    role: Role;
  }) {
    await Promise.all([
      auditLogService.recordCrud({
        actorUserId: input.actorUserId ?? null,
        entityType: "role",
        entityId: input.role.id,
        action: input.action,
        message: `Role ${input.action}d successfully`,
        metadata: {
          slug: input.role.slug,
          permissions: input.role.permissions.map((permission) => permission.slug)
        }
      }),
      notificationService.enqueue({
        event: `role.${input.action}`,
        message: `Role ${input.action}d`,
        entityType: "role",
        entityId: input.role.id,
        actorUserId: input.actorUserId ?? null,
        payload: {
          role: input.role
        }
      })
    ]);
  }
}

export const roleSideEffectsService = new RoleSideEffectsService();

