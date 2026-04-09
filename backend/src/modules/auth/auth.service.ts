import { createHash } from "node:crypto";
import { AUTH_TOKEN_TYPES } from "../../constants/auth.js";
import { config } from "../../config.js";
import { CACHE_KEYS } from "../../constants/cache.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES, MESSAGE_BUILDERS, SUCCESS_MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../errors/app-error.js";
import { cacheService } from "../../lib/cache.service.js";
import { signJwt, verifyJwt } from "../../lib/jwt.js";
import { verifyPassword } from "../../lib/password.js";
import { notificationService } from "../notifications/notification.service.js";
import { authEventService } from "./auth-event.service.js";
import { authContextService } from "./auth-context.service.js";
import { refreshTokenStoreService } from "./refresh-token-store.service.js";
import { userService } from "../users/user.service.js";
import type { SafeUser } from "../users/user.types.js";
import type { AuthTokenPayload } from "./auth.types.js";

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const getRemainingTokenTtlSeconds = (payload: Pick<AuthTokenPayload, "exp">) =>
  Math.max(1, payload.exp - Math.floor(Date.now() / 1000));

const createPayload = (user: SafeUser, type: "access" | "refresh"): AuthTokenPayload => ({
  sub: user.id,
  email: user.email,
  type,
  exp: 0,
  iat: 0
});

const readTokenPayload = (token: string, secret: string): AuthTokenPayload => {
  const payload = verifyJwt(token, secret) as Record<string, unknown>;

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    (payload.type !== "access" && payload.type !== "refresh")
  ) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.INVALID_TOKEN_PAYLOAD,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN
    );
  }

  return {
    sub: payload.sub,
    email: payload.email,
    type: payload.type,
    exp: payload.exp as number,
    iat: payload.iat as number
  };
};

export class AuthService {
  async register(input: { name: string; email: string; password: string }) {
    const user = await userService.createFromInput({
      name: input.name,
      email: input.email,
      password: input.password
    });

    await authEventService.enqueue({
      action: "auth.register",
      message: SUCCESS_MESSAGES.AUTH.REGISTERED,
      actorUserId: user.id,
      entityId: user.id,
      metadata: {
        email: user.email
      }
    });

    return this.buildAuthResponse(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await userService.findByEmail(input.email);

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      await authEventService.enqueue({
        action: "auth.login.failed",
        message: MESSAGE_BUILDERS.failedLoginAttempt,
        level: "warn",
        metadata: {
          email: input.email
        }
      });
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const safeUser = await userService.findSafeByIdOrThrow(user.id);
    await Promise.all([
      authEventService.enqueue({
        action: "auth.login.success",
        message: SUCCESS_MESSAGES.AUTH.LOGIN,
        actorUserId: safeUser.id,
        entityId: safeUser.id,
        metadata: {
          email: safeUser.email
        }
      }),
      notificationService.enqueue({
        event: "auth.login.success",
        message: MESSAGE_BUILDERS.successfulLoginNotification,
        entityType: "auth",
        entityId: safeUser.id,
        actorUserId: safeUser.id,
        payload: {
          user: safeUser
        }
      })
    ]);

    return this.buildAuthResponse(safeUser);
  }

  async refresh(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);

    if (await refreshTokenStoreService.isRevoked(hashedToken)) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_REFRESH_TOKEN
      );
    }

    const payload = readTokenPayload(refreshToken, config.jwtRefreshSecret);

    if (payload.type !== AUTH_TOKEN_TYPES.REFRESH) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_REFRESH_TOKEN_TYPE,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_REFRESH_TOKEN
      );
    }

    if (!(await refreshTokenStoreService.isActive(hashedToken))) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_REFRESH_TOKEN
      );
    }

    await refreshTokenStoreService.revoke(
      hashedToken,
      getRemainingTokenTtlSeconds(payload)
    );

    const user = await userService.findSafeByIdOrThrow(payload.sub);
    await authEventService.enqueue({
      action: "auth.refresh",
      message: SUCCESS_MESSAGES.AUTH.REFRESH,
      actorUserId: user.id,
      entityId: user.id
    });
    return this.buildAuthResponse(user);
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    try {
      const payload = readTokenPayload(refreshToken, config.jwtRefreshSecret);
      await refreshTokenStoreService.revoke(
        tokenHash,
        getRemainingTokenTtlSeconds(payload)
      );
    } catch {
      await refreshTokenStoreService.removeActive(tokenHash);
    }
  }

  async logoutWithAudit(refreshToken: string, actorUserId?: string | null) {
    await this.logout(refreshToken);
    await authEventService.enqueue({
      action: "auth.logout",
      message: SUCCESS_MESSAGES.AUTH.LOGOUT,
      actorUserId: actorUserId ?? null,
      entityId: actorUserId ?? null
    });
  }

  async getProfile(userId: string) {
    const cacheKey = CACHE_KEYS.auth.profile(userId);
    const cached = await cacheService.get<SafeUser>(cacheKey);

    if (cached) {
      return cached;
    }

    const profile = await userService.findSafeByIdOrThrow(userId);
    await cacheService.set(
      cacheKey,
      profile,
      config.cache.authProfileTtlSeconds
    );

    return profile;
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    const payload = readTokenPayload(token, config.jwtAccessSecret);

    if (payload.type !== AUTH_TOKEN_TYPES.ACCESS) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_ACCESS_TOKEN_TYPE,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_TOKEN
      );
    }

    return payload;
  }

  resolveAuthContext(userId: string) {
    return authContextService.resolve(userId);
  }

  private async buildAuthResponse(user: SafeUser) {
    const accessToken = signJwt(
      createPayload(user, AUTH_TOKEN_TYPES.ACCESS),
      config.jwtAccessSecret,
      config.jwtAccessExpiresIn
    );
    const refreshToken = signJwt(
      createPayload(user, AUTH_TOKEN_TYPES.REFRESH),
      config.jwtRefreshSecret,
      config.jwtRefreshExpiresIn
    );

    const refreshPayload = readTokenPayload(
      refreshToken,
      config.jwtRefreshSecret
    );
    await refreshTokenStoreService.storeActive(
      hashToken(refreshToken),
      user.id,
      getRemainingTokenTtlSeconds(refreshPayload)
    );

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpiresIn: config.jwtAccessExpiresIn,
        refreshTokenExpiresIn: config.jwtRefreshExpiresIn
      }
    };
  }
}

export const authService = new AuthService();
