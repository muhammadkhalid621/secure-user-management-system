import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { buildPaginationMeta, type ListQuery } from "../../lib/list-query.js";
import { roleRepository } from "./role.repository.js";
import { roleSideEffectsService } from "./role.side-effects.js";
import type { Role } from "./role.types.js";

export class RoleService {
  async list(listQuery?: ListQuery): Promise<{ rows: Role[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const result = await roleRepository.findAll(listQuery);

    return {
      rows: result.rows,
      meta: buildPaginationMeta({
        page: listQuery?.page ?? 1,
        limit: listQuery?.limit ?? (result.count || 1),
        total: result.count
      })
    };
  }

  async ensureAllExist(ids: string[]) {
    await Promise.all(ids.map((id) => this.findByIdOrThrow(id)));
  }

  async findBySlugOrThrow(slug: string): Promise<Role> {
    const role = await roleRepository.findBySlug(slug);

    if (!role) {
      throw new AppError(
        ERROR_MESSAGES.ROLES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ROLE_NOT_FOUND
      );
    }

    return role;
  }

  async findByIdOrThrow(id: string): Promise<Role> {
    const role = await roleRepository.findById(id);

    if (!role) {
      throw new AppError(
        ERROR_MESSAGES.ROLES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ROLE_NOT_FOUND
      );
    }

    return role;
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
      role
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

    const role = await roleRepository.update(id, input);

    if (!role) {
      throw new AppError(
        ERROR_MESSAGES.ROLES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ROLE_NOT_FOUND
      );
    }

    await roleSideEffectsService.onMutation({
      action: "update",
      actorUserId: actorUserId ?? null,
      role
    });

    return role;
  }

  async delete(id: string, actorUserId?: string | null): Promise<Role> {
    const role = await roleRepository.delete(id);

    if (!role) {
      throw new AppError(
        ERROR_MESSAGES.ROLES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ROLE_NOT_FOUND
      );
    }

    await roleSideEffectsService.onMutation({
      action: "delete",
      actorUserId: actorUserId ?? null,
      role
    });

    return role;
  }
}

export const roleService = new RoleService();
