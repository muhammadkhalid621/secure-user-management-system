import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { ok } from "../lib/http-response.js";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { dashboardService } from "../modules/dashboard/dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const summary = await dashboardService.getSummary(req.auth!);

    ok(res, {
      data: summary
    });
  })
);
