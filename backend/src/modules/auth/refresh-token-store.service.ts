import { AUTH_REDIS_KEYS } from "../../constants/auth.js";
import { redisConnection } from "../../queues/redis.js";

export class RefreshTokenStoreService {
  async storeActive(
    tokenHash: string,
    userId: string,
    ttlSeconds: number
  ): Promise<void> {
    await redisConnection.set(
      AUTH_REDIS_KEYS.refreshActive(tokenHash),
      userId,
      "EX",
      ttlSeconds
    );
  }

  async isActive(tokenHash: string): Promise<boolean> {
    const exists = await redisConnection.exists(
      AUTH_REDIS_KEYS.refreshActive(tokenHash)
    );

    return exists === 1;
  }

  async isRevoked(tokenHash: string): Promise<boolean> {
    const exists = await redisConnection.exists(
      AUTH_REDIS_KEYS.refreshRevoked(tokenHash)
    );

    return exists === 1;
  }

  async revoke(tokenHash: string, ttlSeconds: number): Promise<void> {
    await Promise.all([
      redisConnection.del(AUTH_REDIS_KEYS.refreshActive(tokenHash)),
      redisConnection.set(
        AUTH_REDIS_KEYS.refreshRevoked(tokenHash),
        "1",
        "EX",
        ttlSeconds
      )
    ]);
  }

  async removeActive(tokenHash: string): Promise<void> {
    await redisConnection.del(AUTH_REDIS_KEYS.refreshActive(tokenHash));
  }
}

export const refreshTokenStoreService = new RefreshTokenStoreService();

