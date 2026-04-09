import { CACHE_KEYS } from "../constants/cache.js";
import { config } from "../config.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.js";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../errors/app-error.js";
import { created, ok } from "../lib/http-response.js";
import { okWithMeta } from "../lib/http-list-response.js";
import {
  validateIdParam,
  validateUserCreateBody,
  validateUserUpdateBody
} from "../lib/validators.js";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import { paginationGuard, type ListQueryRequest } from "../middlewares/pagination.middleware.js";
import { requirePermission, requireSelfOrPermission } from "../middlewares/permission.middleware.js";
import { roleService } from "../modules/roles/role.service.js";
import { userService } from "../modules/users/user.service.js";
import { Router } from "express";

export const usersRouter = Router();

usersRouter.post(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_CREATE),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = validateUserCreateBody(req.body);
    if (body.roleIds) {
      await roleService.ensureAllExist(body.roleIds);
    }
    const user = await userService.createFromInput({
      ...body,
      actorUserId: req.auth!.userId
    });

    created(res, {
      message: SUCCESS_MESSAGES.USERS.CREATED,
      data: user
    });
  })
);

usersRouter.get(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_READ),
  paginationGuard({
    allowedSortBy: ["createdAt", "updatedAt", "name", "email"],
    defaultSortBy: "createdAt",
    allowedFilters: ["role"]
  }),
  cacheMiddleware({
    ttlSeconds: config.cache.usersTtlSeconds,
    key: async (req) =>
      `${CACHE_KEYS.users.list()}:${JSON.stringify((req as ListQueryRequest).listQuery)}`
  }),
  asyncHandler(async (req, res) => {
    const result = await userService.list((req as ListQueryRequest).listQuery);

    okWithMeta(res, {
      data: result.rows,
      meta: result.meta
    });
  })
);

usersRouter.get(
  "/:id",
  requireAuth,
  requireSelfOrPermission(
    "id",
    PERMISSIONS.USERS_READ_OWN,
    PERMISSIONS.USERS_READ
  ),
  cacheMiddleware({
    ttlSeconds: config.cache.usersTtlSeconds,
    key: async (req) => CACHE_KEYS.users.detail(validateIdParam(req.params.id))
  }),
  asyncHandler(async (req, res) => {
    const userId = validateIdParam(req.params.id);
    const user = await userService.findSafeByIdOrThrow(userId);

    ok(res, {
      data: user
    });
  })
);

usersRouter.put(
  "/:id",
  requireAuth,
  requireSelfOrPermission(
    "id",
    PERMISSIONS.USERS_UPDATE_OWN,
    PERMISSIONS.USERS_UPDATE
  ),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = validateIdParam(req.params.id);
    const body = validateUserUpdateBody(req.body);
    const canManageAnyUser = req.auth!.permissions.includes(PERMISSIONS.USERS_UPDATE);

    if (body.roleIds && !canManageAnyUser) {
      throw new AppError(
        ERROR_MESSAGES.USERS.ROLE_ASSIGNMENT_FORBIDDEN,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    if (body.roleIds) {
      await roleService.ensureAllExist(body.roleIds);
    }

    const updateInput = {
      name: body.name,
      email: body.email,
      roleIds: body.roleIds
    };

    const user = await userService.update(userId, updateInput, req.auth!.userId);

    ok(res, {
      message: SUCCESS_MESSAGES.USERS.UPDATED,
      data: user
    });
  })
);

usersRouter.delete(
  "/:id",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_DELETE),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = validateIdParam(req.params.id);
    const user = await userService.delete(userId, req.auth!.userId);

    ok(res, {
      message: SUCCESS_MESSAGES.USERS.DELETED,
      data: user
    });
  })
);
