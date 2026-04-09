import { CACHE_KEYS, CACHE_PATTERNS } from "../../constants/cache.js";
import { MESSAGE_BUILDERS } from "../../constants/messages.js";
import { cacheService } from "../../lib/cache.service.js";
import { EntitySideEffectsService } from "../entity-side-effects/entity-side-effects.service.js";
import type { SafeUser } from "./user.types.js";

const invalidateUserCaches = async (user: SafeUser) => {
  await Promise.all([
    cacheService.del(CACHE_KEYS.users.detail(user.id)),
    cacheService.del(CACHE_KEYS.auth.profile(user.id)),
    cacheService.deleteByPattern(CACHE_PATTERNS.users)
  ]);
};

export class UserSideEffectsService extends EntitySideEffectsService<SafeUser> {
  constructor() {
    super(
      "user",
      MESSAGE_BUILDERS.userMutation,
      (action) => MESSAGE_BUILDERS.notificationMutation("user", action),
      (user) => ({
        email: user.email,
        roles: user.roles.map((role) => role.slug),
        permissions: user.permissions
      }),
      invalidateUserCaches
    );
  }

  async invalidateByUserId(userId: string) {
    await Promise.all([
      cacheService.del(CACHE_KEYS.users.detail(userId)),
      cacheService.del(CACHE_KEYS.auth.profile(userId)),
      cacheService.deleteByPattern(CACHE_PATTERNS.users)
    ]);
  }
}

export const userSideEffectsService = new UserSideEffectsService();
