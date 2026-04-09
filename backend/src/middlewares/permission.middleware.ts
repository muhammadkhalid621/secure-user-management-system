import type { NextFunction, Response } from "express";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

const hasAnyPermission = (
  permissions: string[],
  required: string[]
): boolean => required.some((permission) => permissions.includes(permission));

export const requirePermission =
  (...permissions: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(
        new AppError(
          ERROR_MESSAGES.COMMON.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        )
      );
    }

    if (!hasAnyPermission(req.auth.permissions, permissions)) {
      return next(
        new AppError(
          ERROR_MESSAGES.COMMON.FORBIDDEN,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        )
      );
    }

    return next();
  };

export const requireSelfOrPermission =
  (
    paramKey: string,
    ownPermission: string,
    ...permissions: string[]
  ) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(
        new AppError(
          ERROR_MESSAGES.COMMON.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        )
      );
    }

    const isSelf = req.auth.userId === req.params[paramKey];

    if (isSelf && req.auth.permissions.includes(ownPermission)) {
      return next();
    }

    if (hasAnyPermission(req.auth.permissions, permissions)) {
      return next();
    }

    return next(
      new AppError(
        ERROR_MESSAGES.COMMON.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      )
    );
  };
