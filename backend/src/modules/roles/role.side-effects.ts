import { MESSAGE_BUILDERS } from "../../constants/messages.js";
import { EntitySideEffectsService } from "../entity-side-effects/entity-side-effects.service.js";
import type { Role } from "./role.types.js";

export class RoleSideEffectsService extends EntitySideEffectsService<Role> {
  constructor() {
    super(
      "role",
      MESSAGE_BUILDERS.roleMutation,
      (action) => MESSAGE_BUILDERS.notificationMutation("role", action),
      (role) => ({
        slug: role.slug,
        permissions: role.permissions.map((permission) => permission.slug)
      })
    );
  }
}

export const roleSideEffectsService = new RoleSideEffectsService();
