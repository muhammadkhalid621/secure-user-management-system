import type { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { AppError } from "../errors/app-error.js";
import { redisConnection } from "../queues/redis.js";

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  max: number;
};

const getClientIp = (req: Request): string =>
  req.ip || req.socket.remoteAddress || "unknown";

export const createRateLimitMiddleware =
  ({ keyPrefix, windowMs, max }: RateLimitOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyPrefix}:${getClientIp(req)}:${req.method}:${req.baseUrl}${req.path}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    Promise.resolve()
      .then(async () => {
        const current = await redisConnection.incr(key);

        if (current === 1) {
          await redisConnection.expire(key, windowSeconds);
        }

        const ttl = await redisConnection.ttl(key);
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - current)));
        res.setHeader("X-RateLimit-Reset", String(ttl));

        if (current > max) {
          throw new AppError(
            ERROR_MESSAGES.COMMON.RATE_LIMIT_EXCEEDED,
            HTTP_STATUS.TOO_MANY_REQUESTS,
            ERROR_CODES.RATE_LIMIT_EXCEEDED
          );
        }

        next();
      })
      .catch((error) => next(error));
  };
