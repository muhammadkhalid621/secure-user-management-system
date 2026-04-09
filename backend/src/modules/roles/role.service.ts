import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { findOrThrow } from "../../lib/find-or-throw.js";
import { buildListResult } from "../../lib/list-result.js";
import type { ListQuery } from "../../lib/list-query.js";
import { roleRepository } from "./role.repository.js";
import { roleSideEffectsService } from "./role.side-effects.js";
import type { Role } from "./role.types.js";

export class RoleService {
  async list(listQuery?: ListQuery) {
    const result = await roleRepository.findAll(listQuery);

    return buildListResult({
      rows: result.rows,
      count: result.count,
      listQuery
    });
  }

  async ensureAllExist(ids: string[]) {
    await Promise.all(ids.map((id) => this.findByIdOrThrow(id)));
  }

  async findBySlugOrThrow(slug: string): Promise<Role> {
    return findOrThrow({
      value: await roleRepository.findBySlug(slug),
      message: ERROR_MESSAGES.ROLES.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.ROLE_NOT_FOUND
    });
  }

  async findByIdOrThrow(id: string): Promise<Role> {
    return findOrThrow({
      value: await roleRepository.findById(id),
      message: ERROR_MESSAGES.ROLES.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.ROLE_NOT_FOUND
    });
  }

  async create(input: {
    name: string;
    slug: string;
    description?: string;
    permissionIds: string[];
    actorUserId?: string | null;
  }): Promise<Role> {
    const existing = await roleRepository.findBySlug(input.slug);

    if (existing) {
      throw new AppError(
        ERROR_MESSAGES.ROLES.SLUG_EXISTS,
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.ROLE_ALREADY_EXISTS
      );
    }

    const role = await roleRepository.create(input);

    await roleSideEffectsService.onMutation({
      action: "create",
      actorUserId: input.actorUserId ?? null,
      entity: role
    });

    return role;
  }

  async update(
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      permissionIds?: string[];
    },
    actorUserId?: string | null
  ): Promise<Role> {
    if (input.slug) {
      const existing = await roleRepository.findBySlug(input.slug);

      if (existing && existing.id !== id) {
        throw new AppError(
          ERROR_MESSAGES.ROLES.SLUG_EXISTS,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.ROLE_ALREADY_EXISTS
        );
      }
    }

    const role = findOrThrow({
      value: await roleRepository.update(id, input),
      message: ERROR_MESSAGES.ROLES.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.ROLE_NOT_FOUND
    });

    await roleSideEffectsService.onMutation({
      action: "update",
      actorUserId: actorUserId ?? null,
      entity: role
    });

    return role;
  }

  async delete(id: string, actorUserId?: string | null): Promise<Role> {
    const role = findOrThrow({
      value: await roleRepository.delete(id),
      message: ERROR_MESSAGES.ROLES.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.ROLE_NOT_FOUND
    });

    await roleSideEffectsService.onMutation({
      action: "delete",
      actorUserId: actorUserId ?? null,
      entity: role
    });

    return role;
  }
}

export const roleService = new RoleService();
