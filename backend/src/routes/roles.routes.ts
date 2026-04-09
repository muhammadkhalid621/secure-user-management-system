import { Router } from "express";
import { config } from "../config.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { SUCCESS_MESSAGES } from "../constants/messages.js";
import { asyncHandler } from "../lib/async-handler.js";
import { created, ok } from "../lib/http-response.js";
import { okWithMeta } from "../lib/http-list-response.js";
import {
  validateIdParam,
  validateRoleCreateBody,
  validateRoleUpdateBody
} from "../lib/validators.js";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { paginationGuard, type ListQueryRequest } from "../middlewares/pagination.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { permissionService } from "../modules/permissions/permission.service.js";
import { roleService } from "../modules/roles/role.service.js";

export const rolesRouter = Router();

rolesRouter.post(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.ROLES_CREATE),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = validateRoleCreateBody(req.body);
    await permissionService.ensureAllExist(body.permissionIds);
    const role = await roleService.create({
      ...body,
      actorUserId: req.auth!.userId
    });

    created(res, {
      message: SUCCESS_MESSAGES.ROLES.CREATED,
      data: role
    });
  })
);

rolesRouter.get(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.ROLES_READ),
  paginationGuard({
    allowedSortBy: ["createdAt", "updatedAt", "name", "slug"],
    defaultSortBy: "createdAt"
  }),
  asyncHandler(async (req, res) => {
    const result = await roleService.list((req as ListQueryRequest).listQuery);
    okWithMeta(res, {
      data: result.rows,
      meta: result.meta
    });
  })
);

rolesRouter.get(
  "/permissions/catalog",
  requireAuth,
  requirePermission(PERMISSIONS.PERMISSIONS_READ),
  paginationGuard({
    allowedSortBy: ["createdAt", "updatedAt", "name", "slug"],
    defaultSortBy: "slug"
  }),
  asyncHandler(async (req, res) => {
    const result = await permissionService.list((req as ListQueryRequest).listQuery);
    okWithMeta(res, {
      data: result.rows,
      meta: result.meta
    });
  })
);

rolesRouter.put(
  "/:id",
  requireAuth,
  requirePermission(PERMISSIONS.ROLES_UPDATE),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = validateRoleUpdateBody(req.body);
    if (body.permissionIds) {
      await permissionService.ensureAllExist(body.permissionIds);
    }

    const role = await roleService.update(
      validateIdParam(req.params.id),
      body,
      req.auth!.userId
    );

    ok(res, {
      message: SUCCESS_MESSAGES.ROLES.UPDATED,
      data: role
    });
  })
);

rolesRouter.delete(
  "/:id",
  requireAuth,
  requirePermission(PERMISSIONS.ROLES_DELETE),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const role = await roleService.delete(
      validateIdParam(req.params.id),
      req.auth!.userId
    );

    ok(res, {
      message: SUCCESS_MESSAGES.ROLES.DELETED,
      data: role
    });
  })
);

rolesRouter.get(
  "/:id",
  requireAuth,
  requirePermission(PERMISSIONS.ROLES_READ),
  asyncHandler(async (req, res) => {
    const role = await roleService.findByIdOrThrow(validateIdParam(req.params.id));
    ok(res, {
      data: role
    });
  })
);
