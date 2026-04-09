import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import { SUCCESS_MESSAGES } from "../constants/messages.js";
import { asyncHandler } from "../lib/async-handler.js";
import { created, ok } from "../lib/http-response.js";
import { authService } from "../modules/auth/auth.service.js";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";
import { config } from "../config.js";
import {
  validateLoginBody,
  validateRefreshBody,
  validateRegisterBody
} from "../lib/validators.js";

export const authRouter = Router();

const authRateLimiter = createRateLimitMiddleware({
  keyPrefix: "rate-limit:auth",
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = validateRegisterBody(req.body);
    const result = await authService.register(body);

    created(res, {
      message: SUCCESS_MESSAGES.AUTH.REGISTERED,
      data: result
    });
  })
);

authRouter.post(
  "/login",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const body = validateLoginBody(req.body);
    const result = await authService.login(body);

    ok(res, {
      message: SUCCESS_MESSAGES.AUTH.LOGIN,
      data: result
    });
  })
);

authRouter.post(
  "/refresh",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const body = validateRefreshBody(req.body);
    const result = await authService.refresh(body.refreshToken);

    ok(res, {
      message: SUCCESS_MESSAGES.AUTH.REFRESH,
      data: result
    });
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  requirePermission(PERMISSIONS.AUTH_LOGOUT),
  authRateLimiter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = validateRefreshBody(req.body);
    await authService.logoutWithAudit(body.refreshToken, req.auth?.userId ?? null);

    ok(res, {
      message: SUCCESS_MESSAGES.AUTH.LOGOUT
    });
  })
);

authRouter.get(
  "/profile",
  requireAuth,
  requirePermission(PERMISSIONS.AUTH_PROFILE_READ),
  asyncHandler(async (req, res) => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const profile = await authService.getProfile(authenticatedRequest.auth!.userId);

    ok(res, {
      data: profile
    });
  })
);
