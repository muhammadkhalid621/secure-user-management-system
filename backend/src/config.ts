import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8000),
  appName: process.env.APP_NAME ?? "Mini Secure User Management API",
  apiPrefix: process.env.API_PREFIX ?? "api",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8001",
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? "sums_db",
    user: process.env.DB_USER ?? "sums_user",
    password: process.env.DB_PASSWORD ?? "sums_password",
    logging: process.env.DB_LOGGING === "true",
    pool: {
      max: Number(process.env.DB_POOL_MAX ?? 10),
      min: Number(process.env.DB_POOL_MIN ?? 0),
      acquire: Number(process.env.DB_POOL_ACQUIRE ?? 30000),
      idle: Number(process.env.DB_POOL_IDLE ?? 10000)
    }
  },
  redis: {
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? "",
    db: Number(process.env.REDIS_DB ?? 0),
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
  },
  bull: {
    prefix: process.env.BULL_PREFIX ?? "sums",
    authQueue: process.env.BULL_AUTH_QUEUE ?? "auth",
    notificationsQueue:
      process.env.BULL_NOTIFICATIONS_QUEUE ?? "notifications",
    connectionName: process.env.BULL_CONNECTION_NAME ?? "sums-bull",
    defaults: {
      attempts: Number(process.env.BULL_DEFAULT_JOB_ATTEMPTS ?? 3),
      backoffMs: Number(process.env.BULL_DEFAULT_JOB_BACKOFF_MS ?? 1000)
    }
  },
  cache: {
    defaultTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 60),
    usersTtlSeconds: Number(process.env.CACHE_USERS_TTL_SECONDS ?? 120),
    authProfileTtlSeconds: Number(
      process.env.CACHE_AUTH_PROFILE_TTL_SECONDS ?? 60
    )
  },
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN ?? "http://localhost:8001",
    notificationEvent:
      process.env.SOCKET_NOTIFICATION_EVENT ?? "notification",
    authRequired: process.env.SOCKET_AUTH_REQUIRED !== "false"
  },
  pagination: {
    defaultPage: Number(process.env.PAGINATION_DEFAULT_PAGE ?? 1),
    defaultLimit: Number(process.env.PAGINATION_DEFAULT_LIMIT ?? 10),
    maxLimit: Number(process.env.PAGINATION_MAX_LIMIT ?? 100)
  },
  rateLimit: {
    auth: {
      windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 60000),
      max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 5)
    },
    api: {
      windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS ?? 60000),
      max: Number(process.env.API_RATE_LIMIT_MAX ?? 120)
    }
  },
  jwtAccessSecret: required(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required(
    process.env.JWT_REFRESH_SECRET,
    "JWT_REFRESH_SECRET"
  ),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"
};
