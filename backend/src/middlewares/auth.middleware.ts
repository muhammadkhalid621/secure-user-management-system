import type { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { AppError } from "../errors/app-error.js";
import { authService } from "../modules/auth/auth.service.js";
import type { AuthContext } from "../modules/auth/auth.types.js";

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(
      new AppError(
        ERROR_MESSAGES.COMMON.MISSING_BEARER_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    );
  }

  const token = authorization.replace("Bearer ", "").trim();

  Promise.resolve()
    .then(async () => {
      const payload = authService.verifyAccessToken(token);
      req.auth = await authService.resolveAuthContext(payload.sub);
      return next();
    })
    .catch((error) => next(error));
};
