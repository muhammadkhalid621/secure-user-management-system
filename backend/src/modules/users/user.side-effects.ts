import { CACHE_KEYS, CACHE_PATTERNS } from "../../constants/cache.js";
import { cacheService } from "../../lib/cache.service.js";
import { auditLogService } from "../audit-logs/audit-log.service.js";
import { notificationService } from "../notifications/notification.service.js";
import type { SafeUser } from "./user.types.js";

export class UserSideEffectsService {
  async invalidate(userId: string) {
    await Promise.all([
      cacheService.del(CACHE_KEYS.users.detail(userId)),
      cacheService.del(CACHE_KEYS.auth.profile(userId)),
      cacheService.deleteByPattern(CACHE_PATTERNS.users)
    ]);
  }

  async onMutation(input: {
    action: "create" | "update" | "delete";
    actorUserId?: string | null;
    user: SafeUser;
  }) {
    await this.invalidate(input.user.id);

    await Promise.all([
      auditLogService.recordCrud({
        actorUserId: input.actorUserId ?? null,
        entityType: "user",
        entityId: input.user.id,
        action: input.action,
        message: `User ${input.action}d successfully`,
        metadata: {
          email: input.user.email,
          roles: input.user.roles.map((role) => role.slug),
          permissions: input.user.permissions
        }
      }),
      notificationService.enqueue({
        event: `user.${input.action}`,
        message: `User ${input.action}d`,
        entityType: "user",
        entityId: input.user.id,
        actorUserId: input.actorUserId ?? null,
        payload: {
          user: input.user
        }
      })
    ]);
  }
}

export const userSideEffectsService = new UserSideEffectsService();
