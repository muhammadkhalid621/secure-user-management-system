import type { NextFunction, Request, Response } from "express";
import { AUDIT_ACTIONS } from "../constants/audit.js";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS, RESPONSE_FLAG } from "../constants/http.js";
import { ERROR_MESSAGES, MESSAGE_BUILDERS } from "../constants/messages.js";
import { AppError } from "../errors/app-error.js";
import { auditLogService } from "../modules/audit-logs/audit-log.service.js";

const logApiError = (req: Request, error: AppError) => {
  const authenticatedRequest = req as Request & {
    auth?: {
      userId?: string;
    };
  };

  void auditLogService
    .record({
      actorUserId: authenticatedRequest.auth?.userId ?? null,
      entityType: "api",
      entityId: null,
      action: AUDIT_ACTIONS.API_ERROR,
      level: error.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR ? "error" : "warn",
      message: MESSAGE_BUILDERS.apiError(req.method, req.originalUrl || req.url),
      metadata: {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: error.statusCode,
        code: error.code,
        errorMessage: error.message,
        details: error.details ?? null,
        ip: req.ip
      }
    })
    .catch((loggingError) => {
      console.error(MESSAGE_BUILDERS.apiErrorFallback, loggingError);
    });
};

export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new AppError(
      ERROR_MESSAGES.COMMON.ROUTE_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.ROUTE_NOT_FOUND
    )
  );
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    logApiError(_req, error);

    return res.status(error.statusCode).json({
      success: RESPONSE_FLAG.ERROR,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null
      }
    });
  }

  const internalError = new AppError(
    ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR
  );

  logApiError(_req, internalError);
  console.error(error);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: RESPONSE_FLAG.ERROR,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    }
  });
};
