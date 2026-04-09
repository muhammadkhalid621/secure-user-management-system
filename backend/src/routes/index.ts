import { Router } from "express";
import { config } from "../config.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";
import { authRouter } from "./auth.routes.js";
import { rolesRouter } from "./roles.routes.js";
import { usersRouter } from "./users.routes.js";

export const apiRouter = Router();

apiRouter.use(
  createRateLimitMiddleware({
    keyPrefix: "rate-limit:api",
    windowMs: config.rateLimit.api.windowMs,
    max: config.rateLimit.api.max
  })
);

apiRouter.use("/auth", authRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/users", usersRouter);
