import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimitMiddleware } from "../../src/middlewares/rate-limit.middleware.js";
import { createMockContext } from "../helpers/router.js";

const { redisMock } = vi.hoisted(() => ({
  redisMock: {
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn()
  }
}));

vi.mock("../../src/queues/redis.js", () => ({
  redisConnection: redisMock
}));

describe("rate limit middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows request under limit", async () => {
    redisMock.incr.mockResolvedValue(1);
    redisMock.expire.mockResolvedValue(1);
    redisMock.ttl.mockResolvedValue(60);

    const middleware = createRateLimitMiddleware({
      keyPrefix: "test",
      windowMs: 60000,
      max: 5
    });
    const { req, res } = createMockContext();

    await new Promise<void>((resolve, reject) => {
      middleware(req as never, res as never, (error?: unknown) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    expect(res.headers["X-RateLimit-Limit"]).toBe("5");
  });

  it("blocks request over limit", async () => {
    redisMock.incr.mockResolvedValue(6);
    redisMock.ttl.mockResolvedValue(60);

    const middleware = createRateLimitMiddleware({
      keyPrefix: "test",
      windowMs: 60000,
      max: 5
    });
    const { req, res } = createMockContext();

    await expect(
      new Promise<void>((resolve, reject) => {
        middleware(req as never, res as never, (error?: unknown) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
    ).rejects.toMatchObject({
      code: "RATE_LIMIT_EXCEEDED"
    });
  });
});
