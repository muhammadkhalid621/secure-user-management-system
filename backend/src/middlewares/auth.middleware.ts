import type { NextFunction, Request, Response } from "express";
import type { AuthContext } from "../modules/auth/auth.types.js";
import {
  getBearerToken,
  resolveAccessTokenAuth
} from "../modules/auth/access-token.service.js";

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  Promise.resolve()
    .then(async () => {
      req.auth = await resolveAccessTokenAuth(getBearerToken(req.headers.authorization));
      return next();
    })
    .catch((error) => next(error));
};
