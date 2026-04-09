import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { ROLES } from "../../constants/roles.js";
import { buildPaginationMeta, type ListQuery } from "../../lib/list-query.js";
import { hashPassword } from "../../lib/password.js";
import { roleService } from "../roles/role.service.js";
import { userRepository } from "./user.repository.js";
import { userSideEffectsService } from "./user.side-effects.js";
import type { SafeUser, User } from "./user.types.js";

const sanitizeUser = (user: User): SafeUser => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export class UserService {
  private async resolveRoleIds(roleIds?: string[]): Promise<string[]> {
    if (roleIds && roleIds.length > 0) {
      return roleIds;
    }

    const defaultRole = await roleService.findBySlugOrThrow(ROLES.USER);
    return [defaultRole.id];
  }

  async list(listQuery?: ListQuery): Promise<{ rows: SafeUser[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const result = await userRepository.findAll(listQuery);

    return {
      rows: result.rows.map(sanitizeUser),
      meta: buildPaginationMeta({
        page: listQuery?.page ?? 1,
        limit: listQuery?.limit ?? (result.count || 1),
        total: result.count
      })
    };
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError(
        ERROR_MESSAGES.USERS.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    return user;
  }

  async findSafeByIdOrThrow(id: string): Promise<SafeUser> {
    return sanitizeUser(await this.findByIdOrThrow(id));
  }

  findByEmail(email: string): Promise<User | undefined> {
    return userRepository.findByEmail(email);
  }

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    roleIds?: string[];
    actorUserId?: string | null;
  }): Promise<SafeUser> {
    if (await this.findByEmail(input.email)) {
      throw new AppError(
        ERROR_MESSAGES.USERS.EMAIL_EXISTS,
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.EMAIL_ALREADY_EXISTS
      );
    }

    const user = sanitizeUser(
      await userRepository.create({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        roleIds: await this.resolveRoleIds(input.roleIds)
      })
    );

    await userSideEffectsService.onMutation({
      action: "create",
      actorUserId: input.actorUserId ?? null,
      user
    });

    return user;
  }

  async createFromInput(input: {
    name: string;
    email: string;
    password: string;
    roleIds?: string[];
    actorUserId?: string | null;
  }): Promise<SafeUser> {
    return this.create({
      name: input.name,
      email: input.email,
      passwordHash: hashPassword(input.password),
      roleIds: input.roleIds,
      actorUserId: input.actorUserId
    });
  }

  async update(
    id: string,
    input: {
      name?: string;
      email?: string;
      roleIds?: string[];
    },
    actorUserId?: string | null
  ): Promise<SafeUser> {
    if (input.email) {
      const existing = await this.findByEmail(input.email);

      if (existing && existing.id !== id) {
        throw new AppError(
          ERROR_MESSAGES.USERS.EMAIL_EXISTS,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.EMAIL_ALREADY_EXISTS
        );
      }
    }

    const updated = await userRepository.update(id, input);

    if (!updated) {
      throw new AppError(
        ERROR_MESSAGES.USERS.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    const safeUser = sanitizeUser(updated);

    await userSideEffectsService.onMutation({
      action: "update",
      actorUserId: actorUserId ?? null,
      user: safeUser
    });

    return safeUser;
  }

  async delete(id: string, actorUserId?: string | null): Promise<SafeUser> {
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      throw new AppError(
        ERROR_MESSAGES.USERS.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    const safeUser = sanitizeUser(deleted);

    await userSideEffectsService.onMutation({
      action: "delete",
      actorUserId: actorUserId ?? null,
      user: safeUser
    });

    return safeUser;
  }
}

export const userService = new UserService();
