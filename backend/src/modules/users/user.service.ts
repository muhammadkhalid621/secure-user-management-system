import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { findOrThrow } from "../../lib/find-or-throw.js";
import { ROLES } from "../../constants/roles.js";
import { buildListResult } from "../../lib/list-result.js";
import type { ListQuery } from "../../lib/list-query.js";
import { withTransaction } from "../../lib/db-transaction.js";
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

  async list(listQuery?: ListQuery) {
    const result = await userRepository.findAll(listQuery);

    return buildListResult({
      rows: result.rows.map(sanitizeUser),
      count: result.count,
      listQuery
    });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    return findOrThrow({
      value: await userRepository.findById(id),
      message: ERROR_MESSAGES.USERS.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.USER_NOT_FOUND
    });
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

    return withTransaction(async (transaction, onCommit) => {
      const user = sanitizeUser(
        await userRepository.create({
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          roleIds: await this.resolveRoleIds(input.roleIds)
        }, transaction)
      );

      await userSideEffectsService.recordAudit({
        action: "create",
        actorUserId: input.actorUserId ?? null,
        entity: user
      }, transaction);

      onCommit(() =>
        userSideEffectsService.runAfterCommit({
          action: "create",
          actorUserId: input.actorUserId ?? null,
          entity: user
        })
      );

      return user;
    });
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

    return withTransaction(async (transaction, onCommit) => {
      const updated = findOrThrow({
        value: await userRepository.update(id, input, transaction),
        message: ERROR_MESSAGES.USERS.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
        code: ERROR_CODES.USER_NOT_FOUND
      });

      const safeUser = sanitizeUser(updated);

      await userSideEffectsService.recordAudit({
        action: "update",
        actorUserId: actorUserId ?? null,
        entity: safeUser
      }, transaction);

      onCommit(() =>
        userSideEffectsService.runAfterCommit({
          action: "update",
          actorUserId: actorUserId ?? null,
          entity: safeUser
        })
      );

      return safeUser;
    });
  }

  async delete(id: string, actorUserId?: string | null): Promise<SafeUser> {
    return withTransaction(async (transaction, onCommit) => {
      const deleted = findOrThrow({
        value: await userRepository.delete(id, transaction),
        message: ERROR_MESSAGES.USERS.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
        code: ERROR_CODES.USER_NOT_FOUND
      });

      const safeUser = sanitizeUser(deleted);

      await userSideEffectsService.recordAudit({
        action: "delete",
        actorUserId: actorUserId ?? null,
        entity: safeUser
      }, transaction);

      onCommit(() =>
        userSideEffectsService.runAfterCommit({
          action: "delete",
          actorUserId: actorUserId ?? null,
          entity: safeUser
        })
      );

      return safeUser;
    });
  }
}

export const userService = new UserService();
