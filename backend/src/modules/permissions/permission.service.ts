import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { buildPaginationMeta, type ListQuery } from "../../lib/list-query.js";
import { permissionRepository } from "./permission.repository.js";

export class PermissionService {
  async list(listQuery?: ListQuery) {
    const result = await permissionRepository.findAll(listQuery);

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
    if (ids.length === 0) {
      return;
    }

    const count = await permissionRepository.countByIds(ids);

    if (count !== ids.length) {
      throw new AppError(
        ERROR_MESSAGES.PERMISSIONS.INVALID_SELECTION,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }
}

export const permissionService = new PermissionService();
