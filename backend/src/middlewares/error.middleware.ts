import type { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS, RESPONSE_FLAG } from "../constants/http.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { AppError } from "../errors/app-error.js";

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
    return res.status(error.statusCode).json({
      success: RESPONSE_FLAG.ERROR,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null
      }
    });
  }

  console.error(error);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: RESPONSE_FLAG.ERROR,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    }
  });
};
