import type { Request, RequestHandler } from "express";
import { cacheService } from "../lib/cache.service.js";

type CacheOptions = {
  ttlSeconds: number;
  key: (req: Request) => string | Promise<string>;
};

export const cacheMiddleware = ({
  ttlSeconds,
  key
}: CacheOptions): RequestHandler => {
  return async (req, res, next) => {
    const cacheKey = await key(req);
    const cached = await cacheService.get<unknown>(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void cacheService.set(cacheKey, body, ttlSeconds);
      }

      return originalJson(body);
    }) as typeof res.json;

    return next();
  };
};

