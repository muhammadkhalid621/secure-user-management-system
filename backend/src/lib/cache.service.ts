import { redisConnection } from "../queues/redis.js";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisConnection.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redisConnection.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await redisConnection.del(key);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    let cursor = "0";
    const keys: string[] = [];

    do {
      const [nextCursor, batch] = await redisConnection.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== "0");

    if (keys.length > 0) {
      await redisConnection.del(...keys);
    }
  }
}

export const cacheService = new CacheService();

